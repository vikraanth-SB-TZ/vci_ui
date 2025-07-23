import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner, Form, Offcanvas, Table } from "react-bootstrap";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [productData, setProductData] = useState({
    id: null,
    category_id: "",
    batch_id: "",
    serial_no: "",
    manufacture_no: "",
    firmware_version: "",
    hsn_code: "",
    sale_status: "Available",
    test: "Ok"
  });

  const apiBase = "http://localhost:8000/api";

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBatches();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/products`);
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${apiBase}/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${apiBase}/batches`);
      setBatches(res.data);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const handleAddNewClick = () => {
    setIsEditing(false);
    setProductData({
      id: null,
      category_id: "",
      batch_id: "",
      serial_no: "",
      manufacture_no: "",
      firmware_version: "",
      hsn_code: "",
      sale_status: "Available",
      test: "Ok"
    });
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setProductData({
      id: product.id,
      category_id: product.category_id,
      batch_id: product.batch_id,
      serial_no: product.serial_no,
      manufacture_no: product.manufacture_no,
      firmware_version: product.firmware_version,
      hsn_code: product.hsn_code,
      sale_status: product.sale_status,
      test: product.test
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await axios.put(`${apiBase}/products/${productData.id}`, productData);
      } else {
        await axios.post(`${apiBase}/products`, productData);
      }
      fetchProducts();
      handleModalClose();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiBase}/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="w-100 py-4 bg-white" style={{ minHeight: '100vh', fontFamily: 'Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif', fontSize: '14px', fontWeight: '500' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 px-4">
        <h4 className="fw-semibold text-dark mb-0 fs-4">
          Product List <span className="text-dark fw-semibold">({products.length})</span>
        </h4>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary p-0" style={{ width: '38px', height: '38px' }} onClick={fetchProducts}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <i className="bi bi-arrow-clockwise fs-5 text-secondary"></i>
            )}
          </Button>
          <Button
            size="sm"
            variant="success d-flex align-items-center px-3"
            style={{ minWidth: '100px', fontSize: '0.9rem', fontWeight: '500' }}
            onClick={handleAddNewClick}
          >
            <i className="bi bi-plus me-1"></i> Add New
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <img src="/empty-box.png" alt="Empty" style={{ width: "160px", opacity: 0.6 }} className="mb-3" />
            <div className="text-muted fs-6">No product data available</div>
          </div>
        </div>
      ) : (
        <div className="shadow-sm overflow-auto mx-4" style={{ borderRadius: '0.5rem' }}>
          <Table hover responsive size="sm" className="table-border mb-0">
            <thead>
              <tr className="border-bottom border-secondary-subtle">
                <th className="py-3 ps-4" style={{ backgroundColor: '#f3f7faff' }}>S.No</th>
                <th className="py-3" style={{ backgroundColor: '#f6f7f8ff' }}>Batch</th>
                <th className="py-3" style={{ backgroundColor: '#f6f7f8ff' }}>Category</th>
                <th className="py-3" style={{ backgroundColor: '#f6f7f8ff' }}>Serial No.</th>
                <th className="py-3" style={{ backgroundColor: '#f6f7f8ff' }}>Manufacture No.</th>
                <th className="py-3" style={{ backgroundColor: '#f6f7f8ff' }}>Firmware Version</th>
                <th className="py-3" style={{ backgroundColor: '#f6f7f8ff' }}>HSN Code</th>
                <th className="py-3" style={{ backgroundColor: '#f6f7f8ff' }}>Sale Status</th>
                <th className="py-3" style={{ backgroundColor: '#f6f7f8ff' }}>Test</th>
                <th className="py-3 pe-4" style={{ backgroundColor: '#f6f7f8ff' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                  <td className="py-2 ps-4 text-dark">{String(index + 1).padStart(2, '0')}</td>
                  <td className="py-2 text-dark">{product.batch?.batch || '—'}</td>
                  <td className="py-2 text-dark">{product.category?.category || '—'}</td>
                  <td className="py-2 text-dark">{product.serial_no || '—'}</td>
                  <td className="py-2 text-dark">{product.manufacture_no || '—'}</td>
                  <td className="py-2 text-dark">{product.firmware_version || '—'}</td>
                  <td className="py-2 text-dark">{product.hsn_code || '—'}</td>
                  <td className="py-2 text-dark">{product.sale_status || '—'}</td>
                  <td className="py-2 text-dark">{product.test || '—'}</td>
                  <td className="py-2 pe-4 d-flex gap-2">
                    <Button variant="outline-primary" size="sm" title="Edit" onClick={() => handleEdit(product)}>
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" title="Delete" onClick={() => handleDelete(product.id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Offcanvas Modal */}
      <Offcanvas show={showModal} onHide={handleModalClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{isEditing ? "Edit Product" : "Add Product"}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form className="row g-3">
            <Form.Group className="col-md-6">
              <Form.Label>Batch</Form.Label>
              <Form.Select name="batch_id" value={productData.batch_id} onChange={handleChange}>
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.batch}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="col-md-6">
              <Form.Label>Category</Form.Label>
              <Form.Select name="category_id" value={productData.category_id} onChange={handleChange}>
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.category}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="col-md-6">
              <Form.Label>Serial No.</Form.Label>
              <Form.Control name="serial_no" value={productData.serial_no} onChange={handleChange} placeholder="Enter Serial No." />
            </Form.Group>

            <Form.Group className="col-md-6">
              <Form.Label>Manufacture No.</Form.Label>
              <Form.Control name="manufacture_no" value={productData.manufacture_no} onChange={handleChange} placeholder="Enter Manufacture No." />
            </Form.Group>

            <Form.Group className="col-md-6">
              <Form.Label>Firmware Version</Form.Label>
              <Form.Control name="firmware_version" value={productData.firmware_version} onChange={handleChange} placeholder="Enter Firmware Version" />
            </Form.Group>

            <Form.Group className="col-md-6">
              <Form.Label>HSN Code</Form.Label>
              <Form.Control name="hsn_code" value={productData.hsn_code} onChange={handleChange} placeholder="Enter HSN Code" />
            </Form.Group>

            <Form.Group className="col-md-6">
              <Form.Label>Sale Status</Form.Label>
              <Form.Select name="sale_status" value={productData.sale_status} onChange={handleChange}>
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
                <option value="Reserved">Reserved</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="col-md-6">
              <Form.Label>Test Status</Form.Label>
              <Form.Select name="test" value={productData.test} onChange={handleChange}>
                <option value="Ok">OK</option>
                <option value="Issue">Issue</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end mt-3">
              <Button variant="success" onClick={handleSave}>Save</Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
