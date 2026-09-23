import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import db from '../db/database.js';
import rcsSender from '../services/rcsSender.js';
import creditService from '../services/creditService.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '../../.env' });

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const rcsWorker = new Worker('rcsQueue', async job => {
  const { campaignId, leadId, templateId, to, dataJson } = job.data;
  
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(templateId);
  if (!template) throw new Error('Template not found');

  const leadData = JSON.parse(dataJson || '{}');
  
  // Send RCS (assuming body_html contains the Content SID for Twilio)
  const contentSid = template.body_html.trim();
  const result = await rcsSender.sendRCS(to, contentSid, JSON.stringify(leadData));
  
  const creditsUsed = result.success ? 2 : 0; // RCS costs 2 credits
  
  if (result.success) {
    creditService.debitCredit(campaignId, leadId, creditsUsed);
  } else {
    // Refund the pre-held credits (2 for RCS)
    creditService.refundCredits(campaignId, 2);
  }

  // Log it
  db.prepare(`
    INSERT INTO sms_logs (id, campaign_id, lead_id, twilio_sid, to_number, status, error, credits_used)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), campaignId, leadId, result.sid || null, to, result.success ? 'queued' : 'failed', result.error || null, creditsUsed);

  // Update lead status
  db.prepare('UPDATE campaign_leads SET status = ?, sent_at = CURRENT_TIMESTAMP, error = ? WHERE id = ?')
    .run(result.success ? 'queued' : 'failed', result.error || null, leadId);

  // Update campaign stats
  if (result.success) {
    db.prepare('UPDATE campaigns SET sent_count = sent_count + 1 WHERE id = ?').run(campaignId);
  } else {
    db.prepare('UPDATE campaigns SET failed_count = failed_count + 1 WHERE id = ?').run(campaignId);
  }

  const minDelay = parseInt(process.env.SMS_MIN_DELAY_MS || 500);
  const maxDelay = parseInt(process.env.SMS_MAX_DELAY_MS || 2000);
  const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  await new Promise(resolve => setTimeout(resolve, delay));
}, { connection });

console.log('RCS Worker started');

export default rcsWorker;
