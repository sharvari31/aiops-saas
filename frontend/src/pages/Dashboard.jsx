import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [metrics, setMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [current, setCurrent] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [stressing, setStressing] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [m, a, c] = await Promise.all([
        axios.get('http://localhost:8002/metrics/latest'),
        axios.get('http://localhost:8004/alerts/active'),
        axios.get('http://localhost:8002/metrics/current'),
      ]);
      setMetrics(m.data);
      setAlerts(a.data);
      setCurrent(c.data);
      const cpuHistory = m.data.map(d => d.cpu);
      if (cpuHistory.length > 0) {
        const pred = await axios.post('http://localhost:8003/ai/predict', {
          historical_values: cpuHistory,
          steps_ahead: 5
        });
        setPrediction(pred.data);
      }
    } catch (err) {
      console.log('Error fetching data:', err);
    }
  };

  const runStressTest = async () => {
    setStressing(true);
    try {
      await axios.post('http://localhost:8002/metrics/stress-test');
      setTimeout(() => setStressing(false), 30000);
    } catch (err) {
      console.log('Stress test failed:', err);
      setStressing(false);
    }
  };

  const card = { background: '#161b22', borderRadius: '10px', border: '1px solid #30363d', padding: '1.2rem' };

  const predictionChartData = () => {
    if (!prediction || !metrics.length) return [];
    const historical = metrics.slice(-10).map((m) => ({ name: m.time, actual: m.cpu, predicted: null }));
    const future = prediction.predictions.map((p, i) => ({ name: `+${i + 1}`, actual: null, predicted: p }));
    return [...historical, ...future];
  };

  const trendColor = prediction?.trend === 'increasing' ? '#f78166' : '#3fb950';
  const trendArrow = prediction?.trend === 'increasing' ? '↑' : '↓';

  return (
    <div style={{ background: '#0d1117', minHeight: '100vh', fontFamily: 'monospace', color: '#c9d1d9' }}>
      <Navbar />
      <div style={{ padding: '1.5rem 2rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#58a6ff', margin: 0 }}>System Overview</h2>
          <button
            onClick={runStressTest}
            disabled={stressing}
            style={{
              background: stressing ? '#7f1d1d' : '#da3633',
              border: '1px solid #f85149',
              color: '#fff',
              padding: '8px 20px',
              borderRadius: '6px',
              cursor: stressing ? 'not-allowed' : 'pointer',
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: 'bold',
            }}
            onMouseOver={e => { if (!stressing) e.currentTarget.style.background = '#b91c1c'; }}
            onMouseOut={e => { if (!stressing) e.currentTarget.style.background = '#da3633'; }}
          >
            {stressing ? '⚡ Stressing CPU... (30s)' : '⚡ Run CPU Stress Test'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'CPU Usage', value: `${current.cpu || 0}%`, color: '#58a6ff' },
            { label: 'Memory Usage', value: `${current.memory || 0}%`, color: '#3fb950' },
            { label: 'Disk Usage', value: `${current.disk || 0}%`, color: '#e3b341' },
            { label: 'Active Alerts', value: alerts.length, color: '#f78166' },
          ].map(s => (
            <div key={s.label} style={card}>
              <p style={{ color: '#8b949e', fontSize: '12px', margin: '0 0 8px' }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Memory', used: current.memory_used_gb, total: current.memory_total_gb, unit: 'GB' },
            { label: 'Disk', used: current.disk_used_gb, total: current.disk_total_gb, unit: 'GB' },
            { label: 'Network Sent', used: current.network_sent_mb, total: null, unit: 'MB' },
          ].map(s => (
            <div key={s.label} style={card}>
              <p style={{ color: '#8b949e', fontSize: '12px', margin: '0 0 6px' }}>{s.label}</p>
              <p style={{ color: '#c9d1d9', fontSize: '1.4rem', margin: 0 }}>{s.used || 0} {s.total ? `/ ${s.total}` : ''} {s.unit}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={card}>
            <p style={{ color: '#58a6ff', fontSize: '13px', margin: '0 0 1rem' }}>CPU Usage</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="cpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#58a6ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#58a6ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="time" stroke="#484f58" tick={{ fontSize: 10 }} />
                <YAxis stroke="#484f58" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: '12px' }} />
                <Area type="monotone" dataKey="cpu" stroke="#58a6ff" fill="url(#cpu)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={card}>
            <p style={{ color: '#3fb950', fontSize: '13px', margin: '0 0 1rem' }}>Memory Usage</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="mem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3fb950" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3fb950" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="time" stroke="#484f58" tick={{ fontSize: 10 }} />
                <YAxis stroke="#484f58" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: '12px' }} />
                <Area type="monotone" dataKey="memory" stroke="#3fb950" fill="url(#mem)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ ...card, marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <p style={{ color: '#d2a8ff', fontSize: '13px', margin: '0 0 4px' }}>CPU Forecast — AI Prediction (Linear Regression)</p>
              <p style={{ color: '#8b949e', fontSize: '11px', margin: 0 }}>Solid line = actual | Dashed line = predicted next 5 values</p>
            </div>
            {prediction && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: trendColor, fontSize: '18px', margin: '0', fontWeight: 'bold' }}>{trendArrow} {prediction.trend}</p>
                <p style={{ color: '#8b949e', fontSize: '11px', margin: 0 }}>confidence: {(prediction.confidence * 100).toFixed(0)}%</p>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={predictionChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="name" stroke="#484f58" tick={{ fontSize: 10 }} />
              <YAxis stroke="#484f58" tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', fontSize: '12px' }}
                formatter={(value, name) => [value ? `${value}%` : 'N/A', name === 'actual' ? 'Actual CPU' : 'Predicted CPU']} />
              <Line type="monotone" dataKey="actual" stroke="#58a6ff" strokeWidth={2} dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="predicted" stroke="#d2a8ff" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#d2a8ff', r: 3 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <p style={{ color: '#f78166', fontSize: '13px', margin: '0 0 1rem' }}>Active Alerts</p>
          {alerts.length === 0
            ? <p style={{ color: '#8b949e', fontSize: '13px' }}>No active alerts — system healthy</p>
            : alerts.map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #21262d' }}>
                <span style={{ fontSize: '13px' }}>{a.title}</span>
                <span style={{ fontSize: '12px', color: a.severity === 'high' ? '#f78166' : a.severity === 'medium' ? '#e3b341' : '#3fb950' }}>{a.severity}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default Dashboard;