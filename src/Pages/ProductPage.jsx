import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Spinner,
  Form,
  Card,
  Offcanvas,
} from "react-bootstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { API_BASE_URL } from "../api";
import Breadcrumb from "./Components/Breadcrumb";
import Pagination from "./Components/Pagination";
import Search from "./Components/Search";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

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

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes, bRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products`),
        axios.get(`${API_BASE_URL}/categories`),
        axios.get(`${API_BASE_URL}/batches`),
      ]);
      setProducts(pRes.data || []);
      setCategories(cRes.data || []);
      setBatches(bRes.data || []);
    } catch {
      toast.error("Failed to fetch data!");
    } finally {
      setLoading(false);
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
      sale_status: "",
      test: "",
    });
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setProductData({ ...product });
    setShowModal(true);
  };

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
      await axios.delete(`${API_BASE_URL}/products/${id}`);
      toast.success("Product deleted!");
      fetchAllData();
    } catch {
      toast.error("Failed to delete product!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...productData, [name]: value };
    if (name === "test" && value === "Issue") {
      updatedData.sale_status = "Reserved";
    }
    setProductData(updatedData);
  };

  const validateForm = () => {
    const requiredFields = [
      { key: "batch_id", label: "Batch" },
      { key: "category_id", label: "Category" },
      { key: "serial_no", label: "Serial Number" },
      { key: "manufacture_no", label: "Manufacture Number" },
      { key: "firmware_version", label: "Firmware Version" },
      { key: "hsn_code", label: "HSN Code" },
      { key: "test", label: "Test Status" },
      { key: "sale_status", label: "Sale Status" },
    ];
    for (const field of requiredFields) {
      const value = productData[field.key];
      if (!value || (typeof value === "string" && !value.trim())) {
        toast.warn(`${field.label} is required!`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/products/${productData.id}`, productData);
        toast.success("Product updated!");
      } else {
        await axios.post(`${API_BASE_URL}/products`, productData);
        toast.success("Product added!");
      }
      fetchAllData();
      setShowModal(false);
    } catch {
      toast.error("Failed to save product!");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredProducts = products.filter((p) => {
    const searchTerm = search.toLowerCase();
    return (
      p.serial_no?.toLowerCase().includes(searchTerm) ||
      p.batch?.batch?.toLowerCase().includes(searchTerm) ||
      p.category?.category?.toLowerCase().includes(searchTerm) ||
      p.manufacture_no?.toLowerCase().includes(searchTerm) ||
      p.firmware_version?.toLowerCase().includes(searchTerm) ||
      p.hsn_code?.toLowerCase().includes(searchTerm) ||
      p.test?.toLowerCase().includes(searchTerm) ||
      p.sale_status?.toLowerCase().includes(searchTerm)
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField) return 0;
    const getValue = (obj) => {
      if (sortField === "batch") return obj.batch?.batch || "";
      if (sortField === "category") return obj.category?.category || "";
      return obj[sortField] || "";
    };
    const aVal = getValue(a).toLowerCase();
    const bVal = getValue(b).toLowerCase();
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedProducts = sortedProducts.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="px-4 py-2">
      <Breadcrumb title="Products" />

      <Card className="border-0 shadow-sm rounded-3 p-3 mt-3 bg-white">
        <div className="row mb-3">
          <div className="col-md-6 d-flex align-items-center mb-2 mb-md-0">
            <label className="me-2 fw-semibold mb-0">Records Per Page:</label>
            <Form.Select
              size="sm"
              style={{ width: "100px" }}
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              {[5, 10, 25, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Form.Select>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="mt-2 d-inline-block mb-2">
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-2"
                onClick={fetchAllData}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </Button>
              <Button
                size="sm"
                onClick={handleAddNewClick}
                style={{ backgroundColor: "#2FA64F", borderColor: "#2FA64F", color: "#fff" }}
              >
                + Add Product
              </Button>
            </div>
            <Search search={search} setSearch={setSearch} perPage={perPage} setPerPage={setPerPage} setPage={setPage} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead style={{ backgroundColor: "#2E3A59", color: "white" }}>
              <tr>
                <th className="text-center" style={{ cursor: "pointer", backgroundColor: "#2E3A59",
                  color: "white", }}>S.No</th>
                {[
                  { key: "batch", label: "Batch" },
                  { key: "category", label: "Category" },
                  { key: "serial_no", label: "Serial No" },
                  { key: "manufacture_no", label: "Manufacture No" },
                  { key: "firmware_version", label: "Firmware" },
                  { key: "hsn_code", label: "HSN Code" },
                  { key: "test", label: "Test" },
                  { key: "sale_status", label: "Sale Status" }
                ].map(({ key, label }) => (
                  <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer", backgroundColor: "#2E3A59",
                  color: "white", }}>
                    {label} {sortField === key && (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                ))}
                <th className="text-center"style={{ cursor: "pointer", backgroundColor: "#2E3A59",
                  color: "white", }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" className="text-center py-4"><Spinner animation="border" /></td></tr>
              ) : paginatedProducts.length === 0 ? (
                <tr><td colSpan="10" className="text-center py-4 text-muted">
                  <img src="/empty-box.png" alt="No products" style={{ width: "80px", opacity: 0.6 }} />
                </td></tr>
              ) : (
                paginatedProducts.map((p, index) => (
                  <tr key={p.id}>
                    <td className="text-center">{(page - 1) * perPage + index + 1}</td>
                    <td>{p.batch?.batch || "—"}</td>
                    <td>{p.category?.category || "—"}</td>
                    <td>{p.serial_no}</td>
                    <td>{p.manufacture_no}</td>
                    <td>{p.firmware_version}</td>
                    <td>{p.hsn_code}</td>
                    <td>{p.test}</td>
                    <td>{p.sale_status}</td>
                    <td className="text-center">
                      <Button size="sm" variant="" onClick={() => handleEdit(p)} className="me-1" style={{ borderColor: "#2E3A59", color: "#2E3A59" }}>
                        <i className="bi bi-pencil-square"></i>
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDelete(p.id)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          setPage={setPage}
          perPage={perPage}
          totalEntries={filteredProducts.length}
        />
      </Card>

      {/* Sidebar Add/Edit */}
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
              <Form.Label>Test Status</Form.Label>
              <Form.Select name="test" value={productData.test} onChange={handleChange}>
                <option value="">Select Test Status</option>
                <option value="Ok">OK</option>
                <option value="Issue">Issue</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="col-md-6">
              <Form.Label>Sale Status</Form.Label>
              <Form.Select name="sale_status" value={productData.sale_status} onChange={handleChange} disabled={productData.test === "Issue"}>
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
