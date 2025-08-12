import React, { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

export default function DashboardLayout({ onLogout }) {
  const [showLogout, setShowLogout] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const logoutRef = useRef(null);
  const navigate = useNavigate();

  const labelMap = {
    Vendor: "Vendor",
    purchaseOrder: "Purchase Order",
    purchaseReturn: "Purchase Return",
    vciCustomer: "Customer",
    salesOrder: "Sales Order",
    salesReturn: "Sales Return",
    serviceProduct: "Service Product",
    batch: "Batch",
    category: "Category",
    productTest: "Product Test",
    sold: "Sold",
    state: "State",
    district: "District",
    countries: "Countries",
    Spareparts: "Spare Parts",
    PurchaseSpareparts: "Purchase Spare Parts",
    ReturnSpareParts: "Return Spare Parts",
    overview: "Overview",
  };

  const searchableItems = Object.keys(labelMap);

  useEffect(() => {
    const email = localStorage.getItem("authEmail");
    const name = localStorage.getItem("authName");
    if (email) setUserEmail(email);
    if (name) setUserName(name);
  }, []);

  const getInitial = () => {
    return userName
      ? userName.charAt(0).toUpperCase()
      : userEmail
      ? userEmail.charAt(0).toUpperCase()
      : "M";
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authEmail");
    localStorage.removeItem("authName");
    onLogout();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (logoutRef.current && !logoutRef.current.contains(event.target)) {
        setShowLogout(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    if (searchTerm.trim() === "") {
      setFilteredSuggestions(searchableItems);
    } else {
      const filtered = searchableItems.filter((item) =>
        labelMap[item].toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setFilteredSuggestions([]), 150);
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSuggestions([]);
      return;
    }

    const filtered = searchableItems.filter((item) =>
      labelMap[item].toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      navigate(`/${trimmed}`);
      setSearchTerm("");
      setFilteredSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(`/${suggestion}`);
    setSearchTerm("");
    setFilteredSuggestions([]);
  };

  return (
    <header
      className="p-2 border-bottom"
      style={{ backgroundColor: "#2E3A590A", fontSize: "14px" }}
    >
      <div
        className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3"
        style={{ position: "relative" }}
      >
        {/* Search Form Container */}
        <div
          style={{
            position: "relative",
            width: "320px",
            minWidth: "280px",
          }}
        >
          <Form
            onSubmit={handleSearchSubmit}
            style={{ position: "relative" }}
            autoComplete="off"
          >
            <InputGroup
              size="sm"
              style={{
                backgroundColor: "#F4F4F8",
                borderRadius: "8px",
                border: "1px solid #ced4da",
                overflow: "hidden",
                fontSize: "15px",
                boxShadow: "0 1px 3px rgb(0 0 0 / 0.1)",
              }}
            >
              <InputGroup.Text
                style={{
                  backgroundColor: "#F4F4F8",
                  border: "none",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  color: "#94a3b8",
                }}
              >
                <img
                  src="/image.png"
                  alt="search"
                  style={{ width: "18px", height: "18px", opacity: 0.7 }}
                />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                style={{
                  backgroundColor: "#F4F4F8",
                  border: "none",
                  boxShadow: "none",
                  padding: "8px 14px",
                  color: "#2d3748",
                  fontWeight: "500",
                }}
                aria-autocomplete="list"
              />
            </InputGroup>

            {/* Suggestions Dropdown */}
         {/* Suggestions Dropdown */}
{filteredSuggestions.length > 0 && (
  <div
    role="listbox"
    aria-label="Search suggestions"
    style={{
      position: "absolute",
      top: "calc(100% + 8px)",
      left: 0,
      right: 0,
      zIndex: 1100,
      maxHeight: "280px",
      overflowY: "auto",
      borderRadius: "8px",
      backgroundColor: "#ffffff",  // solid white background
      border: "1px solid #ddd",    // crisp border for separation
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)", // subtle shadow, no blur
      padding: "6px 0",
      userSelect: "none",
      animation: "fadeInDropdown 0.22s ease-out",
    }}
  >
    {filteredSuggestions.map((suggestion, index) => (
      <div
        key={suggestion}
        role="option"
        tabIndex={0}
        onClick={() => handleSuggestionClick(suggestion)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSuggestionClick(suggestion);
          }
        }}
        style={{
          cursor: "pointer",
          padding: "10px 20px",
          margin: "0 12px 6px 12px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#333",
          fontWeight: "600",
          fontSize: "15px",
          transition: "background-color 0.25s ease, color 0.25s ease",
          outline: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#e2e8f0"; // light gray
          e.currentTarget.style.color = "#1a202c"; // darker text
          const icon = e.currentTarget.querySelector("svg");
          if (icon) icon.style.opacity = 1;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#333";
          const icon = e.currentTarget.querySelector("svg");
          if (icon) icon.style.opacity = 0;
        }}
        onFocus={(e) => {
          e.currentTarget.style.backgroundColor = "#e2e8f0";
          e.currentTarget.style.color = "#1a202c";
          const icon = e.currentTarget.querySelector("svg");
          if (icon) icon.style.opacity = 1;
        }}
        onBlur={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#333";
          const icon = e.currentTarget.querySelector("svg");
          if (icon) icon.style.opacity = 0;
        }}
      >
        <span>{labelMap[suggestion]}</span>
        <FiChevronRight
          size={20}
          color="#1a202c"
          aria-hidden="true"
          style={{
            transition: "opacity 0.3s ease",
            opacity: 0,
            flexShrink: 0,
          }}
        />
      </div>
    ))}

    <style>{`
      ::-webkit-scrollbar {
        width: 8px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background-color: #a0aec0;
        border-radius: 4px;
      }
      @keyframes fadeInDropdown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  </div>
)}

          </Form>
        </div>

        {/* User Info and Logout */}
        <div
          className="d-flex align-items-center gap-2 position-relative"
          ref={logoutRef}
          style={{ fontSize: "13px" }}
        >
          <div className="text-end">
            <div className="fw-bold">{userName || "User"}</div>
            <div style={{ fontWeight: 400, color: "#5f6368", fontSize: "12px" }}>
              {userEmail}
            </div>
          </div>

          <div
            className="rounded-circle d-flex justify-content-center align-items-center"
            style={{
              width: "36px",
              height: "36px",
              cursor: "pointer",
              backgroundColor: "#2E3A59",
              color: "#4ade80",
              fontWeight: "bold",
              fontSize: "18px",
              userSelect: "none",
              boxShadow: "0 2px 8px rgb(0 0 0 / 0.15)",
              transition: "background-color 0.3s ease",
            }}
            onClick={() => setShowLogout((prev) => !prev)}
            aria-label="User menu"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowLogout((prev) => !prev);
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#344475";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2E3A59";
            }}
          >
            {getInitial()}
          </div>

          {showLogout && (
            <div
              className="position-absolute top-100 end-0 mt-2 bg-white border shadow-sm p-2 rounded"
              style={{ zIndex: 10, minWidth: "110px" }}
            >
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleLogout}
                style={{ fontSize: "13px", padding: "6px 10px" }}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
