import API_URL from '../config';
import React, { useState, useEffect } from 'react';

function Conflicts() {
  const [conflictData, setConflictData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/conflicts/`)
      .then(res => res.json())
      .then(data => {
        setConflictData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{color: '#38bdf8', padding: '20px'}}>Scanning for conflicts...</div>;
  if (!conflictData) return <div style={{color: '#ef4444', padding: '20px'}}>Error loading conflicts. Make sure backend is running!</div>;

  return (
    <div>
      <h1 style={{marginBottom: '25px', color: '#e2e8f0'}}>
        ⚠️ Conflict Detection
      </h1>

      {/* Summary */}
      <div className="grid">
        <div className="stat-card">
          <h3>TOTAL CONFLICTS</h3>
          <div className="number" style={{
            color: conflictData.total_conflicts > 0 ? '#ef4444' : '#22c55e'
          }}>
            {conflictData.total_conflicts}
          </div>
        </div>
        <div className="stat-card">
          <h3>STATUS</h3>
          <div className="number" style={{
            fontSize: '1.2rem',
            color: conflictData.total_conflicts > 0 ? '#ef4444' : '#22c55e'
          }}>
            {conflictData.total_conflicts > 0 ? '🔴 CONFLICTS FOUND' : '🟢 ALL CLEAR'}
          </div>
        </div>
      </div>

      {/* Conflict List */}
      {conflictData.total_conflicts === 0 ? (
        <div className="card" style={{textAlign: 'center', color: '#22c55e'}}>
          <h2>✅ No conflicts detected!</h2>
          <p style={{color: '#94a3b8', marginTop: '10px'}}>
            All trains are running on safe schedules.
          </p>
        </div>
      ) : (
        <div>
          <div className="card">
            <h2>🚨 Active Conflicts</h2>
            <p style={{color: '#94a3b8', marginBottom: '20px', fontSize: '0.9rem'}}>
              The following conflicts require immediate attention
            </p>
            {conflictData.conflicts.map((conflict, index) => (
              <div className="conflict-item" key={index}>
                <h3>⚠️ {conflict.conflict_type}</h3>
                <p>📍 <strong>Station:</strong> {conflict.station}</p>
                <p>🚂 <strong>Train 1:</strong> {conflict.train_1} — departs {conflict.train_1_departure}</p>
                <p>🚂 <strong>Train 2:</strong> {conflict.train_2} — departs {conflict.train_2_departure}</p>
                <p>⏱️ <strong>Time Gap:</strong> {conflict.time_gap_minutes} minutes</p>
                <div className="suggestion">
                  💡 Suggested Fix: {conflict.suggestion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Conflicts;