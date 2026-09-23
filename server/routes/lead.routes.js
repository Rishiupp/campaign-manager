import express from 'express';
import multer from 'multer';
import db from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
import fileParser from '../services/fileParser.js';

const router = express.Router({ mergeParams: true });
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), (req, res) => {
  const { id } = req.params; // campaign id
  
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const leads = fileParser.parse(req.file.buffer, req.file.originalname);
    
    const insertLead = db.prepare('INSERT INTO campaign_leads (id, campaign_id, email, name, mobile, data_json) VALUES (?, ?, ?, ?, ?, ?)');
    
    db.transaction(() => {
      for (const lead of leads) {
        insertLead.run(uuidv4(), id, lead.email || null, lead.name || null, lead.mobile || null, JSON.stringify(lead));
      }
    })();
    
    // Update campaign total_leads
    db.prepare('UPDATE campaigns SET total_leads = total_leads + ? WHERE id = ?').run(leads.length, id);
    
    res.json({ success: true, count: leads.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/dummy', (req, res) => {
  const { id } = req.params;
  try {
    const leads = [
      { email: 'demo1@example.com', name: 'Rahul Sharma', mobile: '+919876543210' },
      { email: 'demo2@example.com', name: 'Priya Singh', mobile: '+919876543211' }
    ];
    
    const insertLead = db.prepare('INSERT INTO campaign_leads (id, campaign_id, email, name, mobile, data_json) VALUES (?, ?, ?, ?, ?, ?)');
    db.transaction(() => {
      for (const lead of leads) {
        insertLead.run(uuidv4(), id, lead.email, lead.name, lead.mobile, JSON.stringify(lead));
      }
    })();
    
    db.prepare('UPDATE campaigns SET total_leads = total_leads + ? WHERE id = ?').run(leads.length, id);
    res.json({ success: true, count: leads.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', (req, res) => {
  try {
    const leads = db.prepare('SELECT * FROM campaign_leads WHERE campaign_id = ?').all(req.params.id);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
