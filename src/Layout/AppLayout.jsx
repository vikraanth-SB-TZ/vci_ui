import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import DashboardLayout from './DashboardLayout';

export default function AppLayout({ onLogout }) {
  return (
    <div className="d-flex" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar - Fixed width */}
      <div style={{ width: '270px', flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="d-flex flex-column flex-grow-1" style={{ overflow: 'hidden' }}>
        {/* Header - fixed height */}
        <div style={{ flexShrink: 0 }}>
          <DashboardLayout onLogout={onLogout} />
        </div>

        {/* Outlet - scrollable, fills all remaining vertical & horizontal space */}
        <div
          className="flex-grow-1 overflow-auto bg-light"
          style={{ minHeight: 0 }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
