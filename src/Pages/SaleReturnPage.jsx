import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Button, Table } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import "bootstrap-icons/font/bootstrap-icons.css";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "../api";

export default function ReturnListPage() {
  const [returnData, setReturnData] = useState([]);
  const tableRef = useRef(null);
    const navigate = useNavigate(); // for navigation

  useEffect(() => {
    fetchReturns();
  }, []);

  useEffect(() => {
    if (returnData.length > 0 && !$.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable({
        ordering: true,
        paging: true,
        searching: true,
        lengthChange: true,
        columnDefs: [{ targets: 0, className: "text-center" }],
      });
    }
  }, [returnData]);

  const fetchReturns = () => {
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }

    axios.get(`${API_BASE_URL}/saleReturns`)
      .then(res => {
        if (res.data.data) {
          setReturnData(res.data.data);
        }
      })
      .catch(err => {
        console.error('Error fetching return list:', err);
      });
  };

const handleGenerateReturnInvoice = (returnId) => {
  const pdfWindow = window.open(`${API_BASE_URL}/sale-returns/${returnId}/invoice-pdf`, '_blank');

  if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed === 'undefined') {
    toast.error('Popup blocked! Please allow popups to view invoice.');
  }
};

// const handleDeleteReturn = (returnId) => {
//   if (window.confirm('Are you sure you want to delete this return?')) {
//     axios
//       .delete(`http://localhost:8000/api/sale-returns-del/${returnId}`)
//       .then((res) => {
//         toast.success('Return deleted successfully');
//         fetchReturns();
//       })
//       .catch((err) => {
//         console.error('Delete failed:', err);
//         toast.error('Failed to delete return');
//       });
//   }
// };


  return (
    <div className="w-100 py-4 bg-white position-relative" style={{ minHeight: '100vh', fontSize: '14px' }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 px-4">
        <h4 className="fw-semibold text-dark mb-0 fs-4">
          Return List <span className="text-dark fw-semibold">({returnData.length})</span>
        </h4>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary p-0"
            style={{ width: '38px', height: '38px' }}
            onClick={fetchReturns}
          >
            <i className="bi bi-arrow-clockwise fs-5 text-dark"></i>
          </Button>

          
          {/* 🔵 Add this button */}
          <Button
            variant="success"
            size="sm"
            onClick={() => navigate('/returns/add')}
          >
            + Add Return
          </Button>


        </div>
      </div>

      {/* Table */}
      <div className="shadow-sm overflow-hidden mx-4" style={{ borderRadius: '0.5rem' }}>
        <Table hover responsive size="sm" className="mb-0 table-border align-middle" ref={tableRef}>
          <thead>
            <tr className="border-bottom border-secondary-subtle" style={{ backgroundColor: '#f8f9fb' }}>
              <th className="py-3 px-4 text-dark fw-medium">S.No</th>
              <th className="py-3 px-3 text-dark fw-medium">Invoice No</th>
              <th className="py-3 px-3 text-dark fw-medium">Invoice Date</th>
              <th className="py-3 px-3 text-dark fw-medium">Return Invoice No</th>
              <th className="py-3 px-3 text-dark fw-medium">Return Date</th>
              <th className="py-3 px-3 text-dark fw-medium">Qty</th>
              <th className="py-3 px-3 text-dark fw-medium">Reason</th>
              <th className="py-3 px-3 text-dark fw-medium">Action</th>

            </tr>
          </thead>
          <tbody>
            {returnData.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-secondary">No return data available</td>
              </tr>
            ) : (
              returnData.map((item, index) => (
                <tr key={item.id}>
                  <td className="py-2 px-4 text-dark">{String(index + 1).padStart(2, '0')}</td>
                  <td className="py-2 px-3 text-dark">{item.invoice_no}</td>
                  <td className="py-2 px-3 text-dark">{item.invoice_date}</td>
                  <td className="py-2 px-3 text-dark">{item.return_invoice_no}</td>
                  <td className="py-2 px-3 text-dark">{item.return_invoice_date}</td>
                  <td className="py-2 px-3 text-dark">{item.quantity}</td>
                  <td className="py-2 px-3 text-dark">{item.reason}</td>
                  <td className="py-2 px-3 text-dark d-flex gap-2 ">
                    <Button
  variant="outline-success"
  size="sm"
  onClick={() => handleGenerateReturnInvoice(item.id)}
  title="Download Return Invoice PDF"
>
  <i className="bi bi-file-earmark-pdf"></i>
</Button>

  <Button
    variant="outline-primary"
    size="sm"
    onClick={() => navigate(`/returns/edit/${item.id}`)}
  >
    <i className="bi bi-pencil-square"></i>
  </Button>
    {/* <Button
    variant="outline-danger"
    size="sm"
    onClick={() => handleDeleteReturn(item.id)}
    title="Delete Return"
  >
    <i className="bi bi-trash"></i>
  </Button> */}
</td>

                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
//saleReturnPage.jsx
