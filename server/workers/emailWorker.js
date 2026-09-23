import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import db from '../db/database.js';
import emailSender from '../services/emailSender.js';
import templateEngine from '../services/templateEngine.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '../../.env' });

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const emailWorker = new Worker('emailQueue', async job => {
  const { campaignId, leadId, templateId, to, name, dataJson } = job.data;
  
  // Fetch template
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(templateId);
  if (!template) throw new Error('Template not found');

  const leadData = JSON.parse(dataJson || '{}');
  
  const subject = templateEngine.interpolate(template.subject, leadData);
  const html = templateEngine.interpolate(template.body_html, leadData);
  const text = templateEngine.interpolate(template.body_text, leadData);

  // Send Email
  const result = await emailSender.sendEmail(to, subject, html, text, campaignId);
  
  // Log it
  db.prepare(`
    INSERT INTO email_logs (id, campaign_id, lead_id, sender_email, receiver_email, status, error, message_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), campaignId, leadId, result.sender, to, result.success ? 'sent' : 'failed', result.error || null, result.messageId || null);

  // Update lead status
  db.prepare('UPDATE campaign_leads SET status = ?, sent_at = CURRENT_TIMESTAMP, error = ?, sender_used = ? WHERE id = ?')
    .run(result.success ? 'sent' : 'failed', result.error || null, result.sender, leadId);

  // Update campaign stats
  if (result.success) {
    db.prepare('UPDATE campaigns SET sent_count = sent_count + 1 WHERE id = ?').run(campaignId);
  } else {
    db.prepare('UPDATE campaigns SET failed_count = failed_count + 1 WHERE id = ?').run(campaignId);
  }

  // Artificial delay to avoid rate limits
  const minDelay = parseInt(process.env.EMAIL_MIN_DELAY_MS || 5000);
  const maxDelay = parseInt(process.env.EMAIL_MAX_DELAY_MS || 15000);
  const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  await new Promise(resolve => setTimeout(resolve, delay));
}, { connection });

console.log('Email Worker started');

export default emailWorker;
