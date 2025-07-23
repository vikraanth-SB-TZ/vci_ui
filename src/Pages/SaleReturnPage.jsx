import React, { useEffect, useState } from 'react';
import { Button, Table, Form } from 'react-bootstrap';
import axios from 'axios';

export default function ReturnListPage() {
  const [returnData, setReturnData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showReturnPanel, setShowReturnPanel] = useState(false);
  const [formData, setFormData] = useState({
    return_invoice_date: '',
    quantity: '',
    reason: '',
    remark: '',
    sale_id: '',
  });
  const [error, setError] = useState('');
  const pageSize = 10;

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = () => {
    axios.get('http://localhost:8000/api/sale-returns')
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:8000/api/sale-return', formData);
      alert(res.data.message);
      fetchReturns();
      setShowReturnPanel(false);
      setFormData({
        return_invoice_date: '',
        quantity: '',
        reason: '',
        remark: '',
        sale_item_id: '', // ✅ correct key
      });
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Validation error');
      } else {
        setError('Something went wrong');
      }
    }
  };

  const totalItems = returnData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = returnData.slice(startIndex, startIndex + pageSize);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="w-100 py-4 bg-white position-relative" style={{ minHeight: '100vh', fontFamily: 'Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif', fontSize: '14px', fontWeight: '500' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 px-4">
        <h4 className="fw-semibold text-dark mb-0 fs-4">
          Return List <span className="text-dark fw-semibold">({returnData.length})</span>
        </h4>
        <Button variant="success" size="sm" onClick={() => setShowReturnPanel(true)}>
          + New Return
        </Button>
      </div>

      {/* Table */}
      <div className="shadow-sm overflow-hidden" style={{ borderRadius: '0.5rem' }}>
        <Table hover responsive size="sm" className="table-border mb-0">
          <thead>
            <tr className="border-bottom border-secondary-subtle">
              <th className="text-dark py-3 fw-medium ps-4" style={{ backgroundColor: '#f3f7faff' }}>Sno</th>
              <th className="text-dark py-3 fw-medium" style={{ backgroundColor: '#f6f7f8ff' }}>Invoice No</th>
              <th className="text-dark py-3 fw-medium" style={{ backgroundColor: '#f6f7f8ff' }}>Invoice Date</th>
              <th className="text-dark py-3 fw-medium" style={{ backgroundColor: '#f6f7f8ff' }}>Return Invoice No</th>
              <th className="text-dark py-3 fw-medium" style={{ backgroundColor: '#f6f7f8ff' }}>Return Date</th>
              <th className="text-dark py-3 fw-medium" style={{ backgroundColor: '#f6f7f8ff' }}>Qty</th>
              <th className="text-dark py-3 fw-medium" style={{ backgroundColor: '#f6f7f8ff' }}>Reason</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-secondary">No return data available</td>
              </tr>
            ) : (
              currentData.map((item, index) => (
                <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                  <td className="py-2 ps-4 text-dark">{String(startIndex + index + 1).padStart(2, '0')}</td>
                  <td className="py-2 text-dark">{item.invoice_no}</td>
                  <td className="py-2 text-dark">{item.invoice_date}</td>
                  <td className="py-2 text-dark">{item.return_invoice_no}</td>
                  <td className="py-2 text-dark">{item.return_invoice_date}</td>
                  <td className="py-2 text-dark">{item.quantity}</td>
                  <td className="py-2 text-dark">{item.reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="d-flex justify-content-between align-items-center mt-3 px-4 pb-4">
        <select className="form-select form-select-sm" style={{ width: '120px', backgroundColor: '#f3f7faff' }} disabled>
          <option>{pageSize} per page</option>
        </select>
        <div>
          <Button variant="light" size="sm" className="me-1" onClick={handlePrev} disabled={currentPage === 1}>&lt;</Button>
          <span className="mx-1 text-secondary fw-medium fs-6">
            {totalItems === 0
              ? '0 - 0'
              : `${startIndex + 1} - ${Math.min(startIndex + pageSize, totalItems)}`}
          </span>
          <Button variant="light" size="sm" className="ms-1" onClick={handleNext} disabled={currentPage === totalPages}>&gt;</Button>
        </div>
      </div>

      {/* Right Panel - Return Form */}
      <div className={`position-fixed end-0 bg-white shadow-lg transition-all`}
        style={{
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
            <Button variant="light" size="sm" onClick={() => setShowReturnPanel(false)}>
              <i className="bi bi-x-lg fs-6"></i>
            </Button>
          </div>

          <Form onSubmit={handleSubmit}>
            <div className="row gx-3">
              <div className="col-md-6 mb-3">
           <Form.Group>
  <Form.Label className="text-muted small mb-1">Sale Item ID</Form.Label>
  <Form.Control
    type="text"
    name="sale_item_id" // ✅ match backend field
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

            {error && <p className="text-danger small mt-1">{error}</p>}

            <div className="mt-3">
              <Button variant="success" type="submit" className="pe-4">Save</Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
