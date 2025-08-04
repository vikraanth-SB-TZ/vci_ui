import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddPurchasePage() {
  const [dropdowns, setDropdowns] = useState({
    vendors: [],
    batches: [],
    categories: [],
  });

  const [formData, setFormData] = useState({
    vendor_id: null,
    batch_id: null,
    category_id: null,
    invoice_no: '',
    invoice_date: '',
    serial_numbers: '',
  });

  const [parsedSerials, setParsedSerials] = useState([]);
  const navigate = useNavigate();

  const fetchDropdownData = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/form-dropdowns');
      const data = res.data.data;
      setDropdowns({
        vendors: data.vendors || [],
        batches: data.batches || [],
        categories: data.categories || [],
      });
    } catch (err) {
      console.error('Failed to load dropdowns:', err);
      toast.error('Failed to load dropdowns');
    }
  };

  const customSelectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: '#fff',
    borderColor: '#ced4da',
    minHeight: '38px',
    boxShadow: 'none',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#fff',
    zIndex: 9999, // ensures it displays above modals/forms
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#f8f9fa' : '#fff',
    color: '#000',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#000',
  }),
};


  useEffect(() => {
    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (selected, field) => {
    setFormData({ ...formData, [field]: selected ? selected.value : null });
  };

  const handleSerialChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, serial_numbers: value });

    const serials = value.split('\n').map(s => s.trim()).filter(s => s);
    setParsedSerials(serials);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    
  // ✅ Frontend validation
  if (!formData.vendor_id) {
    return toast.error('Vendor is required');
  }
  if (!formData.batch_id) {
    return toast.error('Batch is required');
  }
  if (!formData.category_id) {
    return toast.error('Category is required');
  }
  if (!formData.invoice_no.trim()) {
    return toast.error('Invoice number is required');
  }
  if (!formData.invoice_date) {
    return toast.error('Invoice date is required');
  }
  if (parsedSerials.length === 0) {
    return toast.error('At least one serial number is required');
  }
//
  const hasDuplicates = parsedSerials.some((item, idx) => parsedSerials.indexOf(item) !== idx);
  if (hasDuplicates) {
    return toast.error('Duplicate serial numbers found. Please remove duplicates.');
  }


const serialCount = {};
const duplicateSerials = [];

parsedSerials.forEach(serial => {
  serialCount[serial] = (serialCount[serial] || 0) + 1;
});

for (const [serial, count] of Object.entries(serialCount)) {
  if (count > 1) {
    duplicateSerials.push(serial);
  }
}

if (duplicateSerials.length > 0) {
  toast.error(`Duplicate serials found: ${duplicateSerials.join(', ')}`);
  return;
}

//
  const payload = {
  vendor_id: formData.vendor_id,
  batch_id: formData.batch_id,
  category_id: formData.category_id,
  invoice_no: formData.invoice_no,
  invoice_date: formData.invoice_date,
  serials: parsedSerials, 
};


    try {
      await axios.post('http://localhost:8000/api/pcbstore', payload);
      toast.success('Purchase added successfully!');
      // navigate('/purchaseOrder');
      setTimeout(() => navigate('/purchaseOrder'), 1000);
    } catch (error) {
  console.error(error);

  const msg =
    error.response?.data?.errors?.invoice_no?.[0] ??
    error.response?.data?.message ??
    'Failed to add purchase';

  toast.error(msg);
    }
  };


  return (
   <div style={{ minHeight: '100vh', backgroundColor: '#fff' }} className="p-4">

      <h4 className="mb-3">Add New Purchase</h4>

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3 pt-4">
          <Col md={4}>
            <Form.Label>Vendor</Form.Label>
            <Select
              styles={customSelectStyles}
              options={dropdowns.vendors.map(v => ({ label: v.name, value: v.id }))}
              onChange={(selected) => handleSelectChange(selected, 'vendor_id')}
              placeholder="Select vendor"
            />
          </Col>
          <Col md={4}>
            <Form.Label>Batch</Form.Label>
            <Select
              styles={customSelectStyles}
              options={dropdowns.batches.map(b => ({ label: b.name || b.batch, value: b.id }))}
              onChange={(selected) => handleSelectChange(selected, 'batch_id')}
              placeholder="Select batch"
            />
          </Col>
          <Col md={4}>
            <Form.Label>Category</Form.Label>
            <Select
              styles={customSelectStyles}
              options={dropdowns.categories.map(c => ({ label: c.name || c.category, value: c.id }))}
              onChange={(selected) => handleSelectChange(selected, 'category_id')}
              placeholder="Select category"
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Invoice Number</Form.Label>
            <Form.Control
              type="text"
              name="invoice_no"
              value={formData.invoice_no}
              onChange={handleChange}
              placeholder="Enter invoice number"
              required
            />
          </Col>
          <Col md={6}>
            <Form.Label>Invoice Date</Form.Label>
            <Form.Control
              type="date"
              name="invoice_date"
              value={formData.invoice_date}
              onChange={handleChange}
              required
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Label>Serial Numbers</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
             value={formData.serial_numbers}

              onChange={handleSerialChange}
              placeholder="Enter one serial number per line"
              required
            />
          </Col>
        </Row>

        {parsedSerials.length > 0 && (
          <Row className="mb-3">
            <Col>
              <Form.Label className="text-muted small mb-1">Entered Serial Numbers</Form.Label>
              <div
                style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  border: '1px solid #ced4da',
                  borderRadius: '0.25rem',
                  padding: '0.5rem',
                  backgroundColor: '#f8f9fa',
                }}
              >
                <ul className="list-unstyled small mb-0">
                  {parsedSerials.map((sn, idx) => (
                    <li key={idx}>{sn}</li>
                  ))}
                </ul>
              </div>
            </Col>
          </Row>
        )}

        <div className="d-flex justify-content-end">
          <Button variant="secondary" className="me-2" onClick={() => navigate('/purchaseOrder')}>
            Cancel
          </Button>
          <Button type="submit" variant="success">
            Save Purchase
          </Button>
        </div>
      </Form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

