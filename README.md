<p align="center">
  <img src="assets/logo.png" alt="Campaign Manager" width="120" height="120" style="border-radius: 24px;" />
</p>

<h1 align="center">Campaign Manager</h1>

<p align="center">
  <strong>Open-source, self-hosted multi-channel campaign platform.</strong><br/>
  Upload contacts → Pick a template → Launch emails, SMS & RCS — all from one console.
</p>

<p align="center">
  <a href="#-quick-start"><img src="https://img.shields.io/badge/Get_Started-30_seconds-14b8a6?style=for-the-badge" alt="Get Started" /></a>
  <a href="#-features"><img src="https://img.shields.io/badge/Channels-Email_·_SMS_·_RCS-3b82f6?style=for-the-badge" alt="Channels" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" /></a>
</p>

---

## What is this?

Campaign Manager is a **standalone, zero-login** campaign platform designed to be self-hosted by agencies, startups, and indie hackers who need to run Email, SMS, and RCS campaigns without paying for expensive SaaS tools like Mailchimp or Customer.io.

**You own the infrastructure. You bring your own SMTP and Twilio credentials. That's it.**

| Channel | Cost | Provider |
|---------|------|----------|
| 📧 **Email** | 🟢 Free | Your own SMTP (Gmail / SendGrid / any provider) |
| 📱 **SMS** | 💰 Credit-based | Twilio Programmable Messaging |
| 💬 **RCS** | 💰 Credit-based | Twilio Messaging Service (auto-fallback to SMS) |

---

## ✨ Features

### Campaign Engine
- **Upload & Go** — Drop an Excel/CSV file, columns auto-detected (email, name, mobile)
- **Dummy Data Mode** — 50 pre-loaded sample leads for instant testing
- **5-Step Builder** — Audience → Channel → Template → Variables → Review & Launch
- **Multi-Sender Rotation** — Configure N SMTP accounts; system round-robins with random delays
- **Rate Limiting** — Per-account hourly caps, configurable delays between sends
- **Real-Time Monitor** — Watch delivery status update live (auto-polls every 5s)

### Template System
- **`{{variable}}` Interpolation** — Works across Email HTML, SMS text, and RCS content
- **Auto Variable Detection** — Extracts placeholders from template body automatically
- **Live Preview** — See rendered output with sample data before sending
- **Channel-Specific Templates** — Email (HTML), SMS (160 char), RCS (rich cards)

### Payment & Credits
- **Wallet System** — Buy credits via Razorpay → Spend on SMS/RCS campaigns
- **Razorpay Integration** — Test mode out of the box, production with a key swap
- **Webhook Verification** — HMAC-SHA256 signature verification for payment security
- **Credit Packs** — Configurable pricing tiers with bonus credits
- **Auto-Refund** — Failed sends automatically refund credits to wallet

### White-Label Ready
- **Custom Branding** — Change product name, tagline, accent colour, logo
- **Accent Themes** — 7 curated colour palettes, instant live preview
- **Provider Status** — Real-time SMTP and Twilio connectivity checks

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  React Frontend                      │
│          Vite + TypeScript + Vanilla CSS             │
│   ┌──────┬──────────┬─────────┬────────┬─────────┐  │
│   │ Over │ Campaign │ Builder │Monitor │ Credits │  │
│   │ view │   List   │ Wizard  │  Live  │ + Pay   │  │
│   └──────┴──────────┴─────────┴────────┴─────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────┴──────────────────────────────┐
│                  Express.js API                      │
│  ┌──────────┬──────────┬───────────┬─────────────┐  │
│  │ Campaign │ Template │  Payment  │   Webhook   │  │
│  │  Routes  │  Routes  │  Routes   │   Routes    │  │
│  └────┬─────┴────┬─────┴─────┬─────┴──────┬──────┘  │
│       │          │           │            │          │
│  ┌────┴─────┬────┴────┬──────┴─────┬──────┴───────┐ │
│  │  Email   │  SMS    │  Credit    │  Razorpay    │ │
│  │  Sender  │  Sender │  Service   │  Service     │ │
│  │ (rotate) │(Twilio) │ (wallet)   │ (payments)   │ │
│  └────┬─────┴────┬────┴──────┬─────┴──────────────┘ │
│       │          │           │                       │
│  ┌────┴──────────┴───────────┴────────────────────┐  │
│  │            BullMQ Job Queue (Redis)            │  │
│  │  emailWorker  │  smsWorker  │  rcsWorker       │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │          SQLite Database (zero-setup)          │  │
│  │  campaigns │ leads │ templates │ wallet │ logs │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
         │                    │
    ┌────┴────┐          ┌────┴────┐
    │  SMTP   │          │ Twilio  │
    │ Gateway │          │   API   │
    │(Gmail/  │          │(SMS/RCS)│
    │SendGrid)│          │         │
    └─────────┘          └─────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **Redis** (for BullMQ job queue)
- At least **1 SMTP account** (Gmail with App Password works great)
- **Twilio account** (optional — only needed for SMS/RCS)
- **Razorpay account** (optional — only needed for credit purchases)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/campaign-manager.git
cd campaign-manager

# Install all dependencies (server + client)
npm run install-all
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials (see [Environment Reference](#-environment-reference) below).

### 3. Start Development Server

```bash
npm run dev
```

This starts:
- **API Server** on `http://localhost:3001`
- **Frontend** on `http://localhost:5174`

On first boot, the system automatically:
- Creates the SQLite database
- Runs all migrations
- Seeds dummy data (50 leads, 10 templates, sample campaigns)
- Adds 50 free demo credits to your wallet

### 4. Open the Console

Navigate to **`http://localhost:5174`** and start creating campaigns!

---

## 📋 Environment Reference

Create a `.env` file in the project root with the following variables:

### SMTP Accounts (Email)

Add as many accounts as you want. The system auto-discovers all `SMTP_ACCOUNT_*` entries and rotates between them.

```env
# Account 1
SMTP_ACCOUNT_1_EMAIL=campaign@yourdomain.com
SMTP_ACCOUNT_1_PASS=your-gmail-app-password
SMTP_ACCOUNT_1_HOST=smtp.gmail.com
SMTP_ACCOUNT_1_PORT=587
SMTP_ACCOUNT_1_DISPLAY_NAME=Campaign Team

# Account 2
SMTP_ACCOUNT_2_EMAIL=outreach@yourdomain.com
SMTP_ACCOUNT_2_PASS=your-app-password
SMTP_ACCOUNT_2_HOST=smtp.gmail.com
SMTP_ACCOUNT_2_PORT=587
SMTP_ACCOUNT_2_DISPLAY_NAME=Outreach Team

# Add SMTP_ACCOUNT_3_*, SMTP_ACCOUNT_4_*, etc.
```

> **💡 Gmail Setup**: Enable 2-Step Verification → Generate an App Password at
> [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
> Use the 16-character app password as `SMTP_ACCOUNT_*_PASS`.

### Twilio (SMS + RCS)

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_STATUS_CALLBACK_URL=https://your-domain.com/api/webhooks/twilio
```

> **📱 Free Tier**: Twilio trial gives 100 free SMS to verified numbers.
> Great for testing. Upgrade for production sends.

### Razorpay (Payments)

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

> **💳 Test Mode**: Use `rzp_test_*` keys. No real charges.
> Test card: `4111 1111 1111 1111`, any future expiry, any CVV.

### Infrastructure

```env
REDIS_URL=redis://localhost:6379
PORT=3001
CLIENT_URL=http://localhost:5174
```

### Rate Limiting

```env
EMAIL_MIN_DELAY_MS=5000        # Min delay between emails (ms)
EMAIL_MAX_DELAY_MS=15000       # Max delay between emails (ms)
SMS_MIN_DELAY_MS=1000          # Min delay between SMS (ms)
SMS_MAX_DELAY_MS=3000          # Max delay between SMS (ms)
EMAILS_PER_ACCOUNT_PER_HOUR=50 # Per-account hourly limit
```

---

## 💰 Credit System

SMS and RCS campaigns require credits. Credits are purchased via Razorpay.

### How It Works

```
1. User clicks "Buy Credits" → Razorpay checkout opens
2. Payment completes → Razorpay fires webhook to /api/webhooks/razorpay
3. Server verifies signature → Credits added to wallet
4. User creates SMS/RCS campaign → Credits are held (reserved)
5. Each successful send → 1 credit debited (SMS) or 2 credits (RCS)
6. Failed sends → Credits automatically refunded
```

### Default Credit Packs

| Pack | Credits | Price | Bonus |
|------|---------|-------|-------|
| Starter | 100 | ₹100 | — |
| Growth | 550 | ₹500 | +10% |
| Pro | 1,200 | ₹1,000 | +20% |

> Credit packs are fully configurable. Edit the `CREDIT_PACKS` constant in `server/services/paymentService.js`.

### Credit Costs

| Action | Credits |
|--------|---------|
| Send 1 Email | 0 (free) |
| Send 1 SMS | 1 credit |
| Send 1 RCS | 2 credits |

---

## 📁 Project Structure

```
campaign__manager/
├── .env.example            # Environment template
├── .gitignore
├── README.md               # ← You are here
├── package.json            # Root: dev scripts
│
├── assets/
│   └── logo.png            # Project logo
│
├── server/
│   ├── package.json
│   ├── server.js           # Express entry point
│   ├── db/
│   │   ├── schema.sql      # SQLite schema (9 tables)
│   │   ├── database.js     # Auto-migrate on startup
│   │   └── seed.js         # Dummy data + demo credits
│   ├── routes/
│   │   ├── campaign.routes.js
│   │   ├── lead.routes.js
│   │   ├── template.routes.js
│   │   ├── payment.routes.js
│   │   ├── webhook.routes.js
│   │   └── settings.routes.js
│   ├── services/
│   │   ├── emailSender.js      # Multi-sender SMTP rotation
│   │   ├── smsSender.js        # Twilio SMS
│   │   ├── rcsSender.js        # Twilio RCS
│   │   ├── creditService.js    # Wallet management
│   │   ├── paymentService.js   # Razorpay integration
│   │   ├── templateEngine.js   # {{variable}} interpolation
│   │   └── fileParser.js       # Excel/CSV parser
│   └── workers/
│       ├── emailWorker.js      # BullMQ email queue
│       ├── smsWorker.js        # BullMQ SMS queue
│       └── rcsWorker.js        # BullMQ RCS queue
│
└── client/
    ├── package.json
    ├── index.html
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css           # Full design system
        ├── api/
        │   └── client.ts       # Axios API client
        ├── pages/
        │   ├── Overview.tsx     # Dashboard + KPIs
        │   ├── Campaigns.tsx    # Campaign list
        │   ├── Builder.tsx      # 5-step creation wizard
        │   ├── Monitor.tsx      # Real-time delivery tracking
        │   ├── Templates.tsx    # Template gallery
        │   ├── Credits.tsx      # Buy credits + history
        │   └── Settings.tsx     # Branding + provider config
        └── components/
            ├── Sidebar.tsx
            ├── Topbar.tsx
            ├── FileUpload.tsx
            ├── EmailPreview.tsx
            ├── SMSPreview.tsx
            ├── CreditBadge.tsx
            ├── RazorpayCheckout.tsx
            ├── ChannelSelector.tsx
            ├── StepWizard.tsx
            └── Toast.tsx
```

---

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both server and client in parallel |
| `npm run server` | Start backend only (port 3001) |
| `npm run client` | Start frontend only (port 5174) |
| `npm run install-all` | Install dependencies for both server and client |

---

## 🛣️ Roadmap

### Now (v1.0)
- [x] Email campaigns with multi-sender rotation
- [x] SMS campaigns via Twilio
- [x] RCS with SMS fallback
- [x] Razorpay credit system
- [x] Template engine with `{{variable}}` interpolation
- [x] Real-time campaign monitoring
- [x] White-label branding

### Next (v1.1)
- [ ] WhatsApp Business API integration
- [ ] Scheduled campaigns (send at specific date/time)
- [ ] Campaign cloning
- [ ] A/B testing (multiple templates per campaign)
- [ ] Unsubscribe/opt-out management
- [ ] CSV export of campaign results

### Future (v2.0)
- [ ] Drag-and-drop email template builder
- [ ] Contact list management with segments
- [ ] Webhook notifications for campaign events
- [ ] API key authentication (optional)
- [ ] Multi-tenant support
- [ ] Analytics dashboard with charts

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style (ESM modules, async/await)
- Add comments for non-obvious logic
- Test your changes with both Email and SMS channels
- Update the README if you add new environment variables

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Nodemailer](https://nodemailer.com/)** — Rock-solid email sending for Node.js
- **[Twilio](https://www.twilio.com/)** — SMS and RCS messaging APIs
- **[Razorpay](https://razorpay.com/)** — Payment gateway for the Indian market
- **[BullMQ](https://docs.bullmq.io/)** — Redis-based job queue with rate limiting
- **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)** — Fast, synchronous SQLite for Node.js
- **[SheetJS](https://sheetjs.com/)** — Excel/CSV parsing

---

<p align="center">
  <sub>Built with ☕ and determination. Ship campaigns, not excuses.</sub>
</p>
