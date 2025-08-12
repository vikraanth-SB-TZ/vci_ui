import React, { useEffect, useState } from 'react';
import { Form, Row, Col, Button, Container, Table, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../api';

export default function EditPurchaseReturnPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [purchaseData, setPurchaseData] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnId, setReturnId] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      axios
        .get(`${API_BASE_URL}/purchase-return-by-id/${id}`)
        .then((res) => {
          setPurchaseData(res.data.purchase);
          setReturnId(res.data.return_id ?? null);
          setReason(res.data.purchase.reason || '');

          const items = res.data.items.map((item) => ({
            ...item,
            selected: item.selected || false,
            remark: item.remark || '',
            quality_check: item.quality_check || '',
          }));
          setReturnItems(items);
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || 'Failed to load purchase return details.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (submitting) return;
    setSubmitting(true);

    const selectedItems = returnItems.filter((i) => i.selected);

    const payload = {
      pcb_board_purchase_id: purchaseData.id,
      reason: reason,
      items: selectedItems.map((item) => ({
        id: item.id,
        remark: item.remark,
        quality_check: item.quality_check,
      })),
    };

    axios
      .put(`${API_BASE_URL}/purchase-returns/${returnId}`, payload)
      .then(() => {
        toast.success('Return updated successfully!', { autoClose: 3000 });
        setTimeout(() => navigate(-1), 1500);
      })
      .catch((err) => {
        toast.error('Failed: ' + (err.response?.data?.message || err.message));
        setSubmitting(false);
      });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-dark">Edit Purchase Return</h4>
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left" /> Back
        </Button>
      </div>

      <Form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-white">
        {/* Row 1 - Basic Purchase Info */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Vendor</Form.Label>
              <Form.Control
                readOnly
                value={purchaseData.vendor_name}
                className="bg-light border-0 text-muted"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Control
                readOnly
                value={purchaseData.category_name}
                className="bg-light border-0 text-muted"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Invoice No</Form.Label>
              <Form.Control
                readOnly
                value={purchaseData.invoice_no}
                className="bg-light border-0 text-muted"
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Row 2 - Reason */}
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Return Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Returned Items Table */}
        <Row className="mb-4">
          <Col>
            <h5 className="fw-semibold mb-3">Returned Product Serials</h5>
            <div className="table-responsive">
              <Table bordered size="sm">
                <thead>
                  <tr className="table-light">
                    <th>S.No</th>
                    <th>Serial No</th>
                    <th>Remark</th>
                    <th>Quality Check</th>
                    <th className="text-center">Returned</th>
                  </tr>
                </thead>
                <tbody>
                  {returnItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td>{item.serial_no}</td>
                      <td>
                        <Form.Control
                          size="sm"
                          value={item.remark}
                          onChange={(e) => {
                            const updated = [...returnItems];
                            updated[idx].remark = e.target.value;
                            setReturnItems(updated);
                          }}
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          value={item.quality_check}
                          onChange={(e) => {
                            const updated = [...returnItems];
                            updated[idx].quality_check = e.target.value;
                            setReturnItems(updated);
                          }}
                        />
                      </td>
                      <td className="text-center">
                        <Form.Check
                          type="checkbox"
                          checked={item.selected || false}
                          onChange={(e) => {
                            const updated = [...returnItems];
                            updated[idx].selected = e.target.checked;
                            setReturnItems(updated);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>

        {/* Final Actions */}
        <Row className="mt-4">
          <Col className="text-end">
            <Button type="submit" variant="success" className="me-2" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update'}
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
