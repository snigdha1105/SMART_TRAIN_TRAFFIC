import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Conflicts from './components/Conflicts';
import Predictor from './components/Predictor';
import WhatIf from './components/WhatIf';
import GanttChart from './components/GanttChart';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">🚆 Smart Train Traffic Control</div>
        <div className="nav-links">
          <button
            className={activePage === 'dashboard' ? 'active' : ''}
            onClick={() => setActivePage('dashboard')}>
            Dashboard
          </button>
          <button
            className={activePage === 'conflicts' ? 'active' : ''}
            onClick={() => setActivePage('conflicts')}>
            Conflicts
          </button>
          <button
            className={activePage === 'predictor' ? 'active' : ''}
            onClick={() => setActivePage('predictor')}>
            Delay Predictor
          </button>
          <button
            className={activePage === 'whatif' ? 'active' : ''}
            onClick={() => setActivePage('whatif')}>
            What-if
          </button>
          <button
            className={activePage === 'gantt' ? 'active' : ''}
            onClick={() => setActivePage('gantt')}>
            Timeline
          </button>
        </div>
      </nav>

      <div className="content">
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'conflicts' && <Conflicts />}
        {activePage === 'predictor' && <Predictor />}
        {activePage === 'whatif' && <WhatIf />}
        {activePage === 'gantt' && <GanttChart />}
      </div>
    </div>
  );
}

export default App;