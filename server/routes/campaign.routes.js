import express from 'express';
import db from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
import creditService from '../services/creditService.js';
// We'll import queue workers once they are created

const router = express.Router();

router.post('/', (req, res) => {
  const { name, channel, category, template_id } = req.body;
  const id = uuidv4();
  try {
    db.prepare('INSERT INTO campaigns (id, name, channel, category, template_id) VALUES (?, ?, ?, ?, ?)').run(id, name, channel, category, template_id);
    res.status(201).json({ id, name, channel, status: 'draft' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', (req, res) => {
  try {
    const campaigns = db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all();
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Not found' });
    const leads = db.prepare('SELECT * FROM campaign_leads WHERE campaign_id = ?').all(req.params.id);
    res.json({ ...campaign, leads });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/start', (req, res) => {
  const { id } = req.params;
  try {
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
    if (!campaign) return res.status(404).json({ error: 'Not found' });
    
    const pendingLeads = db.prepare('SELECT count(*) as count FROM campaign_leads WHERE campaign_id = ? AND status = "pending"').get(id);
    const leadsCount = pendingLeads.count;
    
    if (leadsCount === 0) return res.status(400).json({ error: 'No pending leads to send' });

    // Check credits for SMS/RCS
    if (campaign.channel === 'sms' || campaign.channel === 'rcs') {
      const multiplier = campaign.channel === 'rcs' ? 2 : 1;
      const creditsNeeded = leadsCount * multiplier;
      
      if (!creditService.checkBalance(creditsNeeded)) {
        return res.status(402).json({ error: 'Insufficient credits', required: creditsNeeded });
      }
      creditService.holdCredits(id, creditsNeeded);
    }

    db.prepare('UPDATE campaigns SET status = "running" WHERE id = ?').run(id);
    
    // Enqueue jobs
    const leads = db.prepare('SELECT * FROM campaign_leads WHERE campaign_id = ? AND status = "pending"').all(id);
    const queueName = campaign.channel === 'email' ? 'emailQueue' 
                    : campaign.channel === 'sms' ? 'smsQueue' 
                    : 'rcsQueue';
                    
    const { Queue } = await import('bullmq');
    const { default: IORedis } = await import('ioredis');
    const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
    const campaignQueue = new Queue(queueName, { connection });
    
    for (const lead of leads) {
      const jobData = {
        campaignId: id,
        leadId: lead.id,
        templateId: campaign.template_id,
        to: campaign.channel === 'email' ? lead.email : lead.mobile,
        name: lead.name,
        dataJson: lead.data_json
      };
      await campaignQueue.add(`job-${lead.id}`, jobData);
    }
    
    res.json({ status: 'running', message: 'Campaign started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/pause', (req, res) => {
  try {
    db.prepare('UPDATE campaigns SET status = "paused" WHERE id = ?').run(req.params.id);
    res.json({ status: 'paused' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM campaign_leads WHERE campaign_id = ?').run(req.params.id);
    db.prepare('DELETE FROM campaigns WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
