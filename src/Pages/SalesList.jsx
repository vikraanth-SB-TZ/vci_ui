import React, { useEffect, useState, useRef } from "react";
import { Button, Spinner, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../api";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);

// Keep all your imports the same...

export default function SalesListPage() {
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState([]);
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);

  const MySwal = withReactContent(Swal);

  const filteredData = salesData.filter(item => {
    const matchesBatch = selectedBatch ? item.batch_name?.toLowerCase() === selectedBatch.toLowerCase() : true;
    const matchesCategory = selectedCategory ? item.category_name?.toLowerCase() === selectedCategory.toLowerCase() : true;
    return matchesBatch && matchesCategory;
  });

  const fetchSales = async () => {
    setLoading(true);
    try {
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

  useEffect(() => {
    if (!loading && filteredData.length > 0) {
      const table = $(tableRef.current);
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
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this sale?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      await axios.delete(`${API_BASE_URL}/sales/${id}/del`);
      toast.success("Sale deleted successfully!");

      const updatedSales = salesData.filter(item => item.id !== id);
      setSalesData(updatedSales);

      setTimeout(() => {
        if (updatedSales.length > 0) {
          $(tableRef.current).DataTable({
            ordering: true,
            paging: true,
            searching: true,
            lengthChange: true,
            columnDefs: [{ targets: 0, className: "text-center" }],
          });
        }
      }, 0);
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("Failed to delete sale.");
    }
  };

  const handleViewInvoice = (saleId) => {
    window.open(`${API_BASE_URL}/sales/${saleId}/invoices`, "_blank");
  };

  return (
    <div className="px-4 py-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Sales List ({filteredData.length})</h5>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={fetchSales}>
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/sales/add")}
            style={{ backgroundColor: '#2FA64F', borderColor: '#2FA64F', color: '#fff' }}
          >
            + Add New
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-3 p-3 mt-3 bg-white">
        <div className="table-responsive">
          <table ref={tableRef} className="table align-middle">
            <thead>
              <tr>
                <th style={{ backgroundColor: "#2E3A59", color: "white", width: "70px", textAlign: "center" }}>S.No</th>
                <th style={{ backgroundColor: "#2E3A59", color: "white" }}>Customer</th>
                <th style={{ backgroundColor: "#2E3A59", color: "white" }}>Invoice No</th>
                <th style={{ backgroundColor: "#2E3A59", color: "white" }}>Shipment</th>
                <th style={{ backgroundColor: "#2E3A59", color: "white" }}>Delivery</th>
                <th style={{ backgroundColor: "#2E3A59", color: "white" }}>Batch</th>
                <th style={{ backgroundColor: "#2E3A59", color: "white" }}>Category</th>
                <th style={{ backgroundColor: "#2E3A59", color: "white" }}>Qty</th>
                <th style={{ backgroundColor: "#2E3A59", color: "white" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    <img
                      src="/empty-box.png"
                      alt="No sales found"
                      style={{ width: "80px", height: "100px", opacity: 0.6 }}
                    />
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-center">{index + 1}</td>
                    <td>{item.customer_name}</td>
                    <td>{item.invoice_no}</td>
                    <td>{item.shipment_date}</td>
                    <td>{item.delivery_date}</td>
                    <td>{item.batch_name}</td>
                    <td>{item.category_name}</td>
                    <td>{item.quantity}</td>
                    <td className="d-flex gap-2">
                      <Button
                        variant=""
                        size="sm"
                        onClick={() => handleViewInvoice(item.id)}
                        style={{ borderColor: '#2E3A59', color: '#2E3A59' }}
                      >
                        <i className="bi bi-file-earmark-pdf"></i>
                      </Button>
                      <Button
                        variant=""
                        size="sm"
                        onClick={() => navigate(`/sales/edit/${item.id}`)}
                        style={{ borderColor: '#2E3A59', color: '#2E3A59' }}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </Button>
                      <Button
                        variant=""
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        style={{ borderColor: '#2E3A59', color: '#2E3A59' }}
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
      </Card>
    </div>
  );
}

