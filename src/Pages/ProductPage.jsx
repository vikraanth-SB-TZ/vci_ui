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
import Select from "react-select";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [pcbSerialOptions, setPcbSerialOptions] = useState([]);

  const [productData, setProductData] = useState({
    id: null,
    category_id: "",
    serial_no: "",
    fromserial_no: "",
    toserial_no: "",
    manufacture_no: "",
    firmware_version: "",
    hsn_code: "",
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
      ]);
      setProducts(pRes.data || []);
      setCategories(cRes.data || []);
    } catch {
      toast.error("Failed to fetch data!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPcbSerialNumbers();
  }, []);

  const fetchPcbSerialNumbers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/pcb-board-purchase-items`, {
        params: { exclude_status: "Reserved" } // optional filter
      });

      const formattedOptions = res.data.map(item => ({
        value: item.serial_no,
        label: item.serial_no
      }));

      setPcbSerialOptions(formattedOptions);
    } catch (err) {
      toast.error("Failed to fetch PCB serial numbers!");
    }
  };

  const handleAddNewClick = () => {
    setIsEditing(false);
    setProductData({
      id: null,
      category_id: "",
      serial_no: "",
      manufacture_no: "",
      fromserial_no: "",
      toserial_no: "",
      firmware_version: "",
      hsn_code: "",
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
     confirmButtonColor: "#d33",
      cancelButtonColor: "#2FA64F",
    confirmButtonText: "Yes, delete it!",
    customClass: {
      popup: "custom-compact" // ✅ only once
    }
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

    if (name === "test") {
      if (value === "Issue") {
        updatedData.sale_status = "Reserved";
      } else if (productData.test === "Issue" && value === "Ok") {
        updatedData.sale_status = "";
      }
    }

    setProductData(updatedData);
  };

  const validateForm = () => {
    const requiredFields = [
      { key: "category_id", label: "Category" },
      { key: "manufacture_no", label: "Manufacture Number" },
      { key: "firmware_version", label: "Firmware Version" },
      { key: "hsn_code", label: "HSN Code" },
      { key: "test", label: "Test Status" },
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

    if (!isEditing) {
      const serial = (productData.serial_no || "").trim();
      const fromS = (productData.fromserial_no || "").trim();
      const toS = (productData.toserial_no || "").trim();

      const singleFilled = !!serial;
      const anyRangeFilled = !!fromS || !!toS;
      const fullRangeFilled = !!fromS && !!toS;

      if (singleFilled && anyRangeFilled) {
        toast.error("Please provide either Single Serial No OR From & To Serial, not both.");
        return;
      }

      if (!singleFilled && !fullRangeFilled) {
        toast.error("Please provide Single Serial No OR both From & To Serial.");
        return;
      }

      if (!singleFilled && anyRangeFilled && !fullRangeFilled) {
        toast.error("Please select both From Serial and To Serial.");
        return;
      }
    }

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/products/${productData.id}`, productData);
        toast.success("Product updated!");
      } else {
        await axios.post(`${API_BASE_URL}/products`, productData);
        toast.success("Product added!");
      }

      setShowModal(false);
      fetchAllData();
    } catch (err) {
      toast.error(`${err.response.data.message}`);
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
    <div className="px-4" style={{ fontSize: "0.75rem" }}>
      <Breadcrumb title="Products" />

      <Card className="border-0 shadow-sm rounded-3 p-2 px-4 mt-2 bg-white">
        <div className="row mb-2">
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
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Form.Select>
          </div>
          <div className="col-md-6 text-md-end" style={{ fontSize: '0.8rem' }}>
            <div className="mt-2 d-inline-block mb-2" style={{ fontSize: '0.8rem' }}>
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-2"
                onClick={fetchAllData}
                style={{ fontSize: "0.8rem", minWidth: "32px", height: "28px" }}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </Button>
              <Button
                size="sm"
                onClick={handleAddNewClick}
                style={{
                  backgroundColor: '#2FA64F',
                  borderColor: '#2FA64F',
                  color: '#fff',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.8rem',
                  minWidth: '90px',
                  height: '28px',
                }}
                className="btn-success text-white"
              >
                + Add Product
              </Button>
            </div>
            <Search
              search={search}
              setSearch={setSearch}
              perPage={perPage}
              setPerPage={setPerPage}
              setPage={setPage}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0" style={{ fontSize: "0.85rem" }}>
            <thead
              style={{
                backgroundColor: "#2E3A59",
                color: "white",
                fontSize: "0.82rem",
                height: "40px",
                verticalAlign: "middle",
              }}
            >
              <tr>
                <th
                  style={{
                    width: "70px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: "#2E3A59",
                    color: "white",
                    padding: "6px 8px",
                    verticalAlign: "middle",
                  }}
                >
                  S.No
                </th>
                {[
                  { key: "category", label: "Category" },
                  { key: "serial_no", label: "Serial No" },
                  { key: "manufacture_no", label: "Manufacture No" },
                  { key: "firmware_version", label: "Firmware" },
                  { key: "hsn_code", label: "HSN Code" },
                  { key: "test", label: "Test" },
                  { key: "sale_status", label: "Sale Status" },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: "#2E3A59",
                      color: "white",
                      padding: "6px 8px",
                      verticalAlign: "middle",
                    }}
                  >
                    {label} {sortField === key && (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                ))}
                <th
                  style={{
                    width: "130px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: "#2E3A59",
                    color: "white",
                    padding: "6px 8px",
                    verticalAlign: "middle",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-3" style={{ fontSize: "0.85rem" }}>
                    <Spinner animation="border" size="sm" />
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-3 text-muted" style={{ fontSize: "0.85rem" }}>
                    <img src="/empty-box.png" alt="No products" style={{ width: "60px", opacity: 0.6 }} />
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p, index) => (
                  <tr key={p.id} style={{ height: "36px" }}>
                    <td className="text-center" style={{ padding: "6px 8px", verticalAlign: "middle" }}>
                      {(page - 1) * perPage + index + 1}
                    </td>
                    {/* <td style={{ padding: "6px 8px", verticalAlign: "middle" }}>{p.batch?.batch || "—"}</td> */}
                    <td style={{ padding: "6px 8px", verticalAlign: "middle" }}>{p.category?.category || "—"}</td>
                    <td style={{ padding: "6px 8px", verticalAlign: "middle" }}>{p.serial_no}</td>
                    <td style={{ padding: "6px 8px", verticalAlign: "middle" }}>{p.manufacture_no}</td>
                    <td style={{ padding: "6px 8px", verticalAlign: "middle" }}>{p.firmware_version}</td>
                    <td style={{ padding: "6px 8px", verticalAlign: "middle" }}>{p.hsn_code}</td>
                    <td style={{ padding: "6px 8px", verticalAlign: "middle" }}>{p.test}</td>
                    <td style={{ padding: "6px 8px", verticalAlign: "middle" }}>{p.sale_status}</td>
                    <td className="text-center" style={{ padding: "6px 8px", verticalAlign: "middle" }}>
                      <Button
                        size="sm"
                        variant=""
                        onClick={() => handleEdit(p)}
                        className="me-1"
                        style={{
                          borderColor: "#2E3A59",
                          color: "#2E3A59",
                          padding: "3px 6px",
                          fontSize: "0.8rem",
                        }}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDelete(p.id)}
                        style={{
                          borderColor: "#2E3A59",
                          color: "#2E3A59",
                          backgroundColor: "transparent",
                          padding: "3px 6px",
                          fontSize: "0.8rem",
                        }}
                      >
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

      {/* Offcanvas Sidebar for Add/Edit */}
      <Offcanvas
        show={showModal}
        onHide={() => setShowModal(false)}
        placement="end"
        backdrop="static"
        className="custom-offcanvas "
        style={{ fontSize: "0.85rem" }}
      >
        <Offcanvas.Header className="border-bottom">
            <Offcanvas.Title className="fw-semibold">
            {isEditing ? "Edit Product" : "Add Product"}
            </Offcanvas.Title>
                <div className="ms-auto">
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowModal(false)}
                        className="rounded-circle border-0 d-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px" }}
                    >
                        <i className="bi bi-x-lg fs-6"></i>
                    </Button>
                </div>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form className="row g-3">
            <Form.Group className="col-md-6">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category_id"
                value={productData.category_id}
                onChange={handleChange}
                size="sm"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="col-md-6">
              <Form.Label>Single Serial No.</Form.Label>
              <Select
                options={pcbSerialOptions}
                value={
                  pcbSerialOptions.find(opt => opt.value === productData.serial_no) || null
                }
                onChange={(selected) => {
                  setProductData({
                    ...productData,
                    serial_no: selected ? selected.value : ""
                  });
                }}
                isClearable
                isSearchable
                placeholder="Select Serial No."
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "31px",
                    fontSize: "0.8rem"
                  }),
                  menu: (base) => ({
                    ...base,
                    fontSize: "0.8rem"
                  })
                }}
              />
            </Form.Group>
            {!isEditing &&
              <>
                <Form.Group className="col-md-6">
                  <Form.Label>From Serial Number</Form.Label>
                  <Select
                    options={pcbSerialOptions}
                    value={pcbSerialOptions.find(opt => opt.value === productData.fromserial_no) || null}
                    onChange={(selected) => {
                      setProductData(prev => ({
                        ...prev,
                        fromserial_no: selected ? selected.value : ""
                      }));
                    }}
                    isClearable
                    isSearchable
                    placeholder="Select From Serial"
                    styles={{
                      control: (base) => ({ ...base, minHeight: "31px", fontSize: "0.8rem" }),
                      menu: (base) => ({ ...base, fontSize: "0.8rem" }),
                    }}
                  />
                </Form.Group>

                <Form.Group className="col-md-6">
                  <Form.Label>To Serial Number</Form.Label>
                  <Select
                    options={pcbSerialOptions}
                    value={pcbSerialOptions.find(opt => opt.value === productData.toserial_no) || null}
                    onChange={(selected) => {
                      setProductData(prev => ({
                        ...prev,
                        toserial_no: selected ? selected.value : ""
                      }));
                    }}
                    isClearable
                    isSearchable
                    placeholder="Select To Serial"
                    styles={{
                      control: (base) => ({ ...base, minHeight: "31px", fontSize: "0.8rem" }),
                      menu: (base) => ({ ...base, fontSize: "0.8rem" }),
                    }}
                  />
                </Form.Group>
                {/* <Form.Group className="col-md-6">
                  <Form.Label>From Serial Number</Form.Label>
                  <Form.Control size="sm" name="fromserial_no" value={productData.fromserial_no} onChange={handleChange} placeholder="Enter From Serial No." />
                </Form.Group>
                <Form.Group className="col-md-6">
                  <Form.Label>To Serial Number</Form.Label>
                  <Form.Control size="sm" name="toserial_no" value={productData.toserial_no} onChange={handleChange} placeholder="Enter To Serial No." />
                </Form.Group> */}
              </>
            }
            <Form.Group className="col-md-6">
              <Form.Label>Manufacture No.</Form.Label>
              <Form.Control
                name="manufacture_no"
                value={productData.manufacture_no}
                onChange={handleChange}
                placeholder="Enter Manufacture No."
                size="sm"
              />
            </Form.Group>
            <Form.Group className="col-md-6">
              <Form.Label>Firmware Version</Form.Label>
              <Form.Control
                name="firmware_version"
                value={productData.firmware_version}
                onChange={handleChange}
                placeholder="Enter Firmware Version"
                size="sm"
              />
            </Form.Group>
            <Form.Group className="col-md-6">
              <Form.Label>HSN Code</Form.Label>
              <Form.Control
                name="hsn_code"
                value={productData.hsn_code}
                onChange={handleChange}
                placeholder="Enter HSN Code"
                size="sm"
              />
            </Form.Group>
            <Form.Group className="col-md-6">
              <Form.Label>Test Status</Form.Label>
              <Form.Select
                name="test"
                value={productData.test}
                onChange={handleChange}
                size="sm"
              >
                <option value="">Select Test Status</option>
                <option value="Ok">OK</option>
                <option value="Issue">Issue</option>
              </Form.Select>
            </Form.Group>
          </Form>
       <div className="d-flex justify-content-end gap-2 mt-3">
                   <Button  className="btn-common btn-cancel" variant="light"   onClick={() => setShowModal(false)}>
                     Cancel
                   </Button>
            <Button variant="success" className="btn-common btn-save" onClick={handleSave} size="sm">
              {isEditing ? "Update" : "Save"}
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
