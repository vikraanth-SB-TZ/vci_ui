import React, { useEffect, useState ,useRef } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';


export default function SalesListPage() {
  
const hasFetched = useRef(false);
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

const [batches, setBatches] = useState([]);
const [categories, setCategories] = useState([]);
const [selectedBatch, setSelectedBatch] = useState('');
const [selectedCategory, setSelectedCategory] = useState('');

  const pageSize = 10;

  const fetchSales = () => {
    axios.get('http://localhost:8000/api/list')
      .then(res => {
        if (res.data.success) {
          setSalesData(res.data.data);
        }
      })
      .catch(err => {
        console.error('Error fetching sales list:', err);
      });
  };

useEffect(() => {
  if (hasFetched.current) return; // Prevent second call
  hasFetched.current = true;

  fetchSales(); // Your API
  axios.get('http://localhost:8000/api/form-dropdowns')
    .then(res => {
      const data = res.data?.data || {};
      setBatches(data.batches || []);
      setCategories(data.categories || []);
    })
    .catch(err => console.error('Error loading dropdowns:', err));
}, []);

useEffect(() => {
  setCurrentPage(1);
}, [selectedBatch, selectedCategory]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) return;

    try {
      await axios.delete(`http://localhost:8000/api/sales/${id}`);
      fetchSales(); // Refresh list after delete
      alert('Deleted successfully.');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete sale.');
    }
  };

  const handleViewInvoice = async (saleId) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/sales/${saleId}/invoice`);
      if (res.data.pdf_url) {
        window.open(res.data.pdf_url, '_blank');
      } else {
        alert('Invoice not generated.');
      }
    } catch (err) {
      console.error('Failed to load invoice PDF:', err);
      alert('Error generating invoice PDF.');
    }
  };

  const filteredData = salesData.filter(item => {
  const matchesBatch = selectedBatch ? item.batch_name === selectedBatch : true;
  const matchesCategory = selectedCategory ? item.category_name === selectedCategory : true;
  return matchesBatch && matchesCategory;
});


// Pagination on filtered data
const totalItems = filteredData.length;
const totalPages = Math.ceil(totalItems / pageSize);
const startIndex = (currentPage - 1) * pageSize;
const currentData = filteredData.slice(startIndex, startIndex + pageSize);



  // Pagination
  // const totalItems = salesData.length;
  // const totalPages = Math.ceil(totalItems / pageSize);
  // const startIndex = (currentPage - 1) * pageSize;
  // const currentData = salesData.slice(startIndex, startIndex + pageSize);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="w-100 py-4 bg-white" style={{ minHeight: '100vh', fontFamily: 'Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif', fontSize: '14px', fontWeight: '500' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 px-4">
        <h4 className="fw-semibold text-dark mb-0 fs-4">
          Sales List <span className="text-dark fw-semibold">({filteredData.length})</span>
        </h4>


  <div className="d-flex gap-2">
  <select className="form-select form-select-sm" style={{ width: '150px', backgroundColor: '#f6f7f8ff',boxShadow: 'none', borderColor: '#ced4da' }} value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
    <option value=""> Batch</option>
    {batches.map(batch => (
      <option key={batch.id} >{batch.batch}</option>
    ))}
  </select>

  <select className="form-select form-select-sm" style={{ width: '150px', backgroundColor: '#f6f7f8ff',boxShadow: 'none', borderColor: '#ced4da' }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
    <option value="">Category</option>
    {categories.map(category => (
      <option key={category.id}>{category.category}</option>
    ))}
  </select>
</div>

        <div className="d-flex gap-2">
          <Button variant="outline-secondary p-0" style={{ width: '38px', height: '38px' }}>
            <i className="bi bi-list fs-5 text-secondary"></i>
          </Button>
          <Button variant="outline-secondary p-0" style={{ width: '38px', height: '38px' }}  onClick={fetchSales}>
            <i className="bi bi-arrow-clockwise fs-5 text-secondary"></i>
          </Button>
          <Button
            size="sm"
            variant="success d-flex align-items-center px-3"
            style={{ minWidth: '100px', fontSize: '0.9rem', fontWeight: '500' }}
            onClick={() => navigate('/sales/add')}
          >
            <i className="bi bi-plus me-1"></i> Add New
          </Button>
        </div>
      </div>

      <div className="shadow-sm overflow-hidden" style={{ borderRadius: '0.5rem' }}>
        <Table hover responsive size="sm" className="table-border mb-0">
          <thead>
            <tr className="border-bottom border-secondary-subtle">
              <th className="text-dark fw-semibold py-3 ps-4" style={{ backgroundColor: '#f3f7faff' }}>S.No</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f6f7f8ff' }}>Customer Name</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f6f7f8ff' }}>Shipment Date</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f6f7f8ff' }}>Delivery Date</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f6f7f8ff' }}>Batch</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f6f7f8ff' }}>Category</th>
              <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f6f7f8ff' }}>Qty</th>
              <th className="text-dark fw-medium py-3 pe-4" style={{ backgroundColor: '#f6f7f8ff' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-4 text-secondary">No sales data available</td>
              </tr>
            ) : (
              currentData.map((item, index) => (
                <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                  <td className="py-2 ps-4 text-dark">{String(startIndex + index + 1).padStart(2, '0')}</td>
                  <td className="py-2 text-dark">{item.customer_name}</td>
                  <td className="py-2 text-dark">{item.shipment_date}</td>
                  <td className="py-2 text-dark">{item.delivery_date}</td>
                  <td className="py-2 text-dark">{item.batch_name}</td>
                  <td className="py-2 text-dark">{item.category_name}</td>
                  <td className="py-2 text-dark">{item.quantity}</td>

                  <td className="py-2 pe-1 d-flex gap-2">

                       <Button
                      variant="outline-info rounded-circle"
                      size="sm"
                      onClick={() => handleViewInvoice(item.id)}
                    >
                        <i className="bi bi-file-earmark-pdf"></i>
                    </Button>
                    <Button
                      variant="outline-primary rounded-circle"
                      size="sm"
                      title="View"
                      onClick={() => navigate(`/sales/view/${item.id}`)}
                    >
                      <i className="bi bi-eye"></i>
                    </Button>
                    <Button
                      variant="outline-warning rounded-circle"
                      size="sm"
                      title="Edit"
                      onClick={() => navigate(`/sales/edit/${item.id}`)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button
                      variant="outline-danger rounded-circle"
                      size="sm"
                      title="Delete"
                      onClick={() => handleDelete(item.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3 px-4 pb-4">
        <select className="form-select form-select-sm" style={{ width: '120px', backgroundColor: '#f3f7faff' }} enabled>
          <option>10 per page</option>
          <option>15 per page</option>
        </select>
        <div>
          <Button variant="light" size="sm" className="me-1" onClick={handlePrev} disabled={currentPage === 1}>&lt;</Button>
          <span className="mx-1 text-secondary fw-medium fs-6">
            {totalItems === 0
              ? '0 - 0'
              : `${startIndex + 1} - ${Math.min(startIndex + pageSize, totalItems)}`}
          </span>
          <Button variant="light" size="sm" className="ms-1" onClick={handleNext} disabled={currentPage === totalPages}>&gt;</Button>
        </div>
      </div>
    </div>
  );
}
