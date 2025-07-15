// Pages/BatchPage.jsx
import React from "react";
import { Button } from "react-bootstrap";

export default function BatchPage() {
  return (
    <div className="d-flex flex-column h-100">
      {/* Page Title */}
      <section className="px-4 py-3 border-bottom bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">
          Batch <span className="text-muted fw-normal">(0)</span>
        </h5>
        <div>
          <Button variant="light" className="me-2">
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button variant="success">
            <i className="bi bi-plus-lg me-1"></i> Add New
          </Button>
        </div>
      </section>

      {/* Table Headers */}
      <div className="px-4 py-2 border-bottom d-none d-md-flex text-muted bg-white small fw-semibold">
        <div style={{ width: "80px" }}>S.No</div>
        <div style={{ flex: 1 }}>Batch</div>
        <div style={{ width: "150px" }}>Action</div>
      </div>

      {/* Empty State Center */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center bg-light overflow-auto">
        <div className="text-center">
          <img
            src="/empty-box.png"
            alt="Empty Data"
            style={{ width: "60px" }}
            className="mb-2"
          />
          <div className="text-muted">Empty Data</div>
        </div>
      </div>
    </div>
  );
}
