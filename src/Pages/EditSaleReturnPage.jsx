import React, { useState } from 'react';
import { Form, Row, Col, Button, Container } from 'react-bootstrap';
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

  const handleSave = (e) => {
    e.preventDefault();
    const payload = { ...formData, returned: isReturned };
    console.log('Saving:', payload);
    // TODO: Add API call here
  };

  return (
    <Container className="py-5">
      <h3 className="mb-4  fw-bold">Sale Return Details</h3>

      <Form onSubmit={handleSave} className="border p-4 rounded shadow-sm bg-white">

        {/* Row 1: Customer / Batch / Category */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Customer</Form.Label>
              <Form.Control
                readOnly
                value={formData.customer_name}
                className="bg-light border-0 text-muted"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Batch</Form.Label>
              <Form.Control
                readOnly
                value={formData.batch}
                className="bg-light border-0 text-muted"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Control
                readOnly
                value={formData.category}
                className="bg-light border-0 text-muted"
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Row 2: Product Serial / Shipment Date / Delivery Date */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Product Serial No.</Form.Label>
              <Form.Control
                readOnly
                value={formData.product_serial_no}
                className="bg-light border-0 text-muted"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Shipment Date</Form.Label>
              <Form.Control
                readOnly
                value={formData.shipment_date}
                className="bg-light border-0 text-muted"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Delivery Date</Form.Label>
              <Form.Control
                readOnly
                value={formData.delivery_date}
                className="bg-light border-0 text-muted"
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Row 3: Tracking No / Notes */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Tracking No.</Form.Label>
              <Form.Control
                readOnly
                value={formData.tracking_no}
                className="bg-light border-0 text-muted"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                readOnly
                value={formData.notes}
                className="bg-light border-0 text-muted"
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Row 4: Checkbox and Button */}
        <Row className="align-items-center mt-4">
          <Col md={6}>
            <Form.Check
              type="checkbox"
              label="Mark as Returned"
              checked={isReturned}
              onChange={(e) => setIsReturned(e.target.checked)}
              className="fs-5 fw-semibold"
            />
          </Col>
          <Col md={6} className="text-end">
      

  <Button type="submit" variant="success" className="me-2">
    Update
  </Button>
  <Button variant="secondary" onClick={() => navigate(-1)}>
    Cancel
  </Button>
</Col>

        </Row>
      </Form>
    </Container>
  );
}
