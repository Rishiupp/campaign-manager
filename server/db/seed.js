import db from './database.js';
import { v4 as uuidv4 } from 'uuid';

const seedDatabase = () => {
  // Check if wallet exists, if not create demo wallet
  const walletExists = db.prepare('SELECT COUNT(*) as count FROM wallet').get();
  if (walletExists.count === 0) {
    db.prepare('INSERT INTO wallet (id, balance) VALUES (?, ?)').run(uuidv4(), 50);
    console.log('Seeded demo wallet with 50 credits');
  }

  // Check templates
  const templateCount = db.prepare('SELECT COUNT(*) as count FROM templates').get();
  if (templateCount.count === 0) {
    const templates = [
      { id: uuidv4(), name: 'Welcome Email', channel: 'email', subject: 'Welcome to our platform', body_html: '<p>Hi {{name}}, welcome!</p>', body_text: '', variables_json: '["name"]', category: 'marketing' },
      { id: uuidv4(), name: 'Promo SMS', channel: 'sms', subject: '', body_html: '', body_text: 'Hi {{name}}, get 20% off today!', variables_json: '["name"]', category: 'promotional' },
    ];
    const insertTemplate = db.prepare('INSERT INTO templates (id, name, channel, subject, body_html, body_text, variables_json, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    templates.forEach(t => insertTemplate.run(t.id, t.name, t.channel, t.subject, t.body_html, t.body_text, t.variables_json, t.category));
    console.log('Seeded templates');
  }
};

seedDatabase();
