import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import creditService from './creditService.js';
import db from '../db/database.js';

dotenv.config({ path: '../../.env' });

class PaymentService {
  constructor() {
    this.razorpay = null;
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
    } else {
      console.warn('Razorpay credentials missing. Payments will fail.');
    }

    this.plans = {
      100: { amount: 10000, credits: 100 },
      500: { amount: 50000, credits: 550 },
      1000: { amount: 100000, credits: 1200 }
    };
  }

  getPlans() {
    return this.plans;
  }

  async createOrder(planKey) {
    if (!this.razorpay) throw new Error('Razorpay not configured');
    
    const plan = this.plans[planKey];
    if (!plan) throw new Error('Invalid plan');

    const options = {
      amount: plan.amount, // amount in the smallest currency unit
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    try {
      const order = await this.razorpay.orders.create(options);
      
      // Log pending transaction
      creditService.recordTransaction('credit', plan.amount / 100, plan.credits, order.id, null, 'pending', `Purchase ${plan.credits} credits`);
      
      return order;
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      throw error;
    }
  }

  verifySignature(body, signature) {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest('hex');

    return expectedSignature === signature;
  }

  handleWebhook(body) {
    if (body.event === 'payment.captured') {
      const payment = body.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      
      // Find pending transaction
      const txn = db.prepare('SELECT * FROM transactions WHERE razorpay_order_id = ? AND status = "pending"').get(orderId);
      
      if (txn) {
        // Mark captured
        db.prepare('UPDATE transactions SET status = "captured", razorpay_payment_id = ? WHERE id = ?').run(paymentId, txn.id);
        
        // Add credits idempotently
        creditService.addCredits(txn.credits, 'Razorpay purchase');
        return true;
      }
    }
    return false;
  }
}

export default new PaymentService();
