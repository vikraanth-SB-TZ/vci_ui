// Layout/DashboardLayout.jsx
import React, { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

export default function DashboardLayout({ onLogout }) {
  const [showLogout, setShowLogout] = useState(false);

  return (
    <header className="d-flex justify-content-between align-items-center bg-white p-3 border-bottom">
      <InputGroup style={{ maxWidth: '300px' }}>
        <Form.Control placeholder="Search" />
      </InputGroup>

      <div className="d-flex align-items-center gap-3 position-relative">
        <div className="text-end">
          <div className="fw-bold">Mohan</div>
          <div className="text-muted small">mohan@gmail.com</div>
        </div>

        <div
          className="rounded-circle d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: '#112849',
            color: 'green', // This sets the "M" to green
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => setShowLogout(!showLogout)}
        >
          M
        </div>

        {showLogout && (
          <div
            className="position-absolute top-100 end-0 mt-2 bg-white border shadow-sm p-2 rounded"
            style={{ zIndex: 10 }}
          >
            <Button variant="outline-danger" size="sm" onClick={onLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}