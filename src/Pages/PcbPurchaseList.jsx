import React, { useEffect, useState, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function PurchaseListPage() {
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const hasFetched = useRef(false);

  const [purchaseData, setPurchaseData] = useState([]);
  const [dropdowns, setDropdowns] = useState({ vendors: [], batches: [], categories: [] });
  const [formData, setFormData] = useState({
    vendor_id: '',
    invoice_no: '',
    invoice_date: '',
    batch: '',
    category: '',
    quantity: '',
    serials: [],
  });

  const [error, setError] = useState('');
  const [showReturnPanel, setShowReturnPanel] = useState(false);

const fetchPurchases = () => {
  axios.get('http://localhost:8000/api/purchase')
    .then(res => setPurchaseData(res.data))
    .catch(err => {
      console.error('Error fetching purchase list:', err);
      toast.error('Failed to fetch purchase list.');
    });
};

  const fetchDropdownData = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/form-dropdowns');
      const data = res.data.data;
      setDropdowns({
        vendors: data.vendors,
        batches: data.batches,
        categories: data.categories,
      });
    } catch (err) {
      console.error('Failed to load dropdowns:', err);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchPurchases();
    fetchDropdownData();
  }, []);


useEffect(() => {
  const $table = $(tableRef.current);

  if ($.fn.DataTable.isDataTable($table)) {
    $table.DataTable().destroy();
  }

  if (purchaseData.length > 0) {
    setTimeout(() => {
      $table.DataTable({
        ordering: true,
        paging: true,
        searching: true,
        lengthChange: true,
        columnDefs: [{ targets: 0, className: 'text-center' }],
      });
    }, 0);
  }
}, [purchaseData]);


  const handleEdit = (item) => {
    navigate(`/purchase/${item.id}/edit`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenerateInvoice = async (purchaseId) => {
  try {
  const res = await axios.get(`http://localhost:8000/api/pcb-purchase-invoice/${purchaseId}`);    
    if (res.data.url) {
      window.open(res.data.url, '_blank');
      toast.success('Invoice generated successfully!');
    } else {
      toast.warning('PDF URL not found.');
    }
  } catch (err) {
    console.error('Failed to generate/view invoice:', err);
 toast.error('Failed to generate invoice.');

  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      vendor_id: formData.vendor_id,
      invoice_no: formData.invoice_no,
      invoice_date: formData.invoice_date,
      batch_id: formData.batch,
      category_id: formData.category,
      quantity: parseInt(formData.quantity),
      serials: formData.serials,
    };

    if (payload.serials.length !== payload.quantity) {
      setError(`Serial numbers count (${payload.serials.length}) must match quantity (${payload.quantity}).`);
      
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/pcbstore', payload);
      if (response.data.status) {
      toast.success('Purchase saved successfully!');

        setShowReturnPanel(false);
        fetchPurchases();
        setFormData({
          vendor_id: '',
          invoice_no: '',
          invoice_date: '',
          batch: '',
          category: '',
          quantity: '',
          serials: [],
        });
        setError('');
      } else {
      toast.error(response.data.message || 'Failed to save purchase');
      }
    } catch (err) {
      const errMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || 'An unexpected error occurred.';
      setError(errMsg);
    }
  };

  return (
    <div className="w-100 py-4 bg-white" style={{ minHeight: '100vh', fontFamily: 'Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif,Product Sans', fontSize: '14px', fontWeight: '500' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 px-4">
        <h4 className="fw-semibold text-dark mb-0 fs-4">
          Purchase List <span className="text-dark fw-semibold">({purchaseData.length})</span>
        </h4>

        <div className="d-flex gap-2">

       
          <Button variant="outline-secondary p-0" style={{ width: '38px', height: '38px' }} onClick={fetchPurchases}>
            <i className="bi bi-arrow-clockwise fs-5 text-secondary"></i>
          </Button>
          <Button
            size="sm"
            variant="success d-flex align-items-center px-3"
            style={{ minWidth: '100px', fontSize: '0.9rem', fontWeight: '500' }}
            onClick={() => setShowReturnPanel(true)}
          >
            <i className="bi bi-plus me-1"></i> Add New
          </Button>
        </div>
      </div>

      <div className="shadow-sm overflow-hidden mx-4" style={{ borderRadius: '0.5rem' }}>
        <table ref={tableRef} className="table table-hover table-sm table-border mb-0 w-100">
          <thead>
            <tr className="border-bottom border-secondary-subtle">
              <th className="text-dark fw-semibold py-3 ps-4" style={{ backgroundColor: '#f3f7faff' }}>Sno</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f3f7faff' }}>Vendor</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f3f7faff' }}>Invoice no</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f3f7faff' }}>Invoice Date</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f3f7faff' }}>Batch</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f3f7faff' }}>Category</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f3f7faff' }}>Quantity</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f3f7faff' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchaseData.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-secondary">No purchase data available</td>
              </tr>
            ) : (
              purchaseData.map((item, index) => (
                <tr key={item.id}>
                  <td className="py-2 ps-4 text-dark">{String(index + 1).padStart(2, '0')}</td>
                  <td className="py-2 text-dark">{item.vendor}</td>
                  <td className="py-2 text-dark">{item.invoice_no}</td>
                  <td className="py-2 text-dark">{item.invoice_date}</td>
                  <td className="py-2 text-dark">{item.batch}</td>
                  <td className="py-2 text-dark">{item.category}</td>
                  <td className="py-2 text-dark">{item.quantity}</td>
                  <td className="py-2 pe-1 d-flex gap-2">
<Button
  variant="outline-info rounded-circle"
  size="sm"
  onClick={() => handleGenerateInvoice(item.id)}
>
  <i className="bi bi-file-earmark-pdf"></i>
</Button>
                    <Button variant="outline-primary rounded-circle" size="sm"><i className="bi bi-eye"></i></Button>
                    <Button variant="outline-warning rounded-circle" size="sm" onClick={() => handleEdit(item)}><i className="bi bi-pencil-square"></i></Button>
                    <Button variant="outline-danger rounded-circle" size="sm"><i className="bi bi-trash"></i></Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Side Panel */}
      <div className={`position-fixed end-0 bg-white shadow-lg`} style={{ top: '61px', height: 'calc(100% - 61px)', width: showReturnPanel ? '480px' : '0px', zIndex: 1050, overflow: 'auto', transition: 'width 0.3s ease' }}>
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Add purchase</h5>
            <Button variant="light" size="sm" onClick={() => setShowReturnPanel(false)}>
              <i className="bi bi-x-lg fs-6"></i>
            </Button>
          </div>

          <Form onSubmit={handleSubmit}>
            <div className="row gx-3">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="text-muted mb-1">Vendor</Form.Label>
                  <Form.Select size='sm' name="vendor_id" value={formData.vendor_id} onChange={handleChange}>
                    <option value="">-- Select Vendor --</option>
                    {dropdowns.vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="text-muted mb-1">Invoice no</Form.Label>
                  <Form.Control size='sm' type="text" name="invoice_no" value={formData.invoice_no} onChange={handleChange} />
                </Form.Group>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="text-muted mb-1">Invoice Date</Form.Label>
                  <Form.Control size='sm' type="date" name="invoice_date" value={formData.invoice_date} onChange={handleChange} />
                </Form.Group>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="text-muted mb-1">Batch</Form.Label>
                  <Form.Select size='sm' name="batch" value={formData.batch} onChange={handleChange}>
                    <option value="">-- Select Batch --</option>
                    {dropdowns.batches.map(b => <option key={b.id} value={b.id}>{b.name || `Batch ${b.id}`}</option>)}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-12 mb-3">
                <Form.Group>
                  <Form.Label className="text-muted mb-1">Category</Form.Label>
                  <Form.Select size='sm' name="category" value={formData.category} onChange={handleChange}>
                    <option value="">-- Select Category --</option>
                    {dropdowns.categories.map(c => <option key={c.id} value={c.id}>{c.category}</option>)}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label className="text-muted  mb-1">Quantity</Form.Label>
                  <Form.Control size="sm" type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
                </Form.Group>
              </div>

              <div className="col-12 mb-3">
                <Form.Group>
                  <Form.Label className="text-muted mb-1">Serial Numbers</Form.Label>
                  <Form.Control
                    size="sm"
                    as="textarea"
                    rows={3}
                    placeholder="E.g. SN-001"
                    onChange={(e) => {
                      const input = e.target.value;
                      const serialList = input.split(/\r?\n|,/).map(s => s.trim()).filter(s => s !== '');
                      setFormData(prev => ({ ...prev, serials: serialList }));
                    }}
                  />
                </Form.Group>
              </div>

              {formData.serials.length > 0 && (
                <div className="col-12 mb-3">
                  <Form.Group>
                    <Form.Label className="text-muted small mb-1">Entered Serial Numbers</Form.Label>
                    <ul className="list-unstyled small border rounded p-2 bg-light">
                      {formData.serials.map((sn, idx) => <li key={idx}>{sn}</li>)}
                    </ul>
                  </Form.Group>
                </div>
              )}
            </div>

            {error && <p className="text-danger mt-1">{error}</p>}

            <div className="mt-3">
              <Button variant="success" type="submit" className="pe-4">Save</Button>
            </div>
          </Form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop />

    </div>
  );
}
