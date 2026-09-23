import express from 'express';
import db from '../db/database.js';
import emailSender from '../services/emailSender.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsObj = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', (req, res) => {
  try {
    const insertStmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    db.transaction(() => {
      for (const [key, value] of Object.entries(req.body)) {
        insertStmt.run(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    })();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/smtp-status', async (req, res) => {
  try {
    const status = [];
    for (const account of emailSender.accounts) {
      const transporter = emailSender.getTransporter(account);
      try {
        await transporter.verify();
        status.push({ email: account.email, status: 'ok' });
      } catch (err) {
        status.push({ email: account.email, status: 'error', message: err.message });
      }
    }
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/twilio-status', (req, res) => {
  const hasKeys = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_MESSAGING_SERVICE_SID);
  res.json({ status: hasKeys ? 'ok' : 'missing_credentials' });
});

router.get('/overview', (req, res) => {
  try {
    const campaignsCount = db.prepare('SELECT count(*) as count FROM campaigns').get().count;
    const leadsCount = db.prepare('SELECT count(*) as count FROM campaign_leads').get().count;
    const emailsSent = db.prepare('SELECT count(*) as count FROM email_logs').get().count;
    const smsSent = db.prepare('SELECT count(*) as count FROM sms_logs').get().count;
    
    res.json({
      campaignsCount,
      leadsCount,
      emailsSent,
      smsSent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
