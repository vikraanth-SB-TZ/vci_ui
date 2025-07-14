import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

export default function LoginPage({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 vw-100 bg-light">
      <div className="d-flex flex-row shadow w-100 h-100" style={{ maxWidth: '100%', maxHeight: '100%' }}>
        {/* Left Side */}
        <div
          className="d-none d-md-flex flex-column justify-content-center align-items-center text-white px-4"
          style={{ backgroundColor: '#0E1239', width: '50%', height: '100%', position: 'relative' }}
        >
          <img
            src="/logo.png"
            alt="Tamilzorous Logo"
            style={{ width: '160px', position: 'absolute', top: '30px', left: '30px' }}
          />
          <img
            src="/side-image.png"
            alt="Product Illustration"
            className="img-fluid w-75"
          />
        </div>

        {/* Right Side - Login */}
        <div className="bg-white d-flex flex-column justify-content-center align-items-center px-4" style={{ width: '50%', height: '100%' }}>
          <div style={{ width: '100%', maxWidth: '360px' }}>
            <h2 className="fw-bold mb-2">Welcome Back</h2>
            <p className="text-muted mb-4">Login to continue using the website</p>

            <Form onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" placeholder="Enter your email" required />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    required
                  />
                  <span
                    className="input-group-text"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </span>
                </div>
              </Form.Group>

              <Form.Check
                type="checkbox"
                id="rememberMe"
                label="Remember Me"
                className="mb-3"
              />

              <Button variant="success" type="submit" className="w-100">
                Login
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
