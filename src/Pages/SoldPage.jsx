import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner } from "react-bootstrap";

export default function SoldPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiBase = "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchSoldProducts();
  }, []);

  const fetchSoldProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/products`);
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
    <div className="d-flex flex-column h-100">
      {/* Header */}
      <section className="px-4 py-3 border-bottom bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">
          Sold Products
          <span className="text-muted fw-normal">
            ({String(products.length).padStart(2, "0")})
          </span>
        </h5>
        <Button variant="light" onClick={fetchSoldProducts}>
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <i className="bi bi-arrow-clockwise"></i>
          )}
        </Button>
      </section>

      {/* Table Header */}
      <div className="px-4 py-2 border-bottom d-none d-md-flex text-muted bg-light small fw-semibold">
        <div style={{ width: "60px" }}>S.No</div>
        {/* <div style={{ flex: 1 }}>Product</div> */}
        <div style={{ flex: 1 }}>Category</div>
        <div style={{ flex: 1 }}>Batch</div>
        <div style={{ flex: 1 }}>Serial No</div>
        <div style={{ flex: 1 }}>Manufacture No</div>
        <div style={{ flex: 1 }}>Firmware Version</div>
        <div style={{ flex: 1 }}>HSN Code</div>
        <div style={{ flex: 1 }}>Test</div>
        {/* <div style={{ flex: 1 }}>Notes</div> */}
      </div>

      {/* Table Body */}
      <div className="flex-grow-1 overflow-auto bg-light">
        {products.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="text-center">
              <img
                src="/empty-box.png"
                alt="Empty"
                style={{ width: "160px" }}
                className="mb-2"
              />
              {/* <div className="text-muted">No sold products found.</div> */}
            </div>
          </div>
        ) : (
          <div className="px-4 py-1">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="d-flex align-items-center py-3 border-bottom"
              >
                <div style={{ width: "60px" }}>{String(index + 1).padStart(2, "0")}</div>
                {/* <div style={{ flex: 1 }}>{product.product}</div> */}
                <div style={{ flex: 1 }}>{product.category?.category || "-"}</div>
                <div style={{ flex: 1 }}>{product.batch?.batch || "-"}</div>
                <div style={{ flex: 1 }}>{product.serial_no}</div>
                <div style={{ flex: 1 }}>{product.manufacture_no}</div>
                <div style={{ flex: 1 }}>{product.firmware_version}</div>
                <div style={{ flex: 1 }}>{product.hsn_code}</div>
                <div style={{ flex: 1 }}>{product.test}</div>
                {/* <div style={{ flex: 1 }}>{product.notes}</div> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
