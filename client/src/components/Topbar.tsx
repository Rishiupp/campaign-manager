import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Topbar = () => {
  const location = useLocation();
  const pathName = location.pathname.split('/')[1] || 'Overview';
  const title = pathName.charAt(0).toUpperCase() + pathName.slice(1);

  return (
    <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--text-main)' }}>{title}</h2>
      
      <div>
        <Link 
          to="/campaigns/new" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 16px', 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            borderRadius: '6px', 
            textDecoration: 'none',
            fontWeight: 500
          }}
        >
          <Plus size={18} /> New Campaign
        </Link>
      </div>
    </div>
  );
};

export default Topbar;
