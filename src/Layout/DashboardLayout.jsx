import React, { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";

export default function DashboardLayout({ onLogout }) {
  const [showLogout, setShowLogout] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const logoutRef = useRef(null);

  useEffect(() => {
    const email = localStorage.getItem("authEmail");
    if (email) setUserEmail(email);
  }, []);

  const getInitial = () => {
    return userEmail ? userEmail.charAt(0).toUpperCase() : "M";
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authEmail");
    onLogout();
  };

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        logoutRef.current &&
        !logoutRef.current.contains(event.target)
      ) {
        setShowLogout(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="p-2 border-bottom" style={{ backgroundColor: '#2E3A590A' }}>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">

        {/* Search Input */}
        <InputGroup
          style={{
            maxWidth: "300px",
            backgroundColor: "#F4F4F8",
            marginInlineStart: "20px",
            borderRadius: "6px",
            border: "1px solid #ced4da",
            overflow: "hidden"
          }}
        >
          <InputGroup.Text style={{ backgroundColor: "#F4F4F8", border: "none" }}>
            <img
              src="/image.png"
              alt="search"
              style={{ width: "16px", height: "16px", opacity: 0.6 }}
            />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search"
            style={{
              backgroundColor: "#F4F4F8",
              border: "none",
              boxShadow: "none"
            }}
          />
        </InputGroup>

        {/* User Info and Logout */}
        <div className="d-flex align-items-center gap-3 position-relative" ref={logoutRef}>
          {/* Email display */}
          <div className="text-end">
            <div className="fw-bold">UserName</div>
            <div style={{ fontWeight: 400, color: "#5f6368", fontSize: "14px" }}>
              {userEmail}
            </div>
          </div>

          {/* Avatar circle */}
          <div
            className="rounded-circle d-flex justify-content-center align-items-center"
            style={{
              width: "40px",
              height: "40px",
              cursor: "pointer",
              backgroundColor: "#2E3A59",
              color: "#4ade80",
              fontWeight: "bold",
            }}
            onClick={() => setShowLogout((prev) => !prev)}
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
      </div>
    </header>
  );
}
