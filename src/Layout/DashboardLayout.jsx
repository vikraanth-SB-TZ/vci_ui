import React, { useEffect, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
 
export default function DashboardLayout({ onLogout }) {
  const [showLogout, setShowLogout] = useState(false);
  const [userEmail, setUserEmail] = useState('');
 
  useEffect(() => {
    const email = localStorage.getItem('authEmail');
    if (email) setUserEmail(email);
  }, []);
 
  const getInitial = () => {
    return userEmail ? userEmail.charAt(0).toUpperCase() : 'M';
  };
 
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authEmail');
    onLogout();
  };
 
  return (
    <header className="d-flex justify-content-between bg-white align-items-center p-2 border-bottom">
      <InputGroup style={{ maxWidth: '300px', backgroundColor: '#F8F9FA' }}>
        <Form.Control placeholder="Search" />
      </InputGroup>
 
      <div className="d-flex align-items-center gap-3 position-relative">
        {/* Email display */}
        <div className="text-end">
          <div className="fw-bold">{userEmail}</div>
          <div className="text-muted small"></div>
        </div>
 
        {/* Avatar circle */}
        <div
          className="rounded-circle d-flex justify-content-center align-items-center"
          style={{
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            backgroundColor: '#2E3A59',
            color: '#4ade80',
            fontWeight: 'bold',
          }}
          onClick={() => setShowLogout(!showLogout)}
        >
          {getInitial()}
        </div>
 
        {/* Logout dropdown */}
        {showLogout && (
          <div
            className="position-absolute top-100 end-0 mt-2 bg-white border shadow-sm p-2 rounded"
            style={{ zIndex: 10 }}
          >
            <Button variant="outline-danger" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
 
 