import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';

const Metrics = () => {
  const [data, setData] = useState([]);
  const [current, setCurrent] = useState({});

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [m, c] = await Promise.all([
        axios.get('http://localhost:8002/metrics/latest'),
        axios.get('http://localhost:8002/metrics/current'),
      ]);
      setData(m.data);
      setCurrent(c.data);
    } catch (err) {
      console.log('Could not fetch metrics');
    }
  };

  const card = { background: '#161b22', borderRadius: '10px', border: '1px solid #30363d', padding: '1rem' };

  const charts = [
    { key: 'cpu', label: 'CPU Usage %', color: '#58a6ff', current: current.cpu },
    { key: 'memory', label: 'Memory Usage %', color: '#3fb950', current: current.memory },
    { key: 'disk', label: 'Disk Usage %', color: '#e3b341', current: current.disk },
  ];

  return (
    <div style={{ background: '#0d1117', minHeight: '100vh', fontFamily: 'monospace', color: '#c9d1d9' }}>
      <Navbar />
      <div style={{ padding: '1.5rem 2rem' }}>
        <h2 style={{ color: '#58a6ff', marginBottom: '1.5rem' }}>System Metrics</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'CPU', value: `${current.cpu || 0}%`, color: '#58a6ff' },
            { label: 'Memory', value: `${current.memory || 0}%`, color: '#3fb950' },
            { label: 'Disk', value: `${current.disk || 0}%`, color: '#e3b341' },
            { label: 'Uptime', value: '99.8%', color: '#d2a8ff' },
          ].map(s => (
            <div key={s.label} style={card}>
              <p style={{ color: '#8b949e', fontSize: '12px', margin: '0 0 8px' }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={card}>
            <p style={{ color: '#8b949e', fontSize: '12px', margin: '0 0 4px' }}>RAM</p>
            <p style={{ color: '#c9d1d9', fontSize: '1.3rem', margin: 0 }}>{current.memory_used_gb || 0} / {current.memory_total_gb || 0} GB</p>
          </div>
          <div style={card}>
            <p style={{ color: '#8b949e', fontSize: '12px', margin: '0 0 4px' }}>Disk</p>
            <p style={{ color: '#c9d1d9', fontSize: '1.3rem', margin: 0 }}>{current.disk_used_gb || 0} / {current.disk_total_gb || 0} GB</p>
          </div>
          <div style={card}>
            <p style={{ color: '#8b949e', fontSize: '12px', margin: '0 0 4px' }}>Network</p>
            <p style={{ color: '#c9d1d9', fontSize: '1.3rem', margin: 0 }}>↑{current.network_sent_mb || 0} ↓{current.network_recv_mb || 0} MB</p>
          </div>
        </div>

        {charts.map(c => (
          <div key={c.key} style={{ ...card, marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ color: c.color, fontSize: '13px', margin: 0 }}>{c.label}</p>
              <span style={{ color: c.color, fontSize: '1.2rem', fontWeight: 'bold' }}>{c.current || 0}%</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={c.key} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={c.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="time" stroke="#484f58" tick={{ fontSize: 10 }} />
                <YAxis stroke="#484f58" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: '12px' }} />
                <Area type="monotone" dataKey={c.key} stroke={c.color} fill={`url(#${c.key})`} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Metrics;
