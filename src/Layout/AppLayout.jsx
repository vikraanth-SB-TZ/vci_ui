import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import DashboardLayout from './DashboardLayout';

export default function AppLayout({ onLogout }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [autoCollapsed, setAutoCollapsed] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  // Listen to window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setAutoCollapsed(true);
      } else {
        setAutoCollapsed(false);
      }
    };
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isCollapsed = autoCollapsed && !hovered;

  return (
    <div className="d-flex" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: isCollapsed ? '80px' : '280px',
          flexShrink: 0,
          transition: 'width 0.3s',
        }}
      >
        <Sidebar collapsed={isCollapsed} />
      </div>

      {/* Main content */}
      <div className="d-flex flex-column flex-grow-1" style={{ overflow: 'hidden' }}>
        <div style={{ flexShrink: 0 }}>
          <DashboardLayout onLogout={onLogout} />
        </div>
        <div className="flex-grow-1 overflow-auto bg-light" style={{ minHeight: 0 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
