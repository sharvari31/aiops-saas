import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const inputStyle = {
    width: '100%', padding: '10px', marginBottom: '1rem',
    background: '#0d1117', border: '1px solid #30363d',
    borderRadius: '6px', color: '#c9d1d9', boxSizing: 'border-box',
    fontFamily: 'monospace', fontSize: '14px'
  };

  const handleLogin = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.post('http://localhost:8001/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify({ name: res.data.name, role: res.data.role, email: res.data.email }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true); setError('');
    if (!name || !email || !password) { setError('All fields are required'); setLoading(false); return; }
    try {
      const res = await axios.post('http://localhost:8001/auth/register', { email, password, name });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify({ name: res.data.name, role: res.data.role, email: res.data.email }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0d1117', fontFamily: 'monospace' }}>
      <div style={{ background: '#161b22', padding: '2rem', borderRadius: '12px', border: '1px solid #30363d', width: '360px' }}>
        <h2 style={{ color: '#58a6ff', marginBottom: '1.5rem', textAlign: 'center' }}>⬡ AIOps Platform</h2>

        <div style={{ display: 'flex', marginBottom: '1.5rem', background: '#0d1117', borderRadius: '8px', padding: '4px' }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                fontFamily: 'monospace', fontSize: '13px', textTransform: 'capitalize',
                background: tab === t ? '#238636' : 'transparent',
                color: tab === t ? '#fff' : '#8b949e' }}>
              {t}
            </button>
          ))}
        </div>

        {error && <p style={{ color: '#f78166', fontSize: '13px', marginBottom: '1rem', background: '#2d1b1b', padding: '8px', borderRadius: '6px' }}>{error}</p>}

        {tab === 'register' && <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />}
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />

        <button onClick={tab === 'login' ? handleLogin : handleRegister} disabled={loading}
          style={{ width: '100%', padding: '10px', background: loading ? '#1a4a2a' : '#238636', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontFamily: 'monospace', fontSize: '14px' }}>
          {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        {tab === 'login' && <p style={{ color: '#8b949e', fontSize: '12px', marginTop: '1rem', textAlign: 'center' }}>Demo: admin@aiops.com / admin123</p>}
      </div>
    </div>
  );
};

export default Login;
