import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

class EmailSender {
  constructor() {
    this.accounts = [];
    this.currentIndex = 0;
    this.initAccounts();
  }

  initAccounts() {
    let index = 1;
    while (process.env[`SMTP_ACCOUNT_${index}_EMAIL`]) {
      this.accounts.push({
        email: process.env[`SMTP_ACCOUNT_${index}_EMAIL`],
        pass: process.env[`SMTP_ACCOUNT_${index}_PASS`],
        host: process.env[`SMTP_ACCOUNT_${index}_HOST`],
        port: parseInt(process.env[`SMTP_ACCOUNT_${index}_PORT`]),
        displayName: process.env[`SMTP_ACCOUNT_${index}_DISPLAY_NAME`] || 'Campaign Team'
      });
      index++;
    }
    
    if (this.accounts.length === 0) {
      console.warn('No SMTP accounts found in environment.');
    }
  }

  getTransporter(account) {
    return nodemailer.createTransport({
      host: account.host,
      port: account.port,
      secure: account.port === 465,
      auth: {
        user: account.email,
        pass: account.pass
      }
    });
  }

  async sendEmail(to, subject, html, text, campaignId = null) {
    if (this.accounts.length === 0) throw new Error('No SMTP accounts available');

    // Round-robin selection
    const account = this.accounts[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.accounts.length;

    const transporter = this.getTransporter(account);
    
    // Plus-aliasing support
    let fromEmail = account.email;
    if (campaignId && fromEmail.includes('@gmail.com')) {
      const [user, domain] = fromEmail.split('@');
      fromEmail = `${user}+c${campaignId}@${domain}`;
    }

    const mailOptions = {
      from: `"${account.displayName}" <${fromEmail}>`,
      to,
      subject,
      html,
      text
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId, sender: fromEmail };
    } catch (error) {
      console.error(`Error sending email via ${fromEmail}:`, error);
      return { success: false, error: error.message, sender: fromEmail };
    }
  }
}

export default new EmailSender();
