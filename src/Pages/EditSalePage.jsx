import React, { useEffect, useState } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Select, { components } from 'react-select';

export default function EditSalePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [customers, setCustomers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    customer_id: '',
    batch_id: '',
    category_id: '',
    quantity: '',
    shipment_name: '',
    shipment_date: '',
    delivery_date: '',
    tracking_no: ''
  });

  // Load dropdowns and sale data
  useEffect(() => {
    axios.get('http://localhost:8000/api/form-dropdowns')
      .then(res => {
        const { customers, batches, categories } = res.data.data;
        setCustomers(customers);
        setBatches(batches);
        setCategories(categories);
      })
      .catch(err => console.error('Error loading dropdowns:', err));

    axios.get(`http://localhost:8000/api/sales/${id}/edit`)
      .then(res => {
        const sale = res.data.sale;
        setFormData({
          customer_id: sale.customer_id,
          batch_id: sale.batch_id,
          category_id: sale.category_id,
          quantity: sale.quantity,
          shipment_name: sale.shipment_name,
          shipment_date: sale.shipment_date,
          delivery_date: sale.delivery_date,
          tracking_no: sale.tracking_no || ''
        });
      })
      .catch(err => console.error('Error loading sale data:', err));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerChange = (selected) => {
    setFormData(prev => ({
      ...prev,
      customer_id: selected?.value || ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.put(`http://localhost:8000/api/sales/${id}`, formData)
      .then(() => {
        alert('Sale updated successfully!');
        navigate('/salesOrder');
      })
      .catch(err => {
        console.error('Error updating sale:', err);
        alert('Failed to update sale.');
      });
  };

  const customerOptions = customers.map(c => ({
    value: c.id,
    label: c.name,
    subLabel: c.company || 'Valkontech'
  }));

  return (
    <div className="w-100 py-4 px-4 bg-white" style={{ minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-semibold mb-0">Edit Sale</h4>
        <Button variant="outline-secondary" onClick={() => navigate('/salesOrder')}>
          <i className="bi bi-arrow-left" /> Back
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="customer_id" className="mb-3">
              <Form.Label>Customer</Form.Label>
              <Select
                options={customerOptions}
                value={customerOptions.find(opt => opt.value === formData.customer_id) || null}
                onChange={handleCustomerChange}
                isClearable
                placeholder="Select Customer"
                components={{
                  SingleValue: CustomSingleValue,
                  Option: CustomOption
                }}
                styles={{ control: base => ({ ...base, minHeight: '32px' }) }}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Label>Batch</Form.Label>
            <Form.Select size="sm" name="batch_id" value={formData.batch_id} onChange={handleChange}>
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.batch}</option>
              ))}
            </Form.Select>
          </Col>

          <Col md={4}>
            <Form.Label>Category</Form.Label>
            <Form.Select size="sm" name="category_id" value={formData.category_id} onChange={handleChange}>
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.category}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-3 g-2">
          <Col md={4}>
            <Form.Label>Quantity</Form.Label>
            <Form.Control size="sm" name="quantity" value={formData.quantity} onChange={handleChange} />
          </Col>
          <Col md={4}>
            <Form.Label>Shipment Name</Form.Label>
            <Form.Control size="sm" name="shipment_name" value={formData.shipment_name} onChange={handleChange} />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Label>Shipment Date</Form.Label>
            <Form.Control size="sm" type="date" name="shipment_date" value={formData.shipment_date} onChange={handleChange} />
          </Col>
          <Col md={4}>
            <Form.Label>Delivery Date</Form.Label>
            <Form.Control size="sm" type="date" name="delivery_date" value={formData.delivery_date} onChange={handleChange} />
          </Col>
          <Col md={4}>
            <Form.Label>Tracking No.</Form.Label>
            <Form.Control size="sm" name="tracking_no" value={formData.tracking_no} onChange={handleChange} />
          </Col>
        </Row>

        <div className="text-end mt-3">
          <Button type="submit" variant="warning">Update</Button>
        </div>
      </Form>
    </div>
  );
}

const CustomSingleValue = (props) => (
  <components.SingleValue {...props}>{props.data.label}</components.SingleValue>
);

const CustomOption = (props) => {
  const { data, innerRef, innerProps } = props;
  return (
    <div ref={innerRef} {...innerProps} className="d-flex align-items-center px-2 py-2" style={{ cursor: 'pointer' }}>
      <div className="rounded-circle bg-light border text-secondary d-flex align-items-center justify-content-center me-3" style={{ width: 30, height: 30 }}>
        {data.label.charAt(0)}
      </div>
      <div>
        <div className="fw-semibold">{data.label}</div>
        <div className="text-muted small">{data.subLabel}</div>
      </div>
    </div>
  );
};
