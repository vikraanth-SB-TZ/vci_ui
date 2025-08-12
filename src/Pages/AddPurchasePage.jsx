import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

export default function AddPurchasePage() {
  const [formErrors, setFormErrors] = useState({});
  const [dropdowns, setDropdowns] = useState({ vendors: [], batches: [], categories: [] });
  const [formData, setFormData] = useState({
    vendor_id: null,
    batch_id: null,
    category_id: null,
    invoice_no: '',
    invoice_date: '',
    from_serial: '',
    to_serial: '',
  });
  const navigate = useNavigate();

  const fetchDropdownData = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/form-dropdowns');
      setDropdowns(res.data.data);
    } catch {
      toast.error('Failed to load dropdowns');
    }
  };

  const customSelectStyles = {
    control: base => ({ ...base, backgroundColor: '#fff', borderColor: '#ced4da', minHeight: '38px' }),
    menu: base => ({ ...base, backgroundColor: '#fff', zIndex: 9999 }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#f8f9fa' : '#fff', color: '#000' }),
  };

  useEffect(() => { fetchDropdownData(); }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSelectChange = (selected, field) => {
    setFormData(prev => ({ ...prev, [field]: selected ? selected.value : null }));
    setFormErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const errors = {};
    if (!formData.vendor_id) errors.vendor_id = 'Vendor is required';
    // if (!formData.batch_id) errors.batch_id = 'Batch is required';
    if (!formData.category_id) errors.category_id = 'Category is required';
    if (!formData.invoice_no.trim()) errors.invoice_no = 'Invoice number is required';
    if (!formData.invoice_date) errors.invoice_date = 'Invoice date is required';
    if (!formData.from_serial) errors.from_serial = 'From Serial is required';
    if (!formData.to_serial) errors.to_serial = 'To Serial is required';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        vendor_id: formData.vendor_id,
        // batch_id: formData.batch_id,
        category_id: formData.category_id,
        invoice_no: formData.invoice_no,
        invoice_date: formData.invoice_date,
        from_serial: formData.from_serial,
        to_serial: formData.to_serial,
      };

      await axios.post('http://localhost:8000/api/pcbstore', payload);
      toast.success('Purchase added successfully!');
      setTimeout(() => navigate('/purchaseOrder'), 1000);
    } catch (error) {
      if (error.response?.status === 422 && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      }
      toast.error(error.response?.data?.message || 'Failed to add purchase');
    }
  };

  return (
    <div className="p-4" style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Add Purchase</h4>
        <Button variant="outline-secondary" onClick={() => navigate('/purchaseOrder')}>
          <i className="bi bi-arrow-left" /> Back
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        {/* Vendor, Batch, Category */}
        <Row className="mb-3 pt-4">
          <Col md={3}>
            <Form.Label>Vendor</Form.Label>
            <Select styles={customSelectStyles}
              options={dropdowns.vendors.map(v => ({ label: v.name, value: v.id }))}
              onChange={sel => handleSelectChange(sel, 'vendor_id')}
              placeholder="Select vendor" />
            {formErrors.vendor_id && <div className="text-danger small">{formErrors.vendor_id}</div>}
          </Col>
          <Col md={3}>
            {/* <Form.Label>Batch</Form.Label>
            <Select styles={customSelectStyles}
              options={dropdowns.batches.map(b => ({ label: b.name || b.batch, value: b.id }))}
              onChange={sel => handleSelectChange(sel, 'batch_id')}
              placeholder="Select batch" />
            {formErrors.batch_id && <div className="text-danger small">{formErrors.batch_id}</div>} */}
 <Form.Label>Category</Form.Label>
            <Select styles={customSelectStyles}
              options={dropdowns.categories.map(c => ({ label: c.name || c.category, value: c.id }))}
              onChange={sel => handleSelectChange(sel, 'category_id')}
              placeholder="Select category" />
            {formErrors.category_id && <div className="text-danger small">{formErrors.category_id}</div>}

          </Col>
          <Col md={3}>
                      <Form.Label>Invoice Number</Form.Label>
            <Form.Control type="text" name="invoice_no"
              value={formData.invoice_no} onChange={handleChange} />
            {formErrors.invoice_no && <div className="text-danger small">{formErrors.invoice_no}</div>}
          </Col>
               <Col md={3}>
            <Form.Label>Invoice Date</Form.Label>
            <Form.Control type="date" name="invoice_date"
              value={formData.invoice_date} onChange={handleChange} />
            {formErrors.invoice_date && <div className="text-danger small">{formErrors.invoice_date}</div>}
          </Col>
        </Row>

        {/* Invoice Info
        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Invoice Number</Form.Label>
            <Form.Control type="text" name="invoice_no"
              value={formData.invoice_no} onChange={handleChange} />
            {formErrors.invoice_no && <div className="text-danger small">{formErrors.invoice_no}</div>}
          </Col>
          <Col md={6}>
            <Form.Label>Invoice Date</Form.Label>
            <Form.Control type="date" name="invoice_date"
              value={formData.invoice_date} onChange={handleChange} />
            {formErrors.invoice_date && <div className="text-danger small">{formErrors.invoice_date}</div>}
          </Col>
        </Row> */}

        {/* Serial Range */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>From Serial</Form.Label>
            <Form.Control type="text" name="from_serial"
              value={formData.from_serial} onChange={handleChange} />
            {formErrors.from_serial && <div className="text-danger small">{formErrors.from_serial}</div>}
          </Col>
          <Col md={6}>
            <Form.Label>To Serial</Form.Label>
            <Form.Control type="text" name="to_serial"
              value={formData.to_serial} onChange={handleChange} />
            {formErrors.to_serial && <div className="text-danger small">{formErrors.to_serial}</div>}
          </Col>
        </Row>

        {/* Actions */}
        <div className="d-flex justify-content-end">
          <Button variant="secondary" className="me-2" onClick={() => navigate('/purchaseOrder')}>Cancel</Button>
          <Button type="submit" variant="success">Save Purchase</Button>
        </div>
      </Form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
