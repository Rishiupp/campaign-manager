import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Overview from './pages/Overview';
import Campaigns from './pages/Campaigns';
import Builder from './pages/Builder';
import Monitor from './pages/Monitor';
import Templates from './pages/Templates';
import Credits from './pages/Credits';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Navigate to="/overview" />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/new" element={<Builder />} />
              <Route path="/campaigns/:id" element={<Monitor />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
