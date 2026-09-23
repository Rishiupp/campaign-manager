import db from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

class CreditService {
  getWallet() {
    return db.prepare('SELECT * FROM wallet LIMIT 1').get();
  }

  checkBalance(amountRequired) {
    const wallet = this.getWallet();
    return wallet && wallet.balance >= amountRequired;
  }

  holdCredits(campaignId, amount) {
    // In a real app we might create a held status in a ledger, here we just debit it.
    const stmt = db.prepare('UPDATE wallet SET balance = balance - ? WHERE balance >= ?');
    const result = stmt.run(amount, amount);
    if (result.changes === 0) throw new Error('Insufficient credits');
    return true;
  }

  debitCredit(campaignId, leadId, amount) {
    // ALready held, no need to deduct again unless we didn't hold beforehand
    // Record to sms_logs happens separately
    return true;
  }

  refundCredits(campaignId, amount) {
    const stmt = db.prepare('UPDATE wallet SET balance = balance + ?');
    stmt.run(amount);
  }

  addCredits(amount, description = 'Purchase') {
    const stmt = db.prepare('UPDATE wallet SET balance = balance + ?');
    stmt.run(amount);
  }

  recordTransaction(type, amount, credits, razorpayOrderId, razorpayPaymentId, status, description) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO transactions 
      (id, type, amount, credits, razorpay_order_id, razorpay_payment_id, status, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, type, amount, credits, razorpayOrderId, razorpayPaymentId, status, description);
    return id;
  }
}

export default new CreditService();
