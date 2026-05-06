import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Alerts from './pages/Alerts';
import Metrics from './pages/Metrics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/metrics" element={<Metrics />} />
      </Routes>
    </Router>
  );
}

export default App;
