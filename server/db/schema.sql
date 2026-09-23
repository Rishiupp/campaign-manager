CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  subject TEXT,
  body_html TEXT,
  body_text TEXT,
  variables_json TEXT,
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  channel TEXT NOT NULL,
  category TEXT,
  template_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  scheduled_at DATETIME,
  total_leads INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  FOREIGN KEY (template_id) REFERENCES templates (id)
);

CREATE TABLE IF NOT EXISTS campaign_leads (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  email TEXT,
  name TEXT,
  mobile TEXT,
  data_json TEXT,
  status TEXT DEFAULT 'pending',
  sent_at DATETIME,
  error TEXT,
  sender_used TEXT,
  FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
);

CREATE TABLE IF NOT EXISTS email_logs (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  lead_id TEXT NOT NULL,
  sender_email TEXT,
  receiver_email TEXT,
  status TEXT,
  error TEXT,
  message_id TEXT,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns (id),
  FOREIGN KEY (lead_id) REFERENCES campaign_leads (id)
);

CREATE TABLE IF NOT EXISTS sms_logs (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  lead_id TEXT NOT NULL,
  twilio_sid TEXT,
  from_number TEXT,
  to_number TEXT,
  status TEXT,
  error TEXT,
  credits_used INTEGER DEFAULT 0,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns (id),
  FOREIGN KEY (lead_id) REFERENCES campaign_leads (id)
);

CREATE TABLE IF NOT EXISTS wallet (
  id TEXT PRIMARY KEY,
  balance INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  status TEXT DEFAULT 'pending',
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS smtp_accounts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  display_name TEXT,
  is_active INTEGER DEFAULT 1,
  daily_sent_count INTEGER DEFAULT 0,
  last_sent_at DATETIME
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
