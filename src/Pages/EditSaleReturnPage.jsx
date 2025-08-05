import React, { useState } from 'react';
import { Card, Form, Row, Col, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function SaleReturnDetails() {
  const navigate = useNavigate();

  const [formData] = useState({
    customer_name: 'John Doe',
    batch: 'Batch-001',
    category: 'Electronics',
    quantity: '5',
    from_serial_no: 'A1001',
    shipment_name: 'Blue Dart',
    product_serial_no: 'XJY-9382',
    shipment_date: '02-08-2025',
    delivery_date: '04-08-2025',
    tracking_no: 'TRK12345678',
    notes: 'Delivered in good condition',
  });

  const [isReturned, setIsReturned] = useState(false);

  const handleSave = () => {
    const payload = { ...formData, returned: isReturned };
    console.log('Saving:', payload);
    // TODO: Add API call here
  };

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card
        className="p-4 shadow-lg w-100"
        style={{
          maxWidth: '960px',
          backgroundColor: 'rgba(245, 245, 245, 0.6)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          borderRadius: '16px',
          border: '1px solid rgba(220, 220, 220, 0.4)',
        }}
      >
        <h4 className="fw-bold mb-4 text-center text-secondary">
          Sale Return Details (Read-Only)
        </h4>

        {/* Rows */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="text-muted">Customer</Form.Label>
              <Form.Control readOnly plaintext defaultValue={formData.customer_name} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="text-muted">Batch</Form.Label>
              <Form.Control readOnly plaintext defaultValue={formData.batch} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="text-muted">Category</Form.Label>
              <Form.Control readOnly plaintext defaultValue={formData.category} />
            </Form.Group>
          </Col>
        </Row>

        {/* <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="text-muted">Quantity</Form.Label>
              <Form.Control readOnly plaintext defaultValue={formData.quantity} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="text-muted">From Serial Number</Form.Label>
              <Form.Control readOnly plaintext defaultValue={formData.from_serial_no} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="text-muted">Shipment Name</Form.Label>
              <Form.Control readOnly plaintext defaultValue={formData.shipment_name} />
            </Form.Group>
          </Col>
        </Row> */}

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="text-muted">Product Serial No.</Form.Label>
              <Form.Control readOnly plaintext defaultValue={formData.product_serial_no} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="text-muted">Shipment Date</Form.Label>
              <Form.Control readOnly plaintext defaultValue={formData.shipment_date} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="text-muted">Delivery Date</Form.Label>
              <Form.Control readOnly plaintext defaultValue={formData.delivery_date} />
            </Form.Group>
          </Col>
        </Row>

        {/* <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-muted">Tracking No.</Form.Label>
              <Form.Control readOnly plaintext defaultValue={formData.tracking_no} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-muted">Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                readOnly
                value={formData.notes}
                className="bg-transparent text-muted"
                style={{ border: 'none' }}
              />
            </Form.Group>
          </Col>
        </Row> */}

        <Row className="mb-4">
          <Col>
            <Form.Check
              type="checkbox"
              label="Mark as Returned"
              className="fw-semibold"
              checked={isReturned}
              onChange={(e) => setIsReturned(e.target.checked)}
            />
          </Col>
        </Row>

        <div className="text-end">
          <Button variant="success" className="me-2 px-4" onClick={handleSave}>
            Save Changes
          </Button>
          <Button variant="outline-secondary" className="px-4" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </Card>
    </Container>
  );
}
