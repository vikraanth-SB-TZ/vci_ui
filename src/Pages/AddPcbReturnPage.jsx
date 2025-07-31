import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Table } from 'react-bootstrap';

export default function PurchaseReturnPage() {
  const [invoiceList, setInvoiceList] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [purchaseData, setPurchaseData] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [reason, setReason] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/purchases/invoices').then(res => {
      setInvoiceList(res.data);
    });
  }, []);

  const fetchDetails = (invoice) => {
    axios.get(`http://localhost:8000/api/purchase-return/${invoice_no}`).then(res => {
      setPurchaseData(res.data.purchase);
      const items = res.data.items.map(item => ({ ...item, selected: false, remark: '', quality_check: '' }));
      setReturnItems(items);
    });
  };

  const handleSubmit = () => {
    const selectedItems = returnItems.filter(i => i.selected);
    if (!selectedItems.length) return alert('No items selected.');

    axios.post('http://localhost:8000/api/purchase-returns', {
      pcb_board_purchase_id: purchaseData.id,
      vendor_id: purchaseData.vendor_id,
      batch_id: purchaseData.batch_id,
      category_id: purchaseData.category_id,
      invoice_no: purchaseData.invoice_no,
      invoice_date: purchaseData.invoice_date,
      items: selectedItems.map(item => ({
        id: item.id,
        remark: item.remark,
        quality_check: item.quality_check
      }))
    }).then(() => {
      alert('Returned successfully!');
    });
  };

  return (
    <div className="container mt-4">
      <h5>Sale Return</h5>
      <Form.Group>
        <Form.Label>Select Invoice</Form.Label>
        <Form.Select
          onChange={(e) => {
            setSelectedInvoice(e.target.value);
            fetchDetails(e.target.value);
          }}
          value={selectedInvoice}
        >
          <option value="">-- Select Invoice --</option>
          {invoiceList.map(inv => (
            <option key={inv.id} value={inv.invoice_no}>{inv.invoice_no}</option>
          ))}
        </Form.Select>
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
            <Button onClick={handleSubmit} variant="success">Return</Button>
          </div>
        </>
      )}
    </div>
  );
}
