import React, { useEffect, useState, useRef } from "react";
import { Button, Spinner, Form } from "react-bootstrap";
import axios from "axios";
import $ from "jquery";
import "datatables.net-dt/js/dataTables.dataTables";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Row, Col } from "react-bootstrap";

export default function PcbPurchaseReturn() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [formData, setFormData] = useState({
    pcb_board_purchase_id: "",
    invoice_no: "",
    invoice_date: "",
 
  });
  const [dropdowns, setDropdowns] = useState({ vendors: [], batches: [], categories: [] });
  const tableRef = useRef(null);
  const hasFetched = useRef(false);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      const res = await axios.get("http://localhost:8000/api/pcb-purchase-return");
      setReturns(res.data || []);
    } catch (err) {
      console.error("Error fetching purchase returns:", err);
      toast.error("Failed to fetch return data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/form-dropdowns");
      const data = res.data.data;
      setDropdowns({
        vendors: data.vendors,
        batches: data.batches,
        categories: data.categories
      });
    } catch (err) {
      toast.error("Failed to load dropdown data.");
    }
  };

  useEffect(() => {
    fetchReturns();
    fetchDropdownData();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
const handleSubmit = async (e) => {
  e.preventDefault();

 if (!formData.pcb_board_purchase_id || !formData.invoice_no || !formData.invoice_date) {
  toast.error("Please fill all required fields.");
  return;
}


  const returnPayload = {
    pcb_board_purchase_id: parseInt(formData.pcb_board_purchase_id), 
    invoice_no: formData.invoice_no,
    invoice_date: formData.invoice_date
  };

  try {
    await axios.post('http://localhost:8000/api/return-store', returnPayload);
    toast.success('Return added successfully!');

    setShowAddPanel(false);
    fetchPurchases(); // reload or refetch if needed
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      const errorMessage = err.response.data.message;

      if (errorMessage === "No returnable items found.") {
        toast.warning("No returnable items found or already returned.");
      } else {
        toast.error(errorMessage);
      }
    } else {
      toast.error("Something went wrong.");
    }
  }
};

  return (
    <div className="p-4 bg-white" style={{ minHeight: "100vh" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Purchase Return List ({returns.length})</h5>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={fetchReturns}>
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => setShowPanel(true)}
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
              <th>Remarks</th>
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
                <td colSpan="8" className="text-center py-4 text-muted">
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
                  <td>{item.purchase_invoice}</td>
                  <td>{item.invoice_date}</td>
                  <td>{item.quantity}</td>
                  <td>{item.remarks}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Return Side Panel */}
      <div
        className="position-fixed end-0 bg-white shadow-lg"
        style={{
          top: "61px",
          height: "calc(100% - 61px)",
          width: showPanel ? "480px" : "0px",
          zIndex: 1050,
          overflow: "auto",
          transition: "width 0.3s ease"
        }}
      >
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Add Purchase Return</h5>
            <Button variant="light" size="sm" onClick={() => setShowPanel(false)}>
              <i className="bi bi-x-lg fs-6"></i>
            </Button>
          </div>


<Form onSubmit={handleSubmit}>
  <Row className="mb-3">
    <Col md={6}>
      <Form.Group>
         <Form.Label>Purchase ID</Form.Label>
        <Form.Control
          size="sm"
          name="pcb_board_purchase_id"
          value={formData.pcb_board_purchase_id}
          onChange={handleChange}
        ></Form.Control>
      
      </Form.Group>
    </Col>

        <Col md={6}>
      <Form.Group>
        <Form.Label>Invoice No</Form.Label>
        <Form.Control size="sm" name="invoice_no" value={formData.invoice_no} onChange={handleChange} />
      </Form.Group>
    </Col>

  </Row>

  <Row className="mb-3">
        <Col md={6}>
        <Form.Group>
        <Form.Label>Invoice Date</Form.Label>
        <Form.Control
          size="sm"
          type="date"
          name="invoice_date"
          value={formData.invoice_date}
          onChange={handleChange}
        />
      </Form.Group>
    </Col>


  </Row>

            <div className="mt-3 text-end">
              <Button type="submit" variant="success">Save Return</Button>
            </div>
          </Form>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
