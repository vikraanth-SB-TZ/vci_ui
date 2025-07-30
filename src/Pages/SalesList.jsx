import React, { useEffect, useState, useRef } from "react";
import { Button, Modal, Spinner, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      // destroy old table instance
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      const res = await axios.get('http://localhost:8000/api/sales');
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

    axios.get('http://localhost:8000/api/form-dropdowns')
      .then(res => {
        const data = res.data?.data || {};
        setBatches(data.batches || []);
        setCategories(data.categories || []);
      })
      .catch(err => console.error('Error loading dropdowns:', err));
  }, []);

  useEffect(() => {
    if (!loading && salesData.length > 0) {
      setTimeout(() => {
        if (!$.fn.DataTable.isDataTable(tableRef.current)) {
           $(tableRef.current).DataTable().destroy();
          $(tableRef.current).DataTable({
            ordering: true,
            paging: true,
            searching: true,
            lengthChange: true,
            columnDefs: [{ targets: 0, className: "text-center" }],
          });
        }
      }, 300); // slight delay ensures DOM is ready
    }
  }, [salesData, loading]);

  const handleDelete = async (id) => {
    // if (!window.confirm("Are you sure you want to delete this sale?")) return;

    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      await axios.delete(`http://localhost:8000/api/sales/${id}/del`);
      toast.success("Sale deleted successfully.");
      fetchSales();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete sale.");
    }
  };

  const handleViewInvoice = async (saleId) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/sales/${saleId}/invoices`);
      if (res.data.pdf_url) {
        window.open(res.data.pdf_url, "_blank");
      } else {
        toast.warn("Invoice not generated.");
      }
    } catch (err) {
      console.error("Failed to load invoice PDF:", err);
      toast.error("Error generating invoice PDF.");
    }
  };




  return (
    <div className="p-4 bg-white" style={{ minHeight: "100vh" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Sales List ({filteredData.length})</h5>
        <div className="d-flex gap-2">
          {/* <select className="form-select form-select-sm" style={{ width: '150px' }} value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
            <option value="">Batch</option>
       {batches.map(batch => (
  <option key={batch.id} value={batch.batch}>{batch.batch_name}</option>
))}

          </select>

          <select className="form-select form-select-sm" style={{ width: '150px' }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Category</option>
        {categories.map(category => (
  <option key={category.id} value={category.category}>{category.category_name}</option>
))}

          </select> */}

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
            ) : salesData.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">
                  No sales data available.
                </td>
              </tr>
            ) : (
              salesData.map((item, index) => (
                <tr key={item.id}>
                  <td style={{ textAlign: "start" }}>{index + 1}</td>
                  <td>{item.customer_name}</td>
                  <td>{item.shipment_date}</td>
                  <td>{item.delivery_date}</td>
                  <td>{item.batch_name}</td>
                  <td>{item.category_name}</td>
                  <td>{item.quantity}</td>
                  <td className="d-flex gap-2">
                    <Button variant="outline-info" size="sm" onClick={() => handleViewInvoice(item.id)}>
                      <i className="bi bi-file-earmark-pdf"></i>
                    </Button>
                 {/* <Button
  variant="outline-primary"
  size="sm"
  onClick={() => setViewId(item.id)}
>
  <i className="bi bi-eye"></i>
</Button> */}

                    <Button variant="outline-warning" size="sm" onClick={() => navigate(`/sales/edit/${item.id}`)}>
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)}>
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