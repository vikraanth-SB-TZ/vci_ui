import React, { useEffect, useState, useRef } from 'react';
import { Button, Spinner } from 'react-bootstrap'; 

import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../api";

export default function PurchaseListPage() {
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const hasFetched = useRef(false);
const [loading, setLoading] = useState(false);

  const [purchaseData, setPurchaseData] = useState([]);

const fetchPurchases = () => {
  setLoading(true);
  axios
    .get(`${API_BASE_URL}/purchase`)
    .then(res => setPurchaseData(res.data))
    .catch(err => {
      console.error('Error fetching purchase list:', err);
      toast.error('Failed to fetch purchase list.');
    })
    .finally(() => {
      setLoading(false);
    });
};


  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchPurchases();
  }, []);

  useEffect(() => {
    const $table = $(tableRef.current);

    if ($.fn.DataTable.isDataTable($table)) {
      $table.DataTable().destroy();
    }

    if (purchaseData.length > 0) {
      setTimeout(() => {
        $table.DataTable({
          ordering: true,
          paging: true,
          searching: true,
          lengthChange: true,
          columnDefs: [{ targets: 0, className: 'text-center' }],
        });
      }, 0);
    }
  }, [purchaseData]);

  const handleEdit = (item) => {
    navigate(`/purchase/${item.id}/edit`);
  };

  
function handleDelete(purchaseId) {
  // if (!window.confirm("Are you sure you want to delete this purchase?")) return;

  axios
    .delete(`${API_BASE_URL}/purchases/${purchaseId}`)
    .then((res) => {
      toast.success(res.data.message || 'Purchase deleted successfully');
    })
    .catch((err) => {
      toast.error(
        err.response?.data?.message || 'Failed to delete purchase'
      );
    });
}

const handleGenerateInvoice = (purchaseId) => {
  const pdfWindow = window.open(`${API_BASE_URL}/pcb-purchase-invoice/${purchaseId}`, '_blank');
  if (pdfWindow) {
    toast.success('Invoice generated successfully!');
  } else {
    toast.error('Failed to generate invoice.');
  }
};

  return (
    <div className="w-100 py-4 bg-white" style={{ minHeight: '100vh', fontFamily: 'Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif,Product Sans', fontSize: '14px', fontWeight: '500' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 px-4">
        <h5 className="fw-bold  mb-0 ">
          Purchase List <span className="text-dark fw-bold">({purchaseData.length})</span>
        </h5>

      <div className="d-flex gap-2">
<Button
  variant="outline-secondary p-0"
  style={{ width: '38px', height: '38px' }}
  onClick={() => {
    if (!loading) fetchPurchases();
  }}
  disabled={loading}
>
  {loading ? (
    <Spinner animation="border" size="sm" className="text-secondary" />
  ) : (
    <i className="bi bi-arrow-clockwise fs-5 text-secondary"></i>
  )}
</Button>

  <Button variant="success" style={{
                        backgroundColor: '#2FA64F',
                        borderColor: '#2FA64F',
                        color: '#fff',

                    }} onClick={() => navigate('/purchase/add')}>
    <i className="bi bi-plus-lg me-1"></i> Add New
  </Button>
</div>

      </div>
    <div className="mx-4 shadow-sm overflow-hidden" style={{ borderRadius: '0.5rem' }}>
      <div className="table-responsive">
  <table ref={tableRef} className="table custom-table">
    <thead>
      <tr>
        <th style={{ width: "60px", textAlign: "start" }}>S.No</th>
        <th>Vendor</th>
        <th>Invoice No</th>
        <th>Invoice Date</th>
        <th>Batch</th>
        <th>Category</th>
        <th>Quantity</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {loading ? (
        <tr>
          <td colSpan="8" className="text-center py-4">
            <Spinner animation="border" />
          </td>
        </tr>
      ) : purchaseData.length === 0 ? (
        <tr>
          <td colSpan="8" className="text-center py-4 text-muted">
            No purchase data available
          </td>
        </tr>
      ) : (
        purchaseData.map((item, index) => (
          <tr key={item.id}>
             <td className="fw-normal">{index + 1}</td>
    <td className="fw-normal">{item.vendor}</td>
    <td className="fw-normal">{item.invoice_no}</td>
    <td className="fw-normal">{item.invoice_date}</td>
    <td className="fw-normal">{item.batch}</td>
    <td className="fw-normal">{item.category}</td>
    <td className="fw-normal">{item.quantity}</td>
            <td className="py-2 pe-1 d-flex gap-2">
              <Button variant="outline-success" size="sm" onClick={() => handleGenerateInvoice(item.id)}>
                <i className="bi bi-file-earmark-pdf"></i>
              </Button>
              <Button variant="outline-info" size="sm" onClick={() => handleEdit(item)}>
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
</div>


      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop />
    </div>
  );
}
