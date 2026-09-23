import React, { useEffect, useState } from 'react';

const Overview = () => {
  const [stats, setStats] = useState({ campaignsCount: 0, leadsCount: 0, emailsSent: 0, smsSent: 0 });

  useEffect(() => {
    fetch('http://localhost:3001/api/settings/overview')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard title="Total Campaigns" value={stats.campaignsCount} />
        <StatCard title="Total Leads" value={stats.leadsCount} />
        <StatCard title="Emails Sent" value={stats.emailsSent} />
        <StatCard title="SMS/RCS Sent" value={stats.smsSent} />
      </div>
      
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Recent Activity</h3>
        <p style={{ color: 'var(--text-muted)' }}>Activity feed will appear here.</p>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }: { title: string, value: number }) => (
  <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 10px 0' }}>{title}</p>
    <h2 style={{ fontSize: '28px', margin: 0, color: 'var(--primary)' }}>{value}</h2>
  </div>
);

export default Overview;
