import express from 'express';
import db from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
import templateEngine from '../services/templateEngine.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const templates = db.prepare('SELECT * FROM templates ORDER BY created_at DESC').all();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  const { name, channel, subject, body_html, body_text, category } = req.body;
  const id = uuidv4();
  
  // Auto-extract variables
  const textToScan = body_html || body_text || '';
  const variables = templateEngine.extractVariables(textToScan);
  
  try {
    db.prepare('INSERT INTO templates (id, name, channel, subject, body_html, body_text, variables_json, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, channel, subject, body_html, body_text, JSON.stringify(variables), category);
    res.status(201).json({ id, name, channel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/preview', (req, res) => {
  try {
    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
    if (!template) return res.status(404).json({ error: 'Not found' });
    
    const sampleData = req.body.data || {};
    
    const preview = {
      subject: template.subject ? templateEngine.interpolate(template.subject, sampleData) : null,
      body_html: template.body_html ? templateEngine.interpolate(template.body_html, sampleData) : null,
      body_text: template.body_text ? templateEngine.interpolate(template.body_text, sampleData) : null
    };
    
    res.json(preview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
