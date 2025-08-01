
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


export default function EditPurchaseReturnPage() {
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [purchaseData, setPurchaseData] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnId, setReturnId] = useState(null);
  const [reason, setReason] = useState('');
  const { id } = useParams(); // returnId from URL
  const navigate = useNavigate();


  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8000/api/purchase-return-by-id/${id}`)
        .then(res => {
          setSelectedInvoice(res.data.purchase.invoice_no); // display only
          setPurchaseData(res.data.purchase);
          setReturnId(res.data.return_id ?? null);
          setReason(res.data.purchase.reason || '');

          const items = res.data.items.map(item => ({
            ...item,
            selected: item.selected || false,
            remark: item.remark || '',
            quality_check: item.quality_check || ''
          }));
          setReturnItems(items);
        });
    }
  }, [id]);

  const handleSubmit = () => {
    const selectedItems = returnItems.filter(i => i.selected);
    if (!selectedItems.length) return alert('No items selected.');

    const payload = {
      pcb_board_purchase_id: purchaseData.id,
      reason: reason,
      items: selectedItems.map(item => ({
        id: item.id,
        remark: item.remark,
        quality_check: item.quality_check
      }))
    };

    const url = `http://localhost:8000/api/purchase-returns/${returnId}`;
    axios.put(url, payload)
      .then(() => alert('Return updated successfully!'))
      .catch(err => alert('Failed: ' + err.response?.data?.message || err.message));
  };

  return (
    <div className="bg-white min-vh-100 p-4">
      <h5>Edit Purchase Return</h5>
      <Button variant="secondary" size="sm" className="mb-3 text-end" onClick={() => navigate(-1)}>
  ← Back
</Button>



      <Form.Group>
        <Form.Label>Invoice Number</Form.Label>
        <Form.Control
          type="text"
          value={selectedInvoice}
          readOnly
          plaintext
        />
      </Form.Group>

      {purchaseData && (
        <>
          <Form.Group className="mt-3">
            <Form.Label>Reason</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="Optional reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Form.Group>

          <Table bordered className="mt-3">
            <thead>
              <tr>
                <th>Sno</th>
                <th>Serial No</th>
                <th>Remark</th>
                <th>Return?</th>
              </tr>
            </thead>
            <tbody>
              {returnItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.serial_no}</td>
                  <td>
                    <Form.Control
                      size="sm"
                      value={item.remark}
                      onChange={(e) => {
                        const newItems = [...returnItems];
                        newItems[index].remark = e.target.value;
                        setReturnItems(newItems);
                      }}
                    />
                  </td>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={item.selected}
                      onChange={(e) => {
                        const newItems = [...returnItems];
                        newItems[index].selected = e.target.checked;
                        setReturnItems(newItems);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="text-end">
            <Button onClick={handleSubmit} variant="success">Update Return</Button>
          </div>
        </>
      )}
    </div>
  );
}
