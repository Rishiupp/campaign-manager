import express from 'express';
import paymentService from '../services/paymentService.js';
import db from '../db/database.js';
import creditService from '../services/creditService.js';

const router = express.Router();

router.post('/razorpay', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = req.body;

  try {
    const isValid = paymentService.verifySignature(JSON.parse(body.toString()), signature);
    if (!isValid) return res.status(400).send('Invalid signature');

    const handled = paymentService.handleWebhook(JSON.parse(body.toString()));
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Webhook Error');
  }
});

router.post('/twilio', (req, res) => {
  const { MessageSid, MessageStatus } = req.body;
  try {
    if (MessageSid && MessageStatus) {
      db.prepare('UPDATE sms_logs SET status = ? WHERE twilio_sid = ?').run(MessageStatus, MessageSid);
      
      // If failed, refund credits
      if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
        const log = db.prepare('SELECT * FROM sms_logs WHERE twilio_sid = ?').get(MessageSid);
        if (log && log.credits_used > 0) {
          creditService.refundCredits(log.campaign_id, log.credits_used);
        }
      }
    }
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Error processing Twilio webhook');
  }
});

export default router;
