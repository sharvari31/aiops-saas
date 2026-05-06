import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Metrics', path: '/metrics' },
    { label: 'Alerts', path: '/alerts' },
  ];

  return (
    <div style={{
      background: '#161b22',
      borderBottom: '1px solid #30363d',
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '52px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span onClick={() => navigate('/dashboard')} style={{
          color: '#58a6ff', fontWeight: 'bold', fontSize: '18px',
          cursor: 'pointer', marginRight: '1.5rem', fontFamily: 'monospace',
        }}>
          ⬡ AIOps
        </span>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.label} onClick={() => navigate(item.path)} style={{
              background: isActive ? '#21262d' : 'transparent',
              border: isActive ? '1px solid #30363d' : '1px solid transparent',
              borderBottom: isActive ? '2px solid #58a6ff' : '2px solid transparent',
              borderRadius: '6px',
              color: isActive ? '#c9d1d9' : '#8b949e',
              padding: '5px 14px', cursor: 'pointer',
              fontFamily: 'monospace', fontSize: '13px',
              fontWeight: isActive ? 'bold' : 'normal',
            }}
              onMouseOver={e => { if (!isActive) e.currentTarget.style.color = '#c9d1d9'; }}
              onMouseOut={e => { if (!isActive) e.currentTarget.style.color = '#8b949e'; }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#0d1117', border: '1px solid #30363d',
          borderRadius: '20px', padding: '3px 10px',
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3fb950', display: 'inline-block' }}/>
          <span style={{ color: '#3fb950', fontSize: '11px', fontFamily: 'monospace' }}>AI Pipeline Active</span>
        </div>
        <span style={{ color: '#8b949e', fontSize: '12px', fontFamily: 'monospace' }}>
          {user.name || 'User'}
          <span style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: '4px', padding: '1px 6px', marginLeft: '6px', fontSize: '10px', color: '#58a6ff' }}>
            {user.role || 'viewer'}
          </span>
        </span>
        <button onClick={logout} style={{
          background: 'transparent', border: '1px solid #f78166',
          color: '#f78166', padding: '4px 12px', borderRadius: '6px',
          cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px',
        }}
          onMouseOver={e => { e.currentTarget.style.background = '#f78166'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f78166'; }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
