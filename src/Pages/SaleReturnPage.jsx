import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Button, Table, Form } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import "bootstrap-icons/font/bootstrap-icons.css";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";

export default function ReturnListPage() {
  const [returnData, setReturnData] = useState([]);
  const [showReturnPanel, setShowReturnPanel] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const tableRef = useRef(null);

  const [formData, setFormData] = useState({
    return_invoice_date: '',
    quantity: '',
    reason: '',
    remark: '',
    sale_item_id: '',
  });

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
    // Destroy existing DataTable before fetching new data
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }

    axios.get('http://localhost:8000/api/saleReturns')
      .then(res => {
        if (res.data.data) {
          setReturnData(res.data.data);
        }
      })
      .catch(err => {
        console.error('Error fetching return list:', err);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { return_invoice_date, quantity, reason, sale_item_id } = formData;

 if (!sale_item_id || !return_invoice_date || !quantity || !reason) {
  toast.error('Please fill all required fields.');
  return;
}

if (parseInt(quantity) !== 1) {
  toast.error('Only quantity of 1 is allowed.');
  return;
}



    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      const res = await axios.post('http://localhost:8000/api/sale-returns', formData);
      toast.success(res.data.message || 'Return submitted successfully!');
      setSuccess(res.data.message || 'Return submitted successfully!');
      fetchReturns();
      setShowReturnPanel(false);
      setFormData({
        return_invoice_date: '',
        quantity: '',
        reason: '',
        remark: '',
        sale_item_id: '',
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      toast.error(msg);
      // toast.error("Please fill all required fields.");

      // setError(msg);
    }
  };

  return (
    <div className="w-100 py-4 bg-white position-relative" style={{ minHeight: '100vh', fontSize: '14px' }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 px-4">
        <h4 className="fw-semibold text-dark mb-0 fs-4">
          Return List <span className="text-dark fw-semibold">({returnData.length})</span>
        </h4>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary p-0" style={{ width: '38px', height: '38px' }} onClick={fetchReturns}>
            <i className="bi bi-arrow-clockwise fs-5 text-dark"></i>
          </Button>
          <Button variant="success" size="sm" onClick={() => setShowReturnPanel(true)}>
            + New Return
          </Button>
        </div>
      </div>

      {/* Table with DataTable */}
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
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Return Form Panel (Unchanged) */}
      <div className={`position-fixed end-0 bg-white shadow-lg`} style={{
        top: '61px',
        height: 'calc(100% - 61px)',
        width: showReturnPanel ? '480px' : '0px',
        zIndex: 1050,
        overflow: 'auto',
        transition: 'width 0.3s ease'
      }}>
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Add Sale Return</h5>
            <Button variant="light" size="sm" onClick={() => {
              setShowReturnPanel(false);
              setFormData({ return_invoice_date: '', quantity: '', reason: '', remark: '', sale_item_id: '' });
              setError('');
            }}>
              <i className="bi bi-x-lg fs-6"></i>
            </Button>
          </div>

          {error && <div className="alert alert-danger py-2 px-3 small">{error}</div>}
          {success && <div className="alert alert-success py-2 px-3 small">{success}</div>}

          <Form onSubmit={handleSubmit}>
            <div className="row gx-3">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="text-muted small mb-1">Sale Item ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="sale_item_id"
                    placeholder="Enter sale item id"
                    className="shadow-sm border-light bg-light"
                    value={formData.sale_item_id}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="text-muted small mb-1">Return Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="return_invoice_date"
                    className="shadow-sm border-light bg-light"
                    value={formData.return_invoice_date}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="text-muted small mb-1">Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    placeholder="Enter quantity"
                    className="shadow-sm border-light bg-light"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="text-muted small mb-1">Remark</Form.Label>
                  <Form.Control
                    type="text"
                    name="remark"
                    placeholder="Optional remark"
                    className="shadow-sm border-light bg-light"
                    value={formData.remark}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>

              <div className="col-12 mb-3">
                <Form.Group>
                  <Form.Label className="text-muted small mb-1">Reason</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="reason"
                    placeholder="Enter reason"
                    className="shadow-sm border-light bg-light"
                    value={formData.reason}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="mt-4 d-flex justify-content-end">
              <Button variant="success" type="submit" className="px-4">Save</Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
