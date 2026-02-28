import API_URL from '../config';
import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationsRes, trainsRes, conflictsRes] = await Promise.all([
          fetch(`${API_URL}/stations/`),
        fetch(`${API_URL}/trains/`),
          fetch(`${API_URL}/conflicts/`)
        ]);
        const stationsData = await stationsRes.json();
        const trainsData = await trainsRes.json();
        const conflictsData = await conflictsRes.json();

        setStations(stationsData);
        setTrains(trainsData);
        setConflicts(conflictsData.conflicts);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{color: '#38bdf8', padding: '20px'}}>Loading dashboard...</div>;

  return (
    <div>
      <h1 style={{marginBottom: '25px', color: '#e2e8f0'}}>
        🚆 System Overview
      </h1>

      {/* Stat Cards */}
      <div className="grid">
        <div className="stat-card">
          <h3>TOTAL STATIONS</h3>
          <div className="number">{stations.length}</div>
        </div>
        <div className="stat-card">
          <h3>TOTAL TRAINS</h3>
          <div className="number">{trains.length}</div>
        </div>
        <div className="stat-card">
          <h3>ACTIVE CONFLICTS</h3>
          <div className="number" style={{color: conflicts.length > 0 ? '#ef4444' : '#22c55e'}}>
            {conflicts.length}
          </div>
        </div>
        <div className="stat-card">
          <h3>SYSTEM STATUS</h3>
          <div className="number" style={{fontSize: '1.5rem', color: '#22c55e'}}>
            ONLINE ✅
          </div>
        </div>
      </div>

      {/* Trains Table */}
      <div className="card">
        <h2>🚂 Registered Trains</h2>
        <table>
          <thead>
            <tr>
              <th>Train Number</th>
              <th>Name</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {trains.map(train => (
              <tr key={train.id}>
                <td>{train.train_number}</td>
                <td>{train.name}</td>
                <td>
                  <span className="badge badge-MEDIUM">{train.type}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stations Table */}
      <div className="card">
        <h2>🏢 Registered Stations</h2>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>City</th>
            </tr>
          </thead>
          <tbody>
            {stations.map(station => (
              <tr key={station.id}>
                <td><span className="badge badge-LOW">{station.code}</span></td>
                <td>{station.name}</td>
                <td>{station.city}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;