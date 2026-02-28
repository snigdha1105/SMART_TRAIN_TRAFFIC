import API_URL from '../config';
import React, { useState } from 'react';

function WhatIf() {
  const [form, setForm] = useState({
    train_id: 1,
    delay_minutes: 10
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: parseInt(e.target.value) });
  };

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/whatif/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{marginBottom: '10px', color: '#e2e8f0'}}>
        🔮 What-if Simulation
      </h1>
      <p style={{color: '#94a3b8', marginBottom: '25px'}}>
        Simulate the impact of delaying a train before making a decision
      </p>

      <div className="card">
        <h2>Configure Simulation</h2>
        <div className="predictor-form" style={{marginTop: '15px'}}>
          
          <div className="form-group">
            <label>Select Train to Delay</label>
            <select name="train_id" onChange={handleChange}>
              <option value={1}>Mumbai Rajdhani (12951)</option>
              <option value={2}>August Kranti (12953)</option>
              <option value={3}>Saurashtra Mail (19019)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Delay by (minutes)</label>
            <input
              type="number"
              name="delay_minutes"
              min="1"
              max="120"
              defaultValue={10}
              onChange={handleChange}
            />
          </div>
        </div>

        <button className="predict-btn" onClick={handleSimulate} disabled={loading}>
          {loading ? '🔄 Simulating...' : '🔮 Run Simulation'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div>
          <div className="card" style={{
            borderColor: result.total_conflicts_after_delay === 0 ? '#22c55e' : '#ef4444',
            borderWidth: '2px'
          }}>
            <h2 style={{marginBottom: '15px'}}>Simulation Result</h2>
            <p style={{color: '#94a3b8', marginBottom: '15px'}}>
              📋 {result.simulation}
            </p>

            <div className="grid">
              <div className="stat-card">
                <h3>CONFLICTS AFTER DELAY</h3>
                <div className="number" style={{
                  color: result.total_conflicts_after_delay > 0 ? '#ef4444' : '#22c55e'
                }}>
                  {result.total_conflicts_after_delay}
                </div>
              </div>
              <div className="stat-card">
                <h3>VERDICT</h3>
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: result.total_conflicts_after_delay === 0 ? '#22c55e' : '#ef4444',
                  marginTop: '10px'
                }}>
                  {result.verdict}
                </div>
              </div>
            </div>

            {result.conflicts.length > 0 && (
              <div style={{marginTop: '20px'}}>
                <h3 style={{color: '#ef4444', marginBottom: '15px'}}>
                  🚨 Remaining Conflicts:
                </h3>
                {result.conflicts.map((conflict, index) => (
                  <div className="conflict-item" key={index}>
                    <p>📍 <strong>Station:</strong> {conflict.station}</p>
                    <p>🚂 <strong>Train 1:</strong> {conflict.train_1} — departs {conflict.train_1_departure}</p>
                    <p>🚂 <strong>Train 2:</strong> {conflict.train_2} — departs {conflict.train_2_departure}</p>
                    <p>⏱️ <strong>Gap:</strong> {conflict.time_gap_minutes} minutes</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default WhatIf;