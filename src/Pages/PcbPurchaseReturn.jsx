import React, { useEffect, useState, useRef } from "react";
import { Button, Spinner, Form } from "react-bootstrap";
import axios from "axios";
import $ from "jquery";
import "datatables.net-dt/js/dataTables.dataTables";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";

export default function PcbPurchaseReturn() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  const fetchReturns = async () => {
    setLoading(true);
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      const res = await axios.get(`${API_BASE_URL}/pcb-purchase-return`);
      setReturns(res.data || []);
    } catch (err) {
      console.error("Error fetching purchase returns:", err);
      toast.error("Failed to fetch return data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  useEffect(() => {
    if (!loading && returns.length > 0) {
      setTimeout(() => {
        if ($.fn.DataTable.isDataTable(tableRef.current)) {
          $(tableRef.current).DataTable().destroy();
        }
        $(tableRef.current).DataTable({
          ordering: true,
          paging: true,
          searching: true,
          lengthChange: true,
          columnDefs: [{ targets: 0, className: "text-center" }]
        });
        hasFetched.current = true;
      }, 300);
    }
  }, [returns, loading]);

  const handleGenerateReturnInvoice = (returnId) => {
  const pdfWindow = window.open(`${API_BASE_URL}/pcb-purchase-return-invoice/${returnId}`, '_blank');
  if (pdfWindow) {
    toast.success('Return invoice generated successfully!');
  } else {
    toast.error('Failed to generate return invoice.');
  }
};

const handleDelete = async (id) => {
  // if (!window.confirm("Are you sure you want to delete this return?")) return;

  try {
    await axios.delete(`${API_BASE_URL}/pcb-purchase-return/${id}`);
    toast.success("Return deleted successfully!");
    fetchReturns(); // Refresh the list
  } catch (err) {
    console.error("Delete error:", err);
    toast.error("Failed to delete return.");
  }
};



  return (
    <div className="p-4 bg-white" style={{ minHeight: "100vh" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Purchase Return List ({returns.length})</h5>
        <div className="d-flex gap-2">

         <Button
  variant="outline-secondary"
  size="sm"
  onClick={() => {
    if (!loading) fetchReturns();
  }}
  disabled={loading}
>
  {loading ? (
    <Spinner animation="border" size="sm" className="text-secondary" />
  ) : (
    <i className="bi bi-arrow-clockwise"></i>
  )}
</Button>

          <Button
  variant="success"
  size="sm"
  style={{
                        backgroundColor: '#2FA64F',
                        borderColor: '#2FA64F',
                        color: '#fff',

                    }}
  onClick={() => navigate("/pcb-purchase-return/add")}

>
  + Add Return
</Button>

        </div>
      </div>

      <div className="table-responsive">
        <table ref={tableRef} className="table custom-table">
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "start" }}>S.No</th>
              <th>Vendor</th>
              <th>Batch</th>
              <th>Category</th>
              <th>Invoice No</th>
              <th>Invoice Date</th>
              <th>Quantity</th>
              {/* <th>Remarks</th> */}
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
            ) : returns.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center py-4 text-muted">
                  No return data found.
                </td>
              </tr>
            ) : (
              returns.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.vendor_name}</td>
                  <td>{item.batch_name}</td>
                  <td>{item.category_name}</td>
                  <td>{item.invoice_no}</td>
                  <td>{item.invoice_date}</td>
                  <td>{item.quantity}</td>
                  {/* <td>{item.remarks}</td> */}
         <td className="py-2 pe-1 d-flex gap-2">
                 <Button variant="outline-success" size="sm" onClick={() => handleGenerateReturnInvoice(item.id)}>
  <i className="bi bi-file-earmark-pdf"></i>
</Button>

  <Button
    variant="outline-primary"
    size="sm"
    onClick={() => navigate(`/pcb-purchase-return/edit/${item.id}`)}
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
