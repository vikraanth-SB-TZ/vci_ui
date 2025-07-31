import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Table } from 'react-bootstrap';
import Select from 'react-select';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function SaleReturns() {
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [saleId, setSaleId] = useState(null);
    const [serials, setSerials] = useState([]);
    const [reason, setReason] = useState('');

    // 🔹 Load all invoices for dropdown
    useEffect(() => {
        axios.get('http://localhost:8000/api/invoice')
            .then(res => {
                const invoiceOptions = res.data.map(item => ({
                    label: item.invoice_no,
                    value: item.id
                }));
                setInvoices(invoiceOptions);
            })
            .catch(() => {
                toast.error('Failed to load invoices');
            });
    }, []);

    // 🔹 Handle invoice change
    const handleInvoiceChange = (option) => {
        setSelectedInvoice(option);
        setSerials([]);
        setSaleId(null);

        axios.get(`http://localhost:8000/api/sale-return/invoice/${option.label}`)
            .then((res) => {
                const data = res.data.products.map(item => ({
                    ...item,
                    checked: false,
                    remark: ''
                }));
                setSerials(data);
                setSaleId(res.data.sale_id);
            })
            .catch(() => {
                toast.error('No serial numbers found for this invoice');
            });
    };

    const handleCheckboxChange = (idx) => {
        const updated = [...serials];
        updated[idx].checked = !updated[idx].checked;
        setSerials(updated);
    };

    const handleSubmit = () => {
    const selectedProducts = serials.filter(item => item.checked);

    if (selectedProducts.length === 0) {
        toast.error('Please select at least one product to return.');
        return;
    }

    const payload = {
        sale_id: saleId,
        reason: reason,
        products: selectedProducts.map(item => ({
            sale_item_id: item.sale_item_id,
            product_id: item.product_id,
            remark: item.remark
        }))
    };

    axios.post('http://localhost:8000/api/sale-return-store', payload)
        .then(() => {
            toast.success('Return processed successfully!');
            // Reset state
            setSelectedInvoice(null);
            setSaleId(null);
            setSerials([]);
            setReason('');
        })
        .catch(err => {
            toast.error('Failed to process return');
            console.error(err.response?.data || err.message);
        });
};


    const handleRemarkChange = (idx, value) => {
        const updated = [...serials];
        updated[idx].remark = value;
        setSerials(updated);
    };


    return (
     <div className="p-4 bg-white min-vh-100">

            <h5>Sale Return</h5>

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Label>Select Invoice</Form.Label>
                    <Select
                        options={invoices}
                        value={selectedInvoice}
                        onChange={handleInvoiceChange}
                        placeholder="Select Invoice"
                    />
                </Col>
            </Row>

            <Row className="mb-3">
                <Col>
                    <Form.Label>Reason</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Optional reason"
                    />
                </Col>
            </Row>

            {serials.length > 0 && (
                <Table hover size="sm">
                    <thead>
                        <tr>
                            <th  className='fw-semibold'>Sno</th>
                            <th  className='fw-semibold'>Serial No</th>
                            <th  className='fw-semibold'>Remark</th>
                            <th  className='fw-semibold'>Return?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {serials.map((item, idx) => (
                            <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>{item.serial_no}</td>
                                <td>
                                    <Form.Control
                                        type="text"
                                        value={item.remark}
                                        onChange={(e) => handleRemarkChange(idx, e.target.value)}
                                    />
                                </td>
                                <td className="text-center">
                                    <Form.Check
                                        type="checkbox"
                                        checked={item.checked}
                                        onChange={() => handleCheckboxChange(idx)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
           <div className="text-end mt-3">
            <Button variant="success" className='text-end' onClick={handleSubmit}>
                Return
            </Button>
            </div>
        </div>
    );
}
