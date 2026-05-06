import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('http://localhost:8004/alerts/all');
      setAlerts(res.data);
    } catch (err) {
      console.log('Could not fetch alerts');
    }
  };

  const resolveAlert = async (id) => {
    try {
      await axios.put(`http://localhost:8004/alerts/${id}/resolve`);
      fetchAlerts();
    } catch (err) {
      console.log('Could not resolve alert');
    }
  };

  const logout = () => { localStorage.clear(); navigate('/'); };
  const severityColor = s => s === 'high' ? '#f78166' : s === 'medium' ? '#e3b341' : '#3fb950';

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);
  const active = alerts.filter(a => a.status === 'active').length;
  const resolved = alerts.filter(a => a.status === 'resolved').length;
  const high = alerts.filter(a => a.severity === 'high' && a.status === 'active').length;

  return (
    <div style={{ background: '#0d1117', minHeight: '100vh', fontFamily: 'monospace', color: '#c9d1d9' }}>
      {/* Navbar */}
      <div style={{ background: '#161b22', borderBottom: '1px solid #30363d', padding: '0.8rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span style={{ color: '#58a6ff', fontWeight: 'bold', fontSize: '18px' }}>AIOps</span>
          {['Dashboard', 'Metrics', 'Alerts'].map(p => (
            <span key={p} onClick={() => navigate('/' + p.toLowerCase())}
              style={{ cursor: 'pointer', color: p === 'Alerts' ? '#58a6ff' : '#8b949e', fontSize: '14px' }}
              onMouseOver={e => e.target.style.color = '#58a6ff'}
              onMouseOut={e => e.target.style.color = p === 'Alerts' ? '#58a6ff' : '#8b949e'}>
              {p}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#8b949e', fontSize: '13px' }}>{user.name} ({user.role})</span>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid #30363d',
            color: '#f78166', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer',
            fontFamily: 'monospace', fontSize: '12px' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '1.5rem 2rem' }}>
        <h2 style={{ color: '#58a6ff', marginBottom: '1.5rem' }}>Alert Management</h2>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Alerts', value: alerts.length, color: '#58a6ff' },
            { label: 'Active', value: active, color: '#f78166' },
            { label: 'Resolved', value: resolved, color: '#3fb950' },
            { label: 'High Severity', value: high, color: '#e3b341' },
          ].map(s => (
            <div key={s.label} style={{ background: '#161b22', borderRadius: '10px',
              border: '1px solid #30363d', padding: '1rem' }}>
              <p style={{ color: '#8b949e', fontSize: '12px', margin: '0 0 8px' }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {['all', 'active', 'resolved'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontFamily: 'monospace', fontSize: '13px', textTransform: 'capitalize',
                background: filter === f ? '#238636' : '#21262d',
                color: filter === f ? '#fff' : '#8b949e' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Alerts list */}
        <div style={{ background: '#161b22', borderRadius: '10px', border: '1px solid #30363d' }}>
          {filtered.length === 0
            ? <p style={{ color: '#8b949e', padding: '2rem', textAlign: 'center' }}>No alerts found</p>
            : filtered.map((a, i) => (
              <div key={a.id} style={{
                padding: '1rem 1.5rem',
                borderBottom: i < filtered.length - 1 ? '1px solid #21262d' : 'none',
                borderLeft: `4px solid ${severityColor(a.severity)}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{a.title}</span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                      background: a.status === 'active' ? '#2d1b1b' : '#1b2d1b',
                      color: a.status === 'active' ? '#f78166' : '#3fb950' }}>
                      {a.status}
                    </span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                      background: '#21262d', color: severityColor(a.severity) }}>
                      {a.severity}
                    </span>
                  </div>
                  <p style={{ color: '#8b949e', fontSize: '12px', margin: '2px 0' }}>Service: {a.service}</p>
                  <p style={{ color: '#484f58', fontSize: '11px', margin: '2px 0' }}>{a.created_at}</p>
                </div>
                {a.status === 'active' && (
                  <button onClick={() => resolveAlert(a.id)}
                    style={{ background: '#238636', border: 'none', color: '#fff',
                      padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
                      fontFamily: 'monospace', fontSize: '12px', marginLeft: '1rem' }}>
                    Resolve
                  </button>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default Alerts;