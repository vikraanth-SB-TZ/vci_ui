import React from 'react';

export default function Invoice() {
  const invoiceData = {
    brand: 'Brand Name',
    invoiceNo: 'INV-2025-001',
    invoiceDate: '2025-07-21',
    customer: {
      name: 'Dwayne Clark',
      address: '123 Example Street, New York, NY'
    },
    items: [
      { id: 1, description: 'Lorem Ipsum Dolor', price: 20.0, qty: 2 },
      { id: 2, description: 'Pellentesque Habitant', price: 30.0, qty: 1 },
      { id: 3, description: 'Mauris Eu Ultricies', price: 50.0, qty: 2 },
    ],
    taxRate: 0.05,
    payment: {
      bank: 'XYZ Bank',
      account: '1234567890',
      ifsc: 'XYZ0001234',
    }
  };

  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * invoiceData.taxRate;
  const total = subtotal + tax;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, fontSize: '14px' }}>
      
      {/* Header */}
      <div style={{ backgroundColor: '#000', color: '#fff', padding: '20px' }}>
        <h2 style={{ margin: 0 }}>{invoiceData.brand}</h2>
      </div>

      {/* Invoice Banner */}
      <div style={{ backgroundColor: '#dc3545', color: '#fff', padding: '15px', textAlign: 'right' }}>
        <div style={{ fontSize: '26px', fontWeight: 'bold' }}>INVOICE</div>
        <div>Invoice #: {invoiceData.invoiceNo}</div>
        <div>Date: {invoiceData.invoiceDate}</div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px' }}>
        
        {/* To */}
        <div style={{ marginBottom: '20px' }}>
          <strong>Invoice to:</strong><br />
          {invoiceData.customer.name}<br />
          {invoiceData.customer.address}
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }} border="1">
          <thead>
            <tr>
              <th style={{ padding: '10px', backgroundColor: '#f5f5f5' }}>#</th>
              <th style={{ padding: '10px', backgroundColor: '#f5f5f5' }}>Item Description</th>
              <th style={{ padding: '10px', backgroundColor: '#f5f5f5' }}>Price</th>
              <th style={{ padding: '10px', backgroundColor: '#f5f5f5' }}>Qty.</th>
              <th style={{ padding: '10px', backgroundColor: '#f5f5f5' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map(item => (
              <tr key={item.id}>
                <td style={{ padding: '10px' }}>{item.id}</td>
                <td style={{ padding: '10px' }}>{item.description}</td>
                <td style={{ padding: '10px' }}>${item.price.toFixed(2)}</td>
                <td style={{ padding: '10px' }}>{item.qty}</td>
                <td style={{ padding: '10px' }}>${(item.price * item.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
          <p style={{ margin: 0 }}><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
          <p style={{ margin: 0 }}><strong>Tax (5%):</strong> ${tax.toFixed(2)}</p>
          <p style={{ margin: 0 }}><strong>Total:</strong> ${total.toFixed(2)}</p>
        </div>

        {/* Payment Info */}
        <div style={{ marginBottom: '20px' }}>
          <strong>Payment Info:</strong><br />
          Bank: {invoiceData.payment.bank}<br />
          A/C: {invoiceData.payment.account}<br />
          IFSC: {invoiceData.payment.ifsc}
        </div>

        {/* Footer */}
        <div style={{ fontSize: '12px', color: '#666', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
          Terms & Conditions: Payment is due within 7 days. Late payments may incur additional fees.
        </div>
      </div>
    </div>
  );
}
