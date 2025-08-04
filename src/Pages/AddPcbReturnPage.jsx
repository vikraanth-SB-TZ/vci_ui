import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Table } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "../api";

export default function PurchaseReturnPage() {
  const [invoiceList, setInvoiceList] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [purchaseData, setPurchaseData] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [reason, setReason] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/purchases/invoices`)
      .then(res => setInvoiceList(res.data))
      .catch(() => toast.error('Failed to fetch invoices'));
  }, []);


  const fetchDetails = (invoice) => {
    axios.get(`${API_BASE_URL}/purchase-return/${invoice}`)
      .then(res => {
        setPurchaseData(res.data.purchase);
        const items = res.data.items.map(item => ({
          ...item,
          selected: false,
          remark: '',
          quality_check: ''
        }));
        setReturnItems(items);
      })
      .catch(() => toast.error('Failed to fetch purchase details'));
  };


  const handleSubmit = () => {
    const selectedItems = returnItems.filter(i => i.selected);
      if (!selectedItems.length) {
      toast.warning('No items selected for return');
      return;
    }

    axios.post(`${API_BASE_URL}/purchase-returns`, {
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
      toast.success('Returned successfully!');
      setSelectedInvoice('');
      setPurchaseData(null);
      setReturnItems([]);
      setReason('');
       navigate('/purchaseReturn'); 
    }).catch(() => toast.error('Failed to submit return'));
  };

  return (
    <div className="bg-white min-vh-100 p-4">
      <h5>Sale Return</h5>
      <div className='text-end pt-0'>
             <Button
                variant="secondary"
            
                className="me-2"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
      </div>
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
       <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
