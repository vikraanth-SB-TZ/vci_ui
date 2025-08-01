import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import { API_BASE_URL } from "../api";

export default function SoldPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);


  useEffect(() => {
    fetchSoldProducts();
  }, []);

  useEffect(() => {
    if (!loading && products.length > 0 && !$.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable({
        ordering: true,
        paging: true,
        searching: true,
        lengthChange: true,
        columnDefs: [{ targets: 0, className: "text-center" }],
      });
    }
  }, [products, loading]);

  const fetchSoldProducts = async () => {
    setLoading(true);
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      const res = await axios.get(`${API_BASE_URL}/products`);
      const soldProducts = Array.isArray(res.data)
        ? res.data.filter(
          (product) => product.sale_status?.toLowerCase() === "sold"
        )
        : [];
      setProducts(soldProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch sold products!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3">
        <h5 className="fw-bold">
          Sold Products ({products.length.toString().padStart(2, "0")})
        </h5>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={fetchSoldProducts}
        >
          <i className="bi bi-arrow-clockwise"></i>
        </Button>
      </div>

      <div className="table-responsive">
        <table ref={tableRef} className="table custom-table">
          <thead>
            <tr>
              <th style={{ textAlign: "center", width: "70px" }}>S.No</th>
              <th>Category</th>
              <th>Batch</th>
              <th>Serial No.</th>
              <th>Manufacture No.</th>
              <th>Firmware Version</th>
              <th>HSN Code</th>
              <th>Test</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  <Spinner animation="border" />
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">
                  No sold products found.
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={product.id}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{product.category?.category || "—"}</td>
                  <td>{product.batch?.batch || "—"}</td>
                  <td>{product.serial_no || "—"}</td>
                  <td>{product.manufacture_no || "—"}</td>
                  <td>{product.firmware_version || "—"}</td>
                  <td>{product.hsn_code || "—"}</td>
                  <td>{product.test || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
