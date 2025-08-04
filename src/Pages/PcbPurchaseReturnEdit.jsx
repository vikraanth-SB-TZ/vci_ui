import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from "../api";



export default function EditPurchaseReturnPage() {
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [purchaseData, setPurchaseData] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnId, setReturnId] = useState(null);
  const [reason, setReason] = useState('');
  const { id } = useParams(); 
  const navigate = useNavigate();


  useEffect(() => {
    if (id) {
      axios.get(`${API_BASE_URL}/purchase-return-by-id/${id}`)
        .then(res => {
          setSelectedInvoice(res.data.purchase.invoice_no); 
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
    // if (!selectedItems.length) return alert('No items selected.');

    const payload = {
      pcb_board_purchase_id: purchaseData.id,
      reason: reason,
      items: selectedItems.map(item => ({
        id: item.id,
        remark: item.remark,
        quality_check: item.quality_check
      }))
    };

    const url = `${API_BASE_URL}/purchase-returns/${returnId}`;
    axios.put(url, payload)
     .then(() => {
  toast.success('Return updated successfully!');
  setTimeout(() => navigate(-1), 1500); 
})
    .catch(err => {
  toast.error('Failed: ' + (err.response?.data?.message || err.message));
});
  };

  return (
    <div className="bg-white min-vh-100 p-4">
      <h5>Edit Purchase Return</h5>



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

          <Table className="mt-3">
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

  <div className="text-end mb-3">
  <Button
    variant="secondary"

    className="me-2"
    onClick={() => navigate(-1)}
  >
    Cancel
  </Button>
  <Button onClick={handleSubmit} variant="success">
    Update Return
  </Button>
</div>

        </>
      )}
      <ToastContainer position="top-right" autoClose={2000} />

    </div>
  );
}
