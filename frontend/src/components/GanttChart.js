import API_URL from '../config';
import React, { useState, useEffect } from 'react';

const STATIONS = [
  { id: 1, name: "New Delhi", code: "NDLS" },
  { id: 2, name: "Mumbai Central", code: "BCT" },
  { id: 3, name: "Mathura Junction", code: "MTJ" },
  { id: 4, name: "Kota Junction", code: "KOTA" }
];

const TRAIN_COLORS = {
  1: "#38bdf8",
  2: "#a78bfa",
  3: "#fb923c"
};

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

function GanttChart() {
  const [schedules, setSchedules] = useState([]);
  const [trains, setTrains] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [schRes, trainRes, confRes] = await Promise.all([
          fetch(`${API_URL}/schedules/`),
          fetch(`${API_URL}/trains/`),
          fetch(`${API_URL}/conflicts/`)
        ]);
        const schData = await schRes.json();
        const trainData = await trainRes.json();
        const confData = await confRes.json();

        setSchedules(schData);
        setTrains(trainData);
        setConflicts(confData.conflicts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div style={{ color: '#38bdf8', padding: '20px' }}>
      Loading Gantt Chart...
    </div>
  );

  // Find min and max times for chart scale
  const allTimes = schedules.flatMap(s => [
    timeToMinutes(s.arrival_time),
    timeToMinutes(s.departure_time)
  ]);
  const minTime = Math.min(...allTimes) - 15;
  const maxTime = Math.max(...allTimes) + 15;
  const totalDuration = maxTime - minTime;

  // Generate time markers every 30 minutes
  const timeMarkers = [];
  for (let t = minTime; t <= maxTime; t += 30) {
    timeMarkers.push(t);
  }

  // Check if a schedule has a conflict
  const hasConflict = (schedule) => {
    const train = trains.find(t => t.id === schedule.train_id);
    const station = STATIONS.find(s => s.id === schedule.station_id);
    if (!train || !station) return false;
    return conflicts.some(c =>
      (c.train_1 === train.name || c.train_2 === train.name) &&
      c.station === station.name
    );
  };

  return (
    <div>
      <h1 style={{ marginBottom: '10px', color: '#e2e8f0' }}>
        📊 Train Schedule Timeline
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '25px' }}>
        Visual timeline of all trains — red indicates conflict zones
      </p>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap'
      }}>
        {trains.map(train => (
          <div key={train.id} style={{
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <div style={{
              width: '20px', height: '12px',
              background: TRAIN_COLORS[train.id] || '#fff',
              borderRadius: '3px'
            }} />
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              {train.name}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '20px', height: '12px',
            background: '#ef4444',
            borderRadius: '3px'
          }} />
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Conflict
          </span>
        </div>
      </div>

      {/* Gantt Chart per Station */}
      {STATIONS.map(station => {
        const stationSchedules = schedules.filter(
          s => s.station_id === station.id
        );
        if (stationSchedules.length === 0) return null;

        return (
          <div key={station.id} className="card" style={{ marginBottom: '15px' }}>
            <h3 style={{ marginBottom: '15px', color: '#e2e8f0' }}>
              🏢 {station.name}
              <span style={{
                color: '#94a3b8', fontSize: '0.8rem',
                marginLeft: '10px'
              }}>
                ({station.code})
              </span>
            </h3>

            {/* Time axis */}
            <div style={{
              position: 'relative',
              height: '25px',
              marginBottom: '5px',
              marginLeft: '20px'
            }}>
              {timeMarkers.map(t => (
                <div key={t} style={{
                  position: 'absolute',
                  left: `${((t - minTime) / totalDuration) * 100}%`,
                  color: '#475569',
                  fontSize: '0.7rem',
                  transform: 'translateX(-50%)'
                }}>
                  {minutesToTime(t)}
                </div>
              ))}
            </div>

            {/* Train bars */}
            {stationSchedules.map((schedule, idx) => {
              const train = trains.find(t => t.id === schedule.train_id);
              if (!train) return null;

              const arrMin = timeToMinutes(schedule.arrival_time);
              const depMin = timeToMinutes(schedule.departure_time);
              const left = ((arrMin - minTime) / totalDuration) * 100;
              const width = ((depMin - arrMin) / totalDuration) * 100;
              const conflict = hasConflict(schedule);

              return (
                <div key={idx} style={{
                  position: 'relative',
                  height: '36px',
                  marginBottom: '8px'
                }}>
                  {/* Background track line */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: '#334155',
                    transform: 'translateY(-50%)'
                  }} />

                  {/* Train bar */}
                  <div style={{
                    position: 'absolute',
                    left: `${left}%`,
                    width: `${Math.max(width, 2)}%`,
                    top: '4px',
                    height: '28px',
                    background: conflict
                      ? '#ef4444'
                      : TRAIN_COLORS[train.id] || '#38bdf8',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    color: '#0f172a',
                    cursor: 'pointer',
                    boxShadow: conflict
                      ? '0 0 10px #ef444466'
                      : '0 0 8px rgba(56,189,248,0.3)',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    padding: '0 6px',
                    transition: 'all 0.2s'
                  }}
                    title={`${train.name} | Arr: ${schedule.arrival_time} | Dep: ${schedule.departure_time}`}
                  >
                    {train.train_number}
                    {conflict && ' ⚠️'}
                  </div>

                  {/* Train name label */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '8px',
                    color: '#64748b',
                    fontSize: '0.7rem',
                    width: '20px',
                    textAlign: 'right',
                    marginRight: '5px'
                  }} />
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Conflict Summary */}
      {conflicts.length > 0 && (
        <div className="card" style={{ borderColor: '#ef4444' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '10px' }}>
            ⚠️ {conflicts.length} Conflict(s) Highlighted in Red
          </h3>
          {conflicts.map((c, i) => (
            <p key={i} style={{
              color: '#94a3b8', fontSize: '0.85rem', marginBottom: '5px'
            }}>
              • {c.train_1} vs {c.train_2} at {c.station}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default GanttChart;