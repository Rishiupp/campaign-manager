import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/campaigns')
      .then(res => res.json())
      .then(data => setCampaigns(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-muted)' }}>Name</th>
              <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-muted)' }}>Channel</th>
              <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-muted)' }}>Progress</th>
              <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-muted)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px' }}>{c.name}</td>
                <td style={{ padding: '16px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--secondary)', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>{c.channel}</span></td>
                <td style={{ padding: '16px' }}>{c.status}</td>
                <td style={{ padding: '16px' }}>{c.sent_count} / {c.total_leads}</td>
                <td style={{ padding: '16px' }}>
                  <Link to={`/campaigns/${c.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>View</Link>
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No campaigns found. Create one!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Campaigns;
