import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PurchaseListPage() {
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const hasFetched = useRef(false);

  const [purchaseData, setPurchaseData] = useState([]);

  const fetchPurchases = () => {
    axios.get('http://localhost:8000/api/purchase')
      .then(res => setPurchaseData(res.data))
      .catch(err => {
        console.error('Error fetching purchase list:', err);
        toast.error('Failed to fetch purchase list.');
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
    .delete(`http://localhost:8000/api/purchases/${purchaseId}`)
    .then((res) => {
      toast.success(res.data.message || 'Purchase deleted successfully');
      // Optionally refresh list or remove item from state
    })
    .catch((err) => {
      toast.error(
        err.response?.data?.message || 'Failed to delete purchase'
      );
    });
}

  const handleGenerateInvoice = async (purchaseId) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/pcb-purchase-invoice/${purchaseId}`);
      if (res.data.url) {
        window.open(res.data.url, '_blank');
        toast.success('Invoice generated successfully!');
      } else {
        toast.warning('PDF URL not found.');
      }
    } catch (err) {
      console.error('Failed to generate invoice:', err);
      toast.error('Failed to generate invoice.');
    }
  };

  return (
    <div className="w-100 py-4 bg-white" style={{ minHeight: '100vh', fontFamily: 'Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif,Product Sans', fontSize: '14px', fontWeight: '500' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 px-4">
        <h4 className="fw-semibold text-dark mb-0 fs-4">
          Purchase List <span className="text-dark fw-semibold">({purchaseData.length})</span>
        </h4>

      <div className="d-flex gap-2">
  <Button variant="outline-secondary p-0" style={{ width: '38px', height: '38px' }} onClick={fetchPurchases}>
    <i className="bi bi-arrow-clockwise fs-5 text-secondary"></i>
  </Button>
  <Button variant="success" onClick={() => navigate('/purchase/add')}>
    <i className="bi bi-plus-lg me-1"></i> Add Purchase
  </Button>
</div>

      </div>

      <div className="shadow-sm overflow-hidden mx-4" style={{ borderRadius: '0.5rem' }}>
        <table ref={tableRef} className="table table-hover table-sm table-border mb-0 w-100">
          <thead>
            <tr className="border-bottom border-secondary-subtle">
              <th className="text-dark fw-semibold py-3 ps-4" style={{ backgroundColor: '#f3f7faff' }}>Sno</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f3f7faff' }}>Vendor</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f3f7faff' }}>Invoice no</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f3f7faff' }}>Invoice Date</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f3f7faff' }}>Batch</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f3f7faff' }}>Category</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f3f7faff' }}>Quantity</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f3f7faff' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchaseData.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-secondary">No purchase data available</td>
              </tr>
            ) : (
              purchaseData.map((item, index) => (
                <tr key={item.id}>
                  <td className="py-2 ps-4 text-dark">{String(index + 1).padStart(2, '0')}</td>
                  <td className="py-2 text-dark">{item.vendor}</td>
                  <td className="py-2 text-dark">{item.invoice_no}</td>
                  <td className="py-2 text-dark">{item.invoice_date}</td>
                  <td className="py-2 text-dark">{item.batch}</td>
                  <td className="py-2 text-dark">{item.category}</td>
                  <td className="py-2 text-dark">{item.quantity}</td>
                  <td className="py-2 pe-1 d-flex gap-2">
                    <Button variant="outline-info rounded-circle" size="sm" onClick={() => handleGenerateInvoice(item.id)}>
                      <i className="bi bi-file-earmark-pdf"></i>
                    </Button>
                    {/* <Button variant="outline-primary rounded-circle" size="sm">
                      <i className="bi bi-eye"></i>
                    </Button> */}
                    <Button variant="outline-warning rounded-circle" size="sm" onClick={() => handleEdit(item)}>
                      <i className="bi bi-pencil-square"></i>
                    </Button>
<Button
  variant="outline-danger rounded-circle"
  size="sm"
  onClick={() => handleDelete(item.id)} // ✅ correct ID
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

      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop />
    </div>
  );
}
