import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Card } from 'react-bootstrap';
import { API_BASE_URL } from '../api';

export default function ViewSalePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/sales/${id}`)
      .then(res => {
        if (res.data.success) {
          setSale(res.data.data);
        }
      })
      .catch(err => {
        console.error('Error fetching sale:', err);
      });
  }, [id]);

  if (!sale) {
    return <div className="p-4">Loading sale details...</div>;
  }

  return (
    <div className="container py-4">
      <Card className="p-4 shadow-sm">
        <h4 className="mb-4">Sale Details</h4>
        <p><strong>Customer:</strong> {sale.first_name}</p>
        <p><strong>Shipment Name:</strong> {sale.shipment_name}</p>
        <p><strong>Shipment Date:</strong> {sale.shipment_date}</p>
        <p><strong>Delivery Date:</strong> {sale.delivery_date}</p>
        <p><strong>Tracking No:</strong> {sale.tracking_no || 'N/A'}</p>
        <p><strong>Invoice No:</strong> {sale.invoice_no}</p>
        <p><strong>Quantity:</strong> {sale.quantity}</p>
        <p><strong>Batch:</strong> {sale.batch}</p>
        <p><strong>Category:</strong> {sale.category}</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </Card>
    </div>
  );
}
