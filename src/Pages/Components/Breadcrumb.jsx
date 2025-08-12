import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ title, subtitle }) => {
  return (
    <div
      className="app-hero-header d-flex align-items-center"
      style={{ fontSize: "0.85rem", gap: "0.5rem" }} // smaller font & some spacing
    >
      <h4 style={{ margin: 0, fontSize: "1rem" }}>
        {title || "Healthcare Dashboard"}
      </h4>

      {/* Breadcrumb */}
      <div className="ms-auto d-lg-flex d-none flex-row" style={{ fontSize: "0.75rem" }}>
        <ol className="breadcrumb mb-0" style={{ padding: 0, margin: 0 }}>
          <li className="breadcrumb-item mt-1">
            <Link to="/overview">
              <i
                className="bi bi-house-door"
                style={{ color: "#2E3A59", fontSize: "1rem" }}
              ></i>
            </Link>
          </li>
          <li
            className="breadcrumb-item mt-1"
            aria-current="page"
            style={{ color: "#2E3A59", fontSize: "1rem" }}
          >
            {title || "Healthcare Dashboard"}
          </li>
        </ol>
      </div>
    </div>
  );
};

export default Breadcrumb;
