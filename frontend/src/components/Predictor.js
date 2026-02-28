import API_URL from '../config';
import React, { useState } from 'react';

function Predictor() {
  const [form, setForm] = useState({
    train_id: 1,
    train_type: 'Rajdhani',
    station_id: 1,
    day_of_week: 0,
    hour: 9
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: parseInt(e.target.value) || e.target.value });
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/predict-delay/`, {
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
      <h1 style={{marginBottom: '25px', color: '#e2e8f0'}}>
        🤖 AI Delay Predictor
      </h1>

      <div className="card">
        <h2>Enter Train Details</h2>
        <p style={{color: '#94a3b8', marginBottom: '20px', fontSize: '0.9rem'}}>
          Our ML model will predict the expected delay
        </p>

        <div className="predictor-form">
          {/* Train */}
          <div className="form-group">
            <label>Train</label>
            <select name="train_id" onChange={(e) => {
              const val = parseInt(e.target.value);
              const types = {1: 'Rajdhani', 2: 'Rajdhani', 3: 'Mail'};
              setForm({...form, train_id: val, train_type: types[val]});
            }}>
              <option value={1}>Mumbai Rajdhani (12951)</option>
              <option value={2}>August Kranti (12953)</option>
              <option value={3}>Saurashtra Mail (19019)</option>
            </select>
          </div>

          {/* Station */}
          <div className="form-group">
            <label>Station</label>
            <select name="station_id" onChange={handleChange}>
              <option value={1}>New Delhi (NDLS)</option>
              <option value={2}>Mumbai Central (BCT)</option>
              <option value={3}>Mathura Junction (MTJ)</option>
              <option value={4}>Kota Junction (KOTA)</option>
            </select>
          </div>

          {/* Day */}
          <div className="form-group">
            <label>Day of Week</label>
            <select name="day_of_week" onChange={handleChange}>
              <option value={0}>Monday</option>
              <option value={1}>Tuesday</option>
              <option value={2}>Wednesday</option>
              <option value={3}>Thursday</option>
              <option value={4}>Friday</option>
              <option value={5}>Saturday</option>
              <option value={6}>Sunday</option>
            </select>
          </div>

          {/* Hour */}
          <div className="form-group">
            <label>Hour of Day (0-23)</label>
            <input
              type="number"
              name="hour"
              min="0"
              max="23"
              defaultValue={9}
              onChange={handleChange}
            />
          </div>
        </div>

        <button className="predict-btn" onClick={handlePredict} disabled={loading}>
          {loading ? '🔄 Predicting...' : '🤖 Predict Delay'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="result-card">
          <h2 style={{color: '#94a3b8', marginBottom: '15px'}}>Prediction Result</h2>
          <div className="delay-number">
            {result.predicted_delay_minutes} mins
          </div>
          <p style={{color: '#94a3b8', margin: '10px 0'}}>Expected Delay</p>
          <span className={`badge badge-${result.risk_level}`}>
            {result.risk_level} RISK
          </span>
          <div style={{marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px'}}>
            <div style={{textAlign: 'center'}}>
              <div style={{color: '#94a3b8', fontSize: '0.85rem'}}>Peak Hour</div>
              <div style={{color: result.is_peak_hour ? '#ef4444' : '#22c55e', fontWeight: 'bold'}}>
                {result.is_peak_hour ? 'YES ⚠️' : 'NO ✅'}
              </div>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{color: '#94a3b8', fontSize: '0.85rem'}}>Weekend</div>
              <div style={{color: result.is_weekend ? '#f59e0b' : '#22c55e', fontWeight: 'bold'}}>
                {result.is_weekend ? 'YES' : 'NO'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Predictor;