import React, { useEffect, useState } from 'react';

const Settings = () => {
  const [smtpStatus, setSmtpStatus] = useState<any[]>([]);
  const [twilioStatus, setTwilioStatus] = useState<string>('checking...');

  useEffect(() => {
    fetch('http://localhost:3001/api/settings/smtp-status')
      .then(res => res.json())
      .then(setSmtpStatus)
      .catch(console.error);
      
    fetch('http://localhost:3001/api/settings/twilio-status')
      .then(res => res.json())
      .then(data => setTwilioStatus(data.status))
      .catch(console.error);
  }, []);

  return (
    <div style={{ maxWidth: '800px' }}>
      <h3 style={{ marginBottom: '20px' }}>Integrations Status</h3>
      
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '30px' }}>
        <h4 style={{ margin: '0 0 15px 0' }}>SMTP Accounts (Email)</h4>
        {smtpStatus.map((s, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span>{s.email}</span>
            <span style={{ color: s.status === 'ok' ? 'var(--success)' : 'var(--error)' }}>
              {s.status === 'ok' ? 'Connected' : 'Error'}
            </span>
          </div>
        ))}
        {smtpStatus.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Checking SMTP configuration...</p>}
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <h4 style={{ margin: '0 0 15px 0' }}>Twilio (SMS/RCS)</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Twilio API</span>
          <span style={{ color: twilioStatus === 'ok' ? 'var(--success)' : 'var(--error)' }}>
            {twilioStatus === 'ok' ? 'Connected' : twilioStatus}
          </span>
        </div>
      </div>
      
      <p style={{ marginTop: '30px', color: 'var(--text-muted)', fontSize: '14px' }}>
        Note: Settings are currently managed via the <code>.env</code> file. Please restart the server after making changes.
      </p>
    </div>
  );
};

export default Settings;
