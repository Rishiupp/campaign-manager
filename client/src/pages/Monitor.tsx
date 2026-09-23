import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Monitor = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Poll for updates
    const interval = setInterval(() => {
      fetch(`http://localhost:3001/api/campaigns/${id}`)
        .then(res => res.json())
        .then(setData)
        .catch(console.error);
    }, 3000);
    
    // Initial fetch
    fetch(`http://localhost:3001/api/campaigns/${id}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);

    return () => clearInterval(interval);
  }, [id]);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>{data.name} <span style={{ fontSize: '14px', padding: '4px 8px', backgroundColor: 'var(--secondary)', borderRadius: '4px' }}>{data.status}</span></h2>
        
        {data.status === 'draft' && (
          <button onClick={() => {
            fetch(`http://localhost:3001/api/campaigns/${id}/start`, { method: 'POST' })
          }} style={primaryBtn}>Start Campaign</button>
        )}
        {data.status === 'running' && (
          <button onClick={() => {
            fetch(`http://localhost:3001/api/campaigns/${id}/pause`, { method: 'POST' })
          }} style={secondaryBtn}>Pause Campaign</button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={card}><h3>Total</h3><h2>{data.total_leads}</h2></div>
        <div style={card}><h3>Sent</h3><h2 style={{ color: 'var(--success)' }}>{data.sent_count}</h2></div>
        <div style={card}><h3>Failed</h3><h2 style={{ color: 'var(--error)' }}>{data.failed_count}</h2></div>
      </div>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--secondary)' }}>
              <th style={{ padding: '12px 16px' }}>Lead</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Error</th>
            </tr>
          </thead>
          <tbody>
            {data.leads.map((l: any) => (
              <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px' }}>{l.email || l.mobile}</td>
                <td style={{ padding: '16px' }}>{l.status}</td>
                <td style={{ padding: '16px', color: 'var(--error)' }}>{l.error || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const card = { backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' };
const primaryBtn = { padding: '8px 16px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const secondaryBtn = { padding: '8px 16px', backgroundColor: 'var(--secondary)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' };

export default Monitor;
