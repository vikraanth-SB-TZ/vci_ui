import React, { useState } from "react";
import { Button, Spinner } from "react-bootstrap";

export default function DistrictPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setItems([]);
      setLoading(false);
    }, 1000);
  };

  const handleAddNew = () => {
    const newItem = {
      id: items.length + 1,
      name: `District ${items.length + 1}`,
    };
    setItems([...items, newItem]);
  };

  return (
    <div className="d-flex flex-column h-100">
      {/* Page Title */}
      <section className="px-4 py-3 border-bottom bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">
          Districts{" "}
          <span className="text-muted fw-normal">
            ({items.length})
          </span>
        </h5>
        <div>
          <Button variant="light" className="me-2" onClick={handleRefresh}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <i className="bi bi-arrow-clockwise"></i>
            )}
          </Button>
          <Button variant="success" onClick={handleAddNew}>
            <i className="bi bi-plus-lg me-1"></i> Add New
          </Button>
        </div>
      </section>

      {/* Table Header */}
      {items.length > 0 && (
        <div className="px-4 py-2 border-bottom d-none d-md-flex text-muted bg-white small fw-semibold">
          <div style={{ width: "80px" }}>S.No</div>
          <div style={{ flex: 1 }}>District</div>
          <div style={{ width: "150px" }}>Action</div>
        </div>
      )}

      {/* Content */}
      <div className="flex-grow-1 overflow-auto bg-light">
        {items.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="text-center">
              <img
                src="/empty-box.png"
                alt="No Districts"
                style={{ width: "60px" }}
                className="mb-2"
              />
              <div className="text-muted">No Districts Found</div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="d-flex align-items-center border-bottom py-2 bg-white"
              >
                <div style={{ width: "80px" }}>{index + 1}</div>
                <div style={{ flex: 1 }}>{item.name}</div>
                <div style={{ width: "150px" }}>
                  <Button variant="outline-danger" size="sm">
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
