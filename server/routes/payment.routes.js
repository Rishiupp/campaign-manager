import express from 'express';
import paymentService from '../services/paymentService.js';
import creditService from '../services/creditService.js';
import db from '../db/database.js';

const router = express.Router();

router.get('/wallet', (req, res) => {
  try {
    const wallet = creditService.getWallet();
    const transactions = db.prepare('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 50').all();
    res.json({ balance: wallet ? wallet.balance : 0, transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/plans', (req, res) => {
  res.json(paymentService.getPlans());
});

router.post('/create-order', async (req, res) => {
  try {
    const { planKey } = req.body;
    const order = await paymentService.createOrder(planKey);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify', (req, res) => {
  // Normally frontend sends razorpay_payment_id, razorpay_order_id, razorpay_signature
  // But webhook is safer. We can implement this as a fallback.
  res.json({ success: true, message: 'Payment verification handled via webhook' });
});

export default router;
