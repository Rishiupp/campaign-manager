import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

class RCSSender {
  constructor() {
    this.client = null;
    this.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    } else {
      console.warn('Twilio credentials missing. RCS sending will fail.');
    }
  }

  async sendRCS(to, contentSid, contentVariables = "{}") {
    if (!this.client) throw new Error('Twilio client not initialized');
    
    try {
      // Using Twilio Content API for RCS
      const message = await this.client.messages.create({
        contentSid: contentSid,
        contentVariables: contentVariables,
        messagingServiceSid: this.messagingServiceSid,
        to: to,
        statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL
      });
      return { success: true, sid: message.sid };
    } catch (error) {
      console.error('Error sending RCS:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new RCSSender();
