import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Builder = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} style={{ 
            width: '40px', height: '40px', borderRadius: '50%', 
            backgroundColor: s <= step ? 'var(--primary)' : 'var(--secondary)',
            color: s <= step ? 'white' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600
          }}>
            {s}
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '8px', border: '1px solid var(--border)' }}>
        {step === 1 && <h2>Step 1: Campaign Details</h2>}
        {step === 2 && <h2>Step 2: Audience (Upload Leads)</h2>}
        {step === 3 && <h2>Step 3: Choose Channel & Template</h2>}
        {step === 4 && <h2>Step 4: Map Variables</h2>}
        {step === 5 && <h2>Step 5: Review & Launch</h2>}
        
        <p style={{ color: 'var(--text-muted)', margin: '20px 0' }}>Builder wizard implementation goes here...</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
          <button 
            disabled={step === 1} 
            onClick={() => setStep(s => s - 1)}
            style={btnStyle(step === 1)}
          >Back</button>
          
          <button 
            onClick={() => {
              if (step === 5) navigate('/campaigns');
              else setStep(s => s + 1);
            }}
            style={{ ...btnStyle(false), backgroundColor: 'var(--primary)', color: 'white' }}
          >
            {step === 5 ? 'Launch Campaign' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

const btnStyle = (disabled: boolean) => ({
  padding: '10px 20px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: disabled ? 'var(--secondary)' : 'var(--bg-main)',
  color: disabled ? 'var(--text-muted)' : 'var(--text-main)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontWeight: 500,
  border: '1px solid var(--border)'
});

export default Builder;
