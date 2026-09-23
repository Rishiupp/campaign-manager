import React, { useEffect, useState } from 'react';

const Templates = () => {
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/templates')
      .then(res => res.json())
      .then(setTemplates)
      .catch(console.error);
  }, []);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {templates.map(t => (
          <div key={t.id} style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>{t.name}</h3>
              <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: 'var(--secondary)', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>{t.channel}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '15px' }}>Category: {t.category}</p>
            
            <div style={{ backgroundColor: 'var(--bg-main)', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
              {t.channel === 'email' ? (
                <><strong>Subject:</strong> {t.subject}</>
              ) : (
                <>{t.body_text?.substring(0, 50)}...</>
              )}
            </div>
          </div>
        ))}
        {templates.length === 0 && <p>No templates found.</p>}
      </div>
    </div>
  );
};

export default Templates;
