import React, { useEffect, useState , useRef } from 'react';
import { Button, Form, Row, Col, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select, { components } from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddNewSalePage() {

  const hasFetched = useRef(false);
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);
   const [serialError, setSerialError] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    customer_id: '',
    batch_id: '',
    category_id: '',
    quantity: '',
    from_serial: '',
    shipment_name: '',
    serial_numbers: [],
    shipment_date: '',
    delivery_date: '',
    tracking_no: '',
    notes: ''
  });

  const validateForm = () => {
  const newErrors = {};
  const messagesShown = new Set();

  if (!formData.customer_id) newErrors.customer_id = "Customer field is required";
  if (!formData.batch_id) newErrors.batch_id = "Batch field is required";
  if (!formData.category_id) newErrors.category_id = "Category field is required";
  if (!formData.quantity) newErrors.quantity = "Quantity field is required";
  if (!formData.shipment_name) newErrors.shipment_name = "Shipment Name is required";
  if (formData.serial_numbers.length === 0) newErrors.serial_numbers = "Serial numbers are required";
  if (!formData.shipment_date) newErrors.shipment_date = "Shipment Date is required";
  if (!formData.delivery_date) newErrors.delivery_date = "Delivery Date is required";
  if (!formData.tracking_no) newErrors.tracking_no = "Tracking No is required";

  Object.values(newErrors).forEach(msg => {
    if (!messagesShown.has(msg)) {
      toast.error(msg);
      messagesShown.add(msg);
    }
  });

  return Object.keys(newErrors).length === 0;
};


useEffect(() => {
  if (hasFetched.current) return;
  hasFetched.current = true;

  axios.get('http://localhost:8000/api/form-dropdowns')
    .then(res => {
      if (res.data?.data) {
        setCustomers(res.data.data.customers);
        setBatches(res.data.data.batches);
        setCategories(res.data.data.categories);
      }
    })
    .catch(err => console.error('Error loading dropdowns:', err));
}, []);

const handleChange = async (e) => {
  const { name, value } = e.target;
  const updated = { ...formData, [name]: value };
  setFormData(updated);

  if (['quantity', 'from_serial', 'batch_id', 'category_id'].includes(name)) {
    const { quantity, from_serial, batch_id, category_id } = updated;

    if (quantity && batch_id && category_id) {
      try {
        const payload = {
          quantity,
          batch_id,
          category_id
        };

        if (from_serial?.trim() !== '') {
          payload.from_serial = from_serial;
        }

        const response = await axios.post('http://localhost:8000/api/products/serials', payload);
        const serials = response.data?.data || [];

        setFormData(prev => ({
          ...prev,
          serial_numbers: serials
        }));

        if (serials.length === 0) {
          setSerialError("No serial numbers found.");
        } else {
          setSerialError("");
        }

      } catch (err) {
        console.error('Error fetching serials:', err);
        setSerialError("No serial numbers found.");
        setFormData(prev => ({ ...prev, serial_numbers: [] }));
      }
    }
  }
};

  const handleCustomerChange = (selected) => {
    setFormData(prev => ({
      ...prev,
      customer_id: selected?.value || ''
    }));
  };

  const handleSerialChange = (index, value) => {
    const updatedSerials = [...formData.serial_numbers];
    updatedSerials[index] = value;
    setFormData(prev => ({ ...prev, serial_numbers: updatedSerials }));
  };

 const handleSubmit = (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  axios.post('http://localhost:8000/api/saleStore', formData)
    .then(() => {
      toast.success('Sale added successfully!');
      navigate('/salesOrder');
    })
    .catch(err => {
      console.error('Error posting sale:', err);

      if (err.response && err.response.status === 422) {
        const res = err.response.data;

        // Laravel-style validation errors
        if (res.errors) {
          const messagesShown = new Set();
          const newErrors = {};

          Object.entries(res.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              newErrors[field] = messages[0]; // set first message for the field
              messages.forEach(msg => {
                if (!messagesShown.has(msg)) {
                  toast.error(msg);
                  messagesShown.add(msg);
                }
              });
            }
          });

          setErrors(newErrors);
        }

        // Custom structured error like:
        // { message: "...", available: 2, required: 5 }
        else if (res.message && res.available && res.required) {
          const customMsg = `Only ${res.available} items available, but ${res.required} requested.`;
          toast.error(customMsg);

          setErrors(prev => ({
            ...prev,
            quantity: customMsg
          }));
        }
      } else {
        toast.error('Failed to save sale.');
      }
    });
};


  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.name,
    subLabel: c.company || 'Valkontech'
  }));

  return (
    <div className="w-100 py-4 px-4 bg-white" style={{ minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-semibold mb-0">Add New Sale</h4>
        <Button variant="outline-secondary" onClick={() => navigate('/salesOrder')}>
          <i className="bi bi-arrow-left" /> Back
        </Button>
      </div>

<ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={4} >
            <Form.Group controlId="customer_id" className="mb-3">
              <Form.Label>Customer</Form.Label>
             <Select
  options={customerOptions}
  value={customerOptions.find(opt => opt.value === formData.customer_id) || null}
  onChange={handleCustomerChange}
  isClearable
  placeholder="SelectCustomer"
  components={{
    SingleValue: CustomSingleValue,
    Option: CustomOption
  }}
  styles={{
    control: (base, state) => ({
      ...base,
      minHeight: '32px',
      height: '32px',
      fontSize: '0.875rem',
      // borderColor: state.isFocused ? '#86b7fe' : base.borderColor,
      // boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13,110,253,.25)' : 'none',
    boxShadow: 'none', borderColor: '#ced4da'
    }),
    valueContainer: (base) => ({
      ...base,
      paddingTop: '0px',
      paddingBottom: '0px',
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: '32px',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: '2px 6px',
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: '2px 6px',
    }),
    input: (base) => ({
      ...base,
      margin: '0px',
      padding: '0px',
    }),
    singleValue: (base) => ({
      ...base,
      display: 'flex',
      alignItems: 'center',
    })
  }}
/>
  {/* {errors.customer_id && <div className="text-danger small mt-1">{errors.customer_id}</div>} */}


            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Label>Batch</Form.Label>
            <Form.Select size="sm" name="batch_id" value={formData.batch_id} onChange={handleChange} style={{ boxShadow: 'none', borderColor: '#ced4da' }}>
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.batch}</option>
                
              ))}


            </Form.Select>
                {/* {errors.batch_id && <div className="text-danger small mt-1">{errors.batch_id}</div>} */}
          </Col>

          <Col md={4}>
            <Form.Label>Category</Form.Label>
            <Form.Select size="sm" name="category_id" value={formData.category_id} onChange={handleChange} style={{ boxShadow: 'none', borderColor: '#ced4da' }}>
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.category}</option>
              ))}
            </Form.Select>
            {/* {errors.category_id && <div className="text-danger small mt-1">{errors.category_id}</div>} */}

          </Col>
        </Row>

          <Row className="mb-3 g-2">
          <Col md={4} sm={6} xs={12}>
            <Form.Label>Quantity</Form.Label>
            <Form.Control size="sm" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Enter Quantity" style={{ boxShadow: 'none', borderColor: '#ced4da' }}/>
            {errors.quantity && <div className="text-danger small mt-1">{errors.quantity}</div>}

          </Col>
          <Col md={4} sm={6} xs={12}>
            <Form.Label>From Serial Number</Form.Label>
            <Form.Control size="sm" name="from_serial" value={formData.from_serial} onChange={handleChange} placeholder="Enter From Serial" style={{ boxShadow: 'none', borderColor: '#ced4da' }} />
          {serialError && <div className="text-danger small mt-1">{serialError}</div>}
          </Col>
          <Col md={4} sm={6} xs={12}>
            <Form.Label>Shipment Name</Form.Label>
            <Form.Control size="sm" name="shipment_name" value={formData.shipment_name} onChange={handleChange} placeholder="Enter Shipment Name" style={{ boxShadow: 'none', borderColor: '#ced4da' }}/>
    {/* {errors.shipment_name && <div className="text-danger small mt-1">{errors.shipment_name}</div>} */}

          </Col>
        </Row>

        <Form.Label className="mb-2 text-dark fw-normal">Product Serial No.</Form.Label>
        <Table className="mb-3 border rounded-3 overflow-hidden">
          <thead>
            <tr>
              <th style={{ backgroundColor: '#E9ECEF' }} className="py-2 px-3 text-dark fw-normal">Count</th>
              <th style={{ backgroundColor: '#E9ECEF' }} className="py-2 px-3 text-dark fw-normal">Serial Number</th>
            </tr>
          </thead>
          <tbody>
            {formData.serial_numbers.map((value, idx) => (
              <tr key={idx}>
                <td className="py-2 px-3 border-light align-middle">{idx + 1}</td>
                <td className="py-0 px-3 border-light">
                  <Form.Control
                    type="text"
                    size="sm"
                    value={value}
                    onChange={(e) => handleSerialChange(idx, e.target.value)}
                    className="shadow-none bg-transparent border-0 py-2 px-0"
                    style={{ boxShadow: 'none', borderColor: '#ced4da' }}
                  />


                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Label>Shipment Date</Form.Label>
            <Form.Control size="sm" type="date" name="shipment_date" value={formData.shipment_date} onChange={handleChange} style={{ boxShadow: 'none', borderColor: '#ced4da' }}/>
         {/* {errors.shipment_date && <div className="text-danger small mt-1">{errors.shipment_date}</div>} */}

          </Col>
          <Col md={4}>
            <Form.Label>Delivery Date</Form.Label>
            <Form.Control size="sm" type="date" name="delivery_date" value={formData.delivery_date} onChange={handleChange} style={{ boxShadow: 'none', borderColor: '#ced4da' }}/>
         {/* {errors.delivery_date && <div className="text-danger small mt-1">{errors.delivery_date}</div>} */}

          </Col>
          <Col md={4}>
            <Form.Label>Tracking No.</Form.Label>
            <Form.Control size="sm" name="tracking_no" value={formData.tracking_no} onChange={handleChange} style={{ boxShadow: 'none', borderColor: '#ced4da' }}/>
          {/* {errors.tracking_no && <div className="text-danger small mt-1">{errors.tracking_no}</div>} */}

          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Notes</Form.Label>
          <Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleChange} style={{ boxShadow: 'none', borderColor: '#ced4da' }}/>
        </Form.Group>

        <div className="text-end mt-3">
          <Button type="submit" variant="success">Save</Button>
        </div>
      </Form>
    </div>
  );
}

const CustomSingleValue = (props) => {
  return (
    <components.SingleValue {...props}>
      {props.data.label}
    </components.SingleValue>
  );
};

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
