import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner } from "react-bootstrap";
import { API_BASE_URL } from "../api";

export default function SoldPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchSoldProducts();
  }, []);

  const fetchSoldProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/products`);
      const soldProducts = res.data.filter(
        (product) => product.sale_status?.toLowerCase() === "sold"
      );
      setProducts(soldProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-100 d-flex flex-column bg-light">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white sticky-top">
        <h5 className="mb-0 fw-bold">
          Sold Products ({String(products.length).padStart(2, "0")})
        </h5>
        <Button variant="outline-secondary" size="sm" onClick={fetchSoldProducts}>
          {loading ? <Spinner animation="border" size="sm" /> : <i className="bi bi-arrow-clockwise"></i>}
        </Button>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: "auto", minWidth: "1000px" }}>
        {/* Header Row */}
        <div
          className="d-flex align-items-center px-4 border-bottom small fw-semibold"
          style={{ backgroundColor: "#E9ECEF", height: "60px" }}
        >
          <div style={{ width: "60px" }}>S.No</div>
          <div style={{ flex: 2 }}>Category</div>
          <div style={{ flex: 2 }}>Batch</div>
          <div style={{ flex: 2 }}>Serial No.</div>
          <div style={{ flex: 2 }}>Manufacture No.</div>
          <div style={{ flex: 2 }}>Firmware Version</div>
          <div style={{ flex: 2 }}>HSN Code</div>
          <div style={{ flex: 2 }}>Test</div>
        </div>

        {loading ? (
          <div className="text-center mt-4">
            <Spinner animation="border" />
          </div>
        ) : products.length === 0 ? (
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ height: "60vh" }}
          >
            <img src="/empty-box.png" alt="Empty" style={{ width: "160px", opacity: 0.6 }} />
            <p className="mt-3 text-muted">No sold products found</p>
          </div>
        ) : (
          products.map((product, index) => (
            <div
              key={product.id}
              className="px-4 py-2 border-bottom d-flex bg-white align-items-center small"
            >
              <div style={{ width: "60px" }}>{index + 1}</div>
              <div style={{ flex: 2 }}>{product.category?.category || "—"}</div>
              <div style={{ flex: 2 }}>{product.batch?.batch || "—"}</div>
              <div style={{ flex: 2 }}>{product.serial_no || "—"}</div>
              <div style={{ flex: 2 }}>{product.manufacture_no || "—"}</div>
              <div style={{ flex: 2 }}>{product.firmware_version || "—"}</div>
              <div style={{ flex: 2 }}>{product.hsn_code || "—"}</div>
              <div style={{ flex: 2 }}>{product.test || "—"}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
