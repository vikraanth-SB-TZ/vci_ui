import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner, Offcanvas, Form } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const CustomArrow = ({ direction = "down", size = 12, color = "#5a5a5a" }) => {
  let rotate = 0;
  if (direction === "left") rotate = 90;
  if (direction === "right") rotate = -90;
  if (direction === "up") rotate = 180;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ transform: `rotate(${rotate}deg)` }}
      fill={color}
    >
      <path d="M12 16L6 8h12l-6 8z" />
    </svg>
  );
};

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
    test: "Ok",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${apiBase}/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${apiBase}/batches`);
      setBatches(res.data);
    } catch (error) {
      console.error(error);
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
      test: "Ok",
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
      test: product.test,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${apiBase}/products/${id}`);
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    if (isEditing) await axios.put(`${apiBase}/products/${productData.id}`, productData);
    else await axios.post(`${apiBase}/products`, productData);
    fetchProducts();
    setShowModal(false);
  };

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="vh-100 d-flex flex-column bg-light">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white sticky-top">
        <h5 className="mb-0 fw-bold">Product List ({products.length})</h5>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={fetchProducts}>
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button variant="success" size="sm" onClick={handleAddNewClick}>
            + Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: "auto", minWidth: "1000px" }}>
        {/* Header Row */}
        <div
          className="d-flex align-items-center px-4 border-bottom small fw-semibold"
          style={{ backgroundColor: "#E9ECEF", height: "60px" }}
        >
          <div style={{ width: "60px" }}>S.No</div>
          <div style={{ flex: 2 }}>Batch</div>
          <div style={{ flex: 2 }}>Category</div>
          <div style={{ flex: 2 }}>Serial No.</div>
          <div style={{ flex: 2 }}>Manufacture No.</div>
          <div style={{ flex: 2 }}>Firmware</div>
          <div style={{ flex: 2 }}>HSN Code</div>
          <div style={{ flex: 2 }}>Sale Status</div>
          <div style={{ flex: 2 }}>Test</div>
          <div style={{ width: "160px" }}>Action</div>
        </div>

        {loading ? (
          <div className="text-center mt-4">
            <Spinner animation="border" />
          </div>
        ) : products.length === 0 ? (
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "60vh" }}>
            <img src="/empty-box.png" alt="Empty" style={{ width: "160px", opacity: 0.6 }} />
            <p className="mt-3 text-muted">No product data available</p>
          </div>
        ) : (
          paginatedProducts.map((p, i) => (
            <div key={p.id} className="px-4 py-2 border-bottom d-flex bg-white align-items-center small">
              <div style={{ width: "60px" }}>{indexOfFirstItem + i + 1}</div>
              <div style={{ flex: 2 }}>{p.batch?.batch || "—"}</div>
              <div style={{ flex: 2 }}>{p.category?.category || "—"}</div>
              <div style={{ flex: 2 }}>{p.serial_no || "—"}</div>
              <div style={{ flex: 2 }}>{p.manufacture_no || "—"}</div>
              <div style={{ flex: 2 }}>{p.firmware_version || "—"}</div>
              <div style={{ flex: 2 }}>{p.hsn_code || "—"}</div>
              <div style={{ flex: 2 }}>{p.sale_status || "—"}</div>
              <div style={{ flex: 2 }}>{p.test || "—"}</div>
              <div style={{ width: "160px" }}>
                <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(p)}>
                  <i className="bi bi-pencil-square"></i>
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(p.id)}>
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {products.length > 0 && (
        <div
          className="d-flex justify-content-between align-items-center py-2 px-4 border-top bg-white"
          style={{ position: "sticky", bottom: 0 }}
        >
          <div
            className="position-relative px-2 py-1 rounded"
            style={{ backgroundColor: "#f1f3f5", width: "140px" }}
          >
            <select
              className="form-select form-select-sm border-0 bg-transparent pe-4"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              style={{
                boxShadow: "none",
                background: "transparent",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                cursor: "pointer",
              }}
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
            <span
              className="position-absolute"
              style={{
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <CustomArrow direction="down" size={12} />
            </span>
          </div>

          <div
            className="d-flex align-items-center justify-content-between px-3 py-1 rounded"
            style={{
              backgroundColor: "#fff",
              border: "1px solid #dee2e6",
              minWidth: "100px",
            }}
          >
            <Button
              variant="link"
              size="sm"
              className="p-0 me-2"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              <CustomArrow direction="left" />
            </Button>
            <span className="small">
              {products.length === 0
                ? "0-0"
                : `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, products.length)}`}
            </span>
            <Button
              variant="link"
              size="sm"
              className="p-0 ms-2"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              <CustomArrow direction="right" />
            </Button>
          </div>
        </div>
      )}

      {/* Offcanvas Modal */}
      <Offcanvas show={showModal} onHide={() => setShowModal(false)} placement="end" backdrop="static">
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
                  <option key={b.id} value={b.id}>
                    {b.batch}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="col-md-6">
              <Form.Label>Category</Form.Label>
              <Form.Select name="category_id" value={productData.category_id} onChange={handleChange}>
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="col-md-6">
              <Form.Label>Serial No.</Form.Label>
              <Form.Control
                name="serial_no"
                value={productData.serial_no}
                onChange={handleChange}
                placeholder="Enter Serial No."
              />
            </Form.Group>
            <Form.Group className="col-md-6">
              <Form.Label>Manufacture No.</Form.Label>
              <Form.Control
                name="manufacture_no"
                value={productData.manufacture_no}
                onChange={handleChange}
                placeholder="Enter Manufacture No."
              />
            </Form.Group>
            <Form.Group className="col-md-6">
              <Form.Label>Firmware Version</Form.Label>
              <Form.Control
                name="firmware_version"
                value={productData.firmware_version}
                onChange={handleChange}
                placeholder="Enter Firmware Version"
              />
            </Form.Group>
            <Form.Group className="col-md-6">
              <Form.Label>HSN Code</Form.Label>
              <Form.Control
                name="hsn_code"
                value={productData.hsn_code}
                onChange={handleChange}
                placeholder="Enter HSN Code"
              />
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
              <Button variant="success" onClick={handleSave}>
                Save
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
