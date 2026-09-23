import React, { useEffect, useState } from 'react';

const Credits = () => {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [plans, setPlans] = useState({});

  useEffect(() => {
    fetch('http://localhost:3001/api/payments/wallet')
      .then(res => res.json())
      .then(setWallet)
      .catch(console.error);
      
    fetch('http://localhost:3001/api/payments/plans')
      .then(res => res.json())
      .then(setPlans)
      .catch(console.error);
  }, []);

  const buyCredits = async (planKey: string) => {
    try {
      const res = await fetch('http://localhost:3001/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey })
      });
      const order = await res.json();
      
      // Load Razorpay Script and open checkout
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: 'rzp_test_xxxx', // Usually injected from server or env, hardcoded for demo frontend
          amount: order.amount,
          currency: order.currency,
          name: 'CampaignMgr',
          description: 'Buy Credits',
          order_id: order.id,
          handler: function (response: any) {
            // Webhook will handle the actual fulfillment
            alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
            window.location.reload();
          },
          theme: { color: '#4f46e5' }
        };
        const rzp1 = new (window as any).Razorpay(options);
        rzp1.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '40px', borderRadius: '12px', marginBottom: '40px', textAlign: 'center' }}>
        <p style={{ margin: 0, opacity: 0.8 }}>Current Balance</p>
        <h1 style={{ fontSize: '48px', margin: '10px 0' }}>{wallet.balance} Credits</h1>
      </div>

      <h3 style={{ marginBottom: '20px' }}>Buy Credits</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {Object.entries(plans).map(([key, plan]: any) => (
          <div key={key} style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--text-main)', margin: '0 0 10px 0' }}>{plan.credits} Credits</h2>
            <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--primary)', margin: '0 0 20px 0' }}>₹{plan.amount / 100}</p>
            <button onClick={() => buyCredits(key)} style={{ width: '100%', padding: '12px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Buy Now</button>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '20px' }}>Recent Transactions</h3>
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--secondary)' }}>
              <th style={{ padding: '12px 16px' }}>Date</th>
              <th style={{ padding: '12px 16px' }}>Description</th>
              <th style={{ padding: '12px 16px' }}>Amount</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {wallet.transactions.map((t: any) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px' }}>{new Date(t.created_at).toLocaleString()}</td>
                <td style={{ padding: '16px' }}>{t.description}</td>
                <td style={{ padding: '16px', color: t.type === 'credit' ? 'var(--success)' : 'var(--error)' }}>
                  {t.type === 'credit' ? '+' : '-'}{t.credits}
                </td>
                <td style={{ padding: '16px' }}>{t.status}</td>
              </tr>
            ))}
            {wallet.transactions.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '30px', textAlign: 'center' }}>No transactions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Credits;
