import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Spinner, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function EditPurchasePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [purchase, setPurchase] = useState(null);
  const [serials, setSerials] = useState([]);
  const [newSerialsInput, setNewSerialsInput] = useState('');
  const [error, setError] = useState('');
  const [dropdowns, setDropdowns] = useState({ vendors: [], batches: [], categories: [] });

  useEffect(() => {
    fetchDropdownData();
    axios.get(`http://localhost:8000/api/purchase/${id}/edit`)
      .then(res => {
        if (res.data.status) {
          setPurchase(res.data.data.purchase);
          setSerials(res.data.data.serials);
        } else {
          setError('Purchase not found');
        }
        setLoading(false);
      }).catch(() => {
        setError('Error fetching data');
        setLoading(false);
      });
  }, [id]);

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
      console.error('Failed to load dropdowns:', err.response?.data || err.message);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...serials];
    updated[index][field] = value;
    setSerials(updated);
  };

  const handlePurchaseChange = (e) => {
    const { name, value } = e.target;
    setPurchase({ ...purchase, [name]: value });
  };

  
    const handleDeleteSerial = (indexToRemove) => {
  const updated = serials.filter((_, index) => index !== indexToRemove);
  setSerials(updated);
    toast.info('Serial removed');
};

  const handleAddNewSerials = () => {
    const input = newSerialsInput.trim();
    if (!input) return;



    const newEntries = input
      .split(/[\n,]/)
      .map(sn => sn.trim())
      .filter(sn => sn !== '' && !serials.some(s => s.serial_no === sn))
      .map(sn => ({ serial_no: sn, remark: '', quality_check: '' }));

    if (newEntries.length === 0) {
      toast.warning('No valid or unique serials entered.');
      return;
    }

    setSerials([...serials, ...newEntries]);
    setNewSerialsInput('');
    toast.success(`${newEntries.length} serial(s) added.`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      invoice_date: purchase.invoice_date,
      vendor_id: purchase.vendor_id,
      batch_id: purchase.batch_id,
      category_id: purchase.category_id,
      remark_quality: serials.map(item => ({
        serial_no: item.serial_no,
        remark: item.remark,
        quality_check: item.quality_check
      }))
    };

    axios.put(`http://localhost:8000/api/purchase/${id}`, payload)
      .then(res => {
        if (res.data.status) {
          toast.success('Updated successfully!');
          setTimeout(() => navigate('/purchaseOrder'), 1000);
        } else {
          toast.error(res.data.message || 'Update failed');
        }
      })
      .catch(err => {
        const errorData = err.response?.data || {};
        const errorMessage = errorData.message || 'Something went wrong';

        if (errorData.available && errorData.required) {
          toast.error(`Only ${errorData.available} items available, but ${errorData.required} requested.`);
        }

        toast.error(errorMessage);
      });
  };

  if (loading) return <div className="p-4"><Spinner animation="border" /></div>;
  if (!purchase) return <div className="p-4 text-danger">{error}</div>;

  return (
    <div className="w-100 py-4 px-4 bg-white" style={{ minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Edit Purchase</h4>
        <Button variant="light" onClick={() => navigate('/purchaseOrder')}>
          <i className="bi bi-x-lg">Back</i>
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-muted mb-1">Vendor</Form.Label>
              <Form.Select
                name="vendor_id"
                size="sm"
                value={purchase.vendor_id || ''}
                onChange={handlePurchaseChange}
              >
                <option value="">-- Select Vendor --</option>
                {dropdowns.vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-muted mb-1">Invoice No</Form.Label>
              <Form.Control size="sm" value={purchase.invoice_no} disabled />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label className="text-muted mb-1">Invoice Date</Form.Label>
            <Form.Control
              size="sm"
              type="date"
              name="invoice_date"
              value={purchase.invoice_date || ''}
              onChange={handlePurchaseChange}
            />
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-muted mb-1">Batch</Form.Label>
              <Form.Select
                name="batch_id"
                size="sm"
                value={purchase.batch_id || ''}
                onChange={handlePurchaseChange}
              >
                <option value="">-- Select Batch --</option>
                {dropdowns.batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name || `Batch ${b.id}`}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-muted mb-1">Category</Form.Label>
              <Form.Select
                name="category_id"
                size="sm"
                value={purchase.category_id || ''}
                onChange={handlePurchaseChange}
              >
                <option value="">-- Select Category --</option>
                {dropdowns.categories.map(c => (
                  <option key={c.id} value={c.id}>{c.category}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-muted mb-1">Total Serials</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                readOnly
                value={serials.length}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3 col-md-6">
          <Form.Label className="text-muted mb-1">Add New Serial Numbers</Form.Label>
          <Form.Control
            as="textarea"
            size="sm"
            rows={2}
            placeholder="Enter new serials separated by new lines or commas"
            value={newSerialsInput}
            onChange={(e) => setNewSerialsInput(e.target.value)}
          />
          <Button
            size="sm"
            className="mt-2"
            variant="primary"
            onClick={handleAddNewSerials}
          >
            Add Serials
          </Button>
        </Form.Group>

        <Form.Group className="mb-3 col-md-6">
          <Form.Label className="text-muted mb-1">All Serial Numbers</Form.Label>
          <Form.Control
            as="textarea"
            size="sm"
            rows={2}
            value={serials.map(s => s.serial_no).join('\n')}
            readOnly
          />
        </Form.Group>

        <div className="mb-3">
          <Form.Label className="fw-bold">Serial Details</Form.Label>
{serials.map((item, index) => (
  <Row className="mb-2" key={index}>
    <Col md={3}>
      <Form.Control value={item.serial_no} readOnly />
    </Col>
    <Col md={3}>
      <Form.Control
        size="sm"
        placeholder="Remark"
        value={item.remark || ''}
        onChange={(e) => handleInputChange(index, 'remark', e.target.value)}
      />
    </Col>
    <Col md={3}>
      <Form.Select
        size="sm"
        value={item.quality_check || ''}
        onChange={(e) => handleInputChange(index, 'quality_check', e.target.value)}
      >
        <option value="">-- Select --</option>
        <option value="ok">OK</option>
        <option value="Issue">Issue</option>
      </Form.Select>
    </Col>
    <Col md={3}>
      <Button
        size="sm"
        variant="danger"
        onClick={() => handleDeleteSerial(index)}
      >
        Del
      </Button>
    </Col>
  </Row>
))}

        </div>

        <ToastContainer position="top-right" autoClose={3000} />

        <div className="d-flex justify-content-end">
             <Button variant="secondary" className="me-2" onClick={() => navigate('/purchaseOrder')}>
                      Cancel
                    </Button>
          <Button type="submit" variant="success">Update</Button>
        </div>
      </Form>
    </div>
  );
}

