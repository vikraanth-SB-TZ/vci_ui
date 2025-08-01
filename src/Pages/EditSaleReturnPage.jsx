
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';

export default function EditSaleReturnPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [returnData, setReturnData] = useState(null);
  const [reason, setReason] = useState('');
  const [products, setProducts] = useState([]);

useEffect(() => {
  axios.get(`http://localhost:8000/api/sale-returns/view/${id}`)
    .then(res => {
      const data = res.data;
      setReturnData(data);
      setReason(data.reason || '');
      const formattedProducts = (data.products || []).map(p => ({
        ...p,
        selected: true // ✅ mark as selected initially
      }));
      setProducts(formattedProducts);
    })
    .catch(err => {
      console.error('Error fetching return details:', err);
    });
}, [id]);
const handleSave = () => {
  const selectedProducts = products.filter(p => p.selected);

  axios.put(`http://localhost:8000/api/update/${id}`, {
    reason,
    products: selectedProducts.map(p => ({
      sale_item_id: p.sale_item_id,
      product_id: p.product_id,
      remark: p.remark || '',
    }))
  }).then(() => {
    toast.success('Return updated successfully');
    navigate('/returns');
  }).catch(err => {
    toast.error('Update failed');
    console.error(err);
  });
};


  if (!returnData) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 bg-white" style={{ minHeight: '100vh' }}>
      <h5>Edit Return - {returnData.return_invoice_no}</h5>

      <Form.Group className="my-3">
        <Form.Label>Reason</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Form.Group>

    <Table bordered size="sm">
  <thead>
    <tr>
      <th>S.No</th>
      <th>Serial No</th>
      <th>Remark</th>
      <th>Returned</th> {/* ✅ New column for checkbox */}
    </tr>
  </thead>
  <tbody>
    {products.map((prod, idx) => (
      <tr key={prod.product_id}>
        <td>{idx + 1}</td>
        <td>{prod.serial_no}</td>
        <td>
          <Form.Control
            size="sm"
            value={prod.remark || ''}
            onChange={(e) => {
              const updated = [...products];
              updated[idx].remark = e.target.value;
              setProducts(updated);
            }}
          />
        </td>
        <td className="text-center">
          <Form.Check
            type="checkbox"
            checked={prod.selected || false}
            onChange={(e) => {
              const updated = [...products];
              updated[idx].selected = e.target.checked;
              setProducts(updated);
            }}
          />
        </td>
      </tr>
    ))}
  </tbody>
</Table>


      <Button variant="primary" onClick={handleSave}>Save Changes</Button>{' '}
      <Button variant="secondary" onClick={() => navigate('/returns')}>Cancel</Button>
    </div>
  );
}
