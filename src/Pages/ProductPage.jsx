import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button, Spinner, Offcanvas, Form } from "react-bootstrap";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "bootstrap-icons/font/bootstrap-icons.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { API_BASE_URL } from "../api";

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
    sale_status: "",
    test: "",
  });

  const tableRef = useRef(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([fetchProducts(), fetchCategories(), fetchBatches()]);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      const res = await axios.get(`${API_BASE_URL}/products`);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Failed to fetch products!");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(res.data);
    } catch (error) {
      toast.error("Failed to fetch categories!");
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/batches`);
      setBatches(res.data);
    } catch (error) {
      toast.error("Failed to fetch batches!");
    }
  };

  useEffect(() => {
    if (!loading && products.length > 0 && !$.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable({
        ordering: true,
        paging: true,
        searching: true,
        lengthChange: true,
        columnDefs: [{ targets: 0, className: "text-center" }],
      });
    }
  }, [products, loading]);

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
      sale_status: "",
      test: "",
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

  const MySwal = withReactContent(Swal);

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this product?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      await axios.delete(`${API_BASE_URL}/products/${id}`);
      toast.success("Product deleted!");
      await fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...productData, [name]: value };

    // Auto update Sale Status if Test = Issue
    if (name === "test" && value === "Issue") {
      updatedData.sale_status = "Reserved";
    }
    setProductData(updatedData);
  };

  const validateForm = () => {
    if (!productData.batch_id) {
      toast.warn("Please select a batch!");
      return false;
    }
    if (!productData.category_id) {
      toast.warn("Please select a category!");
      return false;
    }
    if (!productData.serial_no.trim()) {
      toast.warn("Serial Number is required!");
      return false;
    }
    if (!productData.manufacture_no.trim()) {
      toast.warn("Manufacture Number is required!");
      return false;
    }
    if (!productData.firmware_version.trim()) {
      toast.warn("Firmware Version is required!");
      return false;
    }
    if (!productData.hsn_code.trim()) {
      toast.warn("HSN Code is required!");
      return false;
    }
    if (!productData.test) {
      toast.warn("Please select a Test Status!");
      return false;
    }
    if (!productData.sale_status) {
      toast.warn("Please select a Sale Status!");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      if (isEditing) {
        await axios.put(`${API_BASE_URL}/products/${productData.id}`, productData);
        toast.success("Product updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/products`, productData);
        toast.success("Product added successfully!");
      }

      await fetchProducts();
      setShowModal(false);
    } catch (error) {
      console.log("Save product error:", error.response?.data); // <-- Debug log
      if (error.response?.status === 422 && error.response.data?.errors) {
        Object.values(error.response.data.errors).forEach((msg) => toast.error(msg[0]));
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to save product!");
      }
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between mb-3">
        <h5 className="fw-bold">Products ({products.length.toString().padStart(2, "0")})</h5>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={fetchAllData}>
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button
            size="sm"
            onClick={handleAddNewClick}
            style={{
              backgroundColor: "#2FA64F",
              borderColor: "#2FA64F",
              color: "#fff",
            }}
          >
            + Add New
          </Button>
        </div>
      </div>

      <div className="table-responsive">
        <table ref={tableRef} className="table custom-table">
          <thead>
            <tr>
              <th style={{ textAlign: "center", width: "70px" }}>S.No</th>
              <th>Batch</th>
              <th>Category</th>
              <th>Serial No</th>
              <th>Manufacture No</th>
              <th>Firmware</th>
              <th>HSN Code</th>
              <th>Test</th>
              <th>Sale Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center py-4">
                  <Spinner animation="border" />
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-4 text-muted">
                  No product data available
                </td>
              </tr>
            ) : (
              products.map((p, index) => (
                <tr key={p.id}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{p.batch?.batch || "—"}</td>
                  <td>{p.category?.category || "—"}</td>
                  <td>{p.serial_no || "—"}</td>
                  <td>{p.manufacture_no || "—"}</td>
                  <td>{p.firmware_version || "—"}</td>
                  <td style={{ textAlign: "center" }}>{p.hsn_code || "—"}</td>
                  <td>{p.test || "—"}</td>
                  <td>{p.sale_status || "—"}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(p)}>
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(p.id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Side Offcanvas Modal */}
      <Offcanvas show={showModal} onHide={() => setShowModal(false)} placement="end" backdrop="static" className="custom-offcanvas">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="fw-bold">{isEditing ? "Edit Product" : "Add New Product"}</Offcanvas.Title>
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
              <Form.Control name="serial_no" value={productData.serial_no} onChange={handleChange} placeholder="Enter Serial No." />
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
              <Form.Control name="hsn_code" value={productData.hsn_code} onChange={handleChange} placeholder="Enter HSN Code" />
            </Form.Group>

            <Form.Group className="col-md-6">
              <Form.Label>Test Status</Form.Label>
              <Form.Select name="test" value={productData.test} onChange={handleChange}>
                <option value="">Select Test Status</option>
                <option value="Ok">OK</option>
                <option value="Issue">Issue</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="col-md-6">
              <Form.Label>Sale Status</Form.Label>
              <Form.Select
                name="sale_status"
                value={productData.sale_status}
                onChange={handleChange}
                disabled={productData.test === "Issue"}
              >
                <option value="">Select Sale Status</option>
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
                <option value="Reserved">Reserved</option>
              </Form.Select>
            </Form.Group>
          </Form>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="success" onClick={handleSave} style={{ minWidth: "120px" }}>
              {isEditing ? "Update" : "Save"}
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
