import React, { useEffect, useState } from 'react';
import { Button, Form, Row, Col, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Select, { components } from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditSalePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [customers, setCustomers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [originalSerials, setOriginalSerials] = useState([]);
  const [availableSerials, setAvailableSerials] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    batch_id: '',
    category_id: '',
    quantity: '',
    shipment_name: '',
    shipment_date: '',
    delivery_date: '',
    tracking_no: '',
    from_serial: '',
    serial_numbers: [],
    notes: '',
  });

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

  const fetchSerialNumbers = async () => {
    const { batch_id, category_id, quantity, from_serial } = formData;
    if (!batch_id || !category_id || !quantity) return;

    try {
      const response = await axios.post('http://localhost:8000/api/available-serials', {
        batch_id,
        category_id,
        from_serial,
        quantity: parseInt(quantity, 10),
  include_serials: originalSerials.map(p => p.serial_no),

      });
const uniqueAvailable = response.data.available_serials.filter(
  sn => !originalSerials.some(p => p.serial_no === sn.serial_no)
);

      setAvailableSerials(uniqueAvailable);
    } catch (error) {
      console.error('Serial fetch failed:', error);
    }
  };

  useEffect(() => {
    axios.get('http://localhost:8000/api/form-dropdowns')
      .then(res => {
        const { customers, batches, categories } = res.data.data;
        setCustomers(customers);
        setBatches(batches);
        setCategories(categories);
      })
      .catch(err => console.error('Dropdown fetch error:', err));

    axios.get(`http://localhost:8000/api/sales/${id}/edit`)
      .then(res => {
        const sale = res.data.sale;
        const currentSerials = res.data.current_product_ids || [];

        setFormData({
          customer_id: sale.customer_id,
          batch_id: sale.batch_id,
          category_id: sale.category_id,
          quantity: sale.quantity,
          shipment_name: sale.shipment_name,
          shipment_date: sale.shipment_date,
          delivery_date: sale.delivery_date,
          tracking_no: sale.tracking_no || '',
          from_serial: sale.from_serial || '',
          serial_numbers: currentSerials,
          notes: sale.notes || '',
        });

        setOriginalSerials(currentSerials);
        setAvailableSerials(res.data.available_products || []);
      })
      .catch(err => console.error('Error loading sale data:', err));
  }, [id]);

  useEffect(() => {
    if (formData.batch_id && formData.category_id && formData.from_serial && formData.quantity) {
      fetchSerialNumbers();
    }
  }, [formData.batch_id, formData.category_id, formData.from_serial, formData.quantity]);
const handleSubmit = (e) => {
  e.preventDefault();

  const requiredQty = parseInt(formData.quantity || 0, 10);
  const currentSerials = formData.serial_numbers || [];
  const available = availableSerials || [];

  // Remove duplicates based on serial_no
  const merged = [...currentSerials, ...available];
  const uniqueSerialsMap = {};
  const uniqueSerials = [];

  for (const item of merged) {
    if (!uniqueSerialsMap[item.serial_no]) {
      uniqueSerialsMap[item.serial_no] = true;
      uniqueSerials.push(item);
    }
  }

  const finalSerials = uniqueSerials.slice(0, requiredQty);

  if (finalSerials.length < requiredQty) {
    alert(`Only ${finalSerials.length} serials assigned. Please assign ${requiredQty}.`);
    return;
  }

  const updatedFormData = {
    ...formData,
    selected_serials: finalSerials.map(p => p.serial_no),
  };

  axios.put(`http://localhost:8000/api/salesUpdate/${id}`, updatedFormData)
    .then(() => {
      toast.success('Sale updated successfully!');
      setTimeout(() => navigate('/salesOrder'), 1500);
    })
    .catch(err => {
      console.error('Error updating sale:', err);
      toast.error('Failed to update sale.');
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
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

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
                components={{ SingleValue: CustomSingleValue, Option: CustomOption }}
                className="form-control form-control-sm p-0"
                classNamePrefix="react-select-sm"
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
            <Form.Label>From Serial</Form.Label>
            <Form.Control
              size="sm"
              name="from_serial"
              value={formData.from_serial}
              onChange={handleChange}
              placeholder="e.g. SN-1003"
            />
          </Col>

          <Col md={4}>
            <Form.Label>Shipment Name</Form.Label>
            <Form.Control size="sm" name="shipment_name" value={formData.shipment_name} onChange={handleChange} />
          </Col>
        </Row>

      <Form.Label className="mb-2 text-dark fw-normal">
  Product Serial No. (Already Sold for this Sale)
</Form.Label>
<Row className="mb-3">
  {formData.serial_numbers.length > 0 ? (
    formData.serial_numbers.map((item, idx) => (
      <Col key={idx} md={3} className="mb-2">
        <Form.Control
          type="text"
          size="sm"
          value={item.serial_no}
          disabled
          className="shadow-none bg-light border-0 text-muted"
        />
      </Col>
    ))
  ) : (
    <Col>
      <div className="text-muted text-center">No serials assigned</div>
    </Col>
  )}
</Row>

{/* 
       {availableSerials.length > 0 && (
  <>
    <Form.Label className="mb-2 text-dark fw-normal">Available Product Serials</Form.Label>
    <Row className="mb-3">
      {availableSerials.map((sn, idx) => (
        <Col key={idx} md={3} className="mb-2">
          <Form.Control
            type="text"
            size="sm"
            value={sn.serial_no}
            disabled
            className="shadow-none bg-light border-0 text-muted"
          />
        </Col>
      ))}
    </Row>
  </>
)} */}


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

        <Form.Group className="mb-3">
          <Form.Label>Notes</Form.Label>
          <Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleChange} />
        </Form.Group>

        <div className="text-end mt-3">
          <Button type="submit" variant="success">Update</Button>
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
