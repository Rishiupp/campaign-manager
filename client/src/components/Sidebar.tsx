import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Send, LayoutTemplate, Wallet, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="sidebar" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: '30px', color: 'var(--primary)' }}>CampaignMgr</h2>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <NavLink to="/overview" style={navStyle}>
          <LayoutDashboard size={20} /> Overview
        </NavLink>
        <NavLink to="/campaigns" style={navStyle}>
          <Send size={20} /> Campaigns
        </NavLink>
        <NavLink to="/templates" style={navStyle}>
          <LayoutTemplate size={20} /> Templates
        </NavLink>
        <NavLink to="/credits" style={navStyle}>
          <Wallet size={20} /> Credits
        </NavLink>
        <NavLink to="/settings" style={navStyle}>
          <Settings size={20} /> Settings
        </NavLink>
      </nav>
      
      <div style={{ marginTop: 'auto', padding: '15px', backgroundColor: 'var(--secondary)', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Wallet Balance</p>
        <h3 style={{ margin: '5px 0', color: 'var(--primary)' }}>50 Credits</h3>
      </div>
    </div>
  );
};

const navStyle = ({ isActive }: { isActive: boolean }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '8px',
  textDecoration: 'none',
  color: isActive ? 'white' : 'var(--text-muted)',
  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
  fontWeight: isActive ? 600 : 500,
  transition: 'all 0.2s'
});

export default Sidebar;
