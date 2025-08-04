import React, { useEffect, useState, useRef } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../api";

export default function SalesListPage() {
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState([]);
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);

  const filteredData = salesData.filter(item => {
    const matchesBatch = selectedBatch ? item.batch_name?.toLowerCase() === selectedBatch.toLowerCase() : true;
    const matchesCategory = selectedCategory ? item.category_name?.toLowerCase() === selectedCategory.toLowerCase() : true;
    return matchesBatch && matchesCategory;
  });

  const fetchSales = async () => {
    setLoading(true);
    try {
      // Destroy the existing DataTable instance (if any)
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      const res = await axios.get(`${API_BASE_URL}/sales`);
      if (res.data.success) {
        setSalesData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching sales:", err);
      toast.error("Failed to fetch sales data.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSales();

    axios.get(`${API_BASE_URL}/form-dropdowns`)
      .then(res => {
        const data = res.data?.data || {};
        setBatches(data.batches || []);
        setCategories(data.categories || []);
      })
      .catch(err => console.error('Error loading dropdowns:', err));
  }, []);

  // DataTable initialization — after data is ready
  useEffect(() => {
    if (!loading && filteredData.length > 0) {
      const table = $(tableRef.current);
      // Delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        if (!$.fn.DataTable.isDataTable(tableRef.current)) {
          table.DataTable({
            ordering: true,
            paging: true,
            searching: true,
            lengthChange: true,
            columnDefs: [{ targets: 0, className: "text-center" }],
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [filteredData, loading]);

  const handleDelete = async (id) => {
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      await axios.delete(`${API_BASE_URL}/sales/${id}/del`);
      toast.success("Sale deleted successfully.");
      fetchSales(); // will re-fetch and reinitialize
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete sale.");
    }
  };

  const handleViewInvoice = (saleId) => {
    try {
      window.open(`${API_BASE_URL}/sales/${saleId}/invoices`, "_blank");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-4 bg-white" style={{ minHeight: "100vh" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Sales List ({filteredData.length})</h5>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={fetchSales}>
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => navigate("/sales/add")}
          >
            + Add New
          </Button>
        </div>
      </div>

      <div className="table-responsive">
        <table ref={tableRef} className="table custom-table">
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "start" }}>S.No</th>
              <th>Customer</th>
              <th>Shipment</th>
              <th>Delivery</th>
              <th>Batch</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  <Spinner animation="border" />
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">
                  No sales data available.
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id}>
                  <td style={{ textAlign: "start" }}>{index + 1}</td>
                  <td>{item.customer_name}</td>
                  <td>{item.shipment_date}</td>
                  <td>{item.delivery_date}</td>
                  <td>{item.batch_name}</td>
                  <td>{item.category_name}</td>
                  <td>{item.quantity}</td>
                  <td className="d-flex gap-2">
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleViewInvoice(item.id)}
                    >
                      <i className="bi bi-file-earmark-pdf"></i>
                    </Button>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => navigate(`/sales/edit/${item.id}`)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
