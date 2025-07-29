import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button, Spinner, Form } from "react-bootstrap";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/material_green.css";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";

const API_BASE = import.meta?.env?.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function ReturnSparepartsPage() {
  const [vendors, setVendors] = useState([]);
  const [batches, setBatches] = useState([]);
  const [availableSpareparts, setAvailableSpareparts] = useState([]);
  const [sparepartReturns, setSparepartReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sparePartsRows, setSparePartsRows] = useState([{ sparepart_id: "", quantity: "" }]);
  const [returnDate, setReturnDate] = useState(null);
  const datePickerRef = useRef();
  const [editingReturn, setEditingReturn] = useState(null);

  const [formData, setFormData] = useState({
    vendor_id: "",
    batch_id: "",
    referenceNo: "",
    notes: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const tableRef = useRef(null);

  const getBlueBorderStyles = (value, isInvalid) => {
    const baseStyle = {};
    if (isInvalid) {
      return {
        ...baseStyle,
        borderColor: '#dc3545',
        boxShadow: '0 0 0 0.25rem rgba(220, 53, 69, 0.25)',
      };
    } else if (value) {
      return {
        ...baseStyle,
        borderColor: '#ced4da',
        boxShadow: 'none',
      };
    }
    return baseStyle;
  };

  const getTableInputStyles = (value, isInvalid) => {
    const baseTableInputStyle = {
      height: "38px",
      backgroundColor: "transparent",
      paddingLeft: "0",
      border: "1px solid #ced4da",
    };
    if (isInvalid) {
      return {
        ...baseTableInputStyle,
        borderColor: '#dc3545',
        boxShadow: '0 0 0 0.25rem rgba(220, 53, 69, 0.25)',
      };
    } else if (value) {
      return {
        ...baseTableInputStyle,
        borderColor: '#ced4da',
        boxShadow: 'none',
      };
    }
    return baseTableInputStyle;
  };

  useEffect(() => {
    if (!datePickerRef.current) return;
    const fp = flatpickr(datePickerRef.current, {
      dateFormat: "d/m/Y",
      onChange: ([date]) => {
        setReturnDate(date);
        setFormErrors((prev) => ({ ...prev, return_date: "" }));
        setFormData((prev) => ({
          ...prev,
          returnDate: date ? date.toISOString().split("T")[0] : "",
        }));
      },
      disableMobile: true,
      locale: { firstDayOfWeek: 1 },
    });
    if (editingReturn && editingReturn.return_date) {
      fp.setDate(new Date(editingReturn.return_date), true);
      setReturnDate(new Date(editingReturn.return_date));
      setFormData((prev) => ({
        ...prev,
        returnDate: new Date(editingReturn.return_date).toISOString().split("T")[0],
      }));
    } else {
      fp.clear();
      setReturnDate(null);
      setFormData((prev) => ({ ...prev, returnDate: "" }));
    }
    return () => fp?.destroy();
  }, [editingReturn, showForm]);

  const fetchVendors = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/vendors`, { headers: { Accept: "application/json" } });
      let rows = Array.isArray(data) ? data : data.data ?? [];
      setVendors(rows);
    } catch (err) {
      console.error("Error loading vendors:", err);
      toast.error("Failed to load vendors.");
    }
  }, []);

  const fetchBatches = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/batches`, { headers: { Accept: "application/json" } });
      let rows = Array.isArray(data) ? data : data.batches ?? data.data ?? [];
      setBatches(rows);
    } catch (err) {
      console.error("Error loading batches:", err);
      toast.error("Failed to load batches.");
    }
  }, []);

  const fetchAvailableSpareparts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/spareparts`, { headers: { Accept: "application/json" } });
      let rows = Array.isArray(data) ? data : data.data ?? [];
      setAvailableSpareparts(rows);
    } catch (err) {
      console.error("Error loading spareparts master list:", err);
      toast.error("Failed to load available spare parts.");
    }
  }, []);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/sparepart-returns`, { headers: { Accept: "application/json" } });
      let rows = Array.isArray(data) ? data : data.data ?? [];
      setSparepartReturns(rows);
    } catch (err) {
      console.error("Error loading returns:", err);
      toast.error("Failed to load returns.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
    fetchBatches();
    fetchAvailableSpareparts();
    fetchReturns();
  }, [fetchVendors, fetchBatches, fetchAvailableSpareparts, fetchReturns]);

  useEffect(() => {
    // Destroy DataTable if exists
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }
    // Only re-init if there is data and not loading
    if (!loading && sparepartReturns.length > 0) {
      setTimeout(() => {
        $(tableRef.current).DataTable({
          ordering: true,
          paging: true,
          searching: true,
          lengthChange: true,
          columnDefs: [{ targets: 0, className: "text-center" }],
        });
      }, 0);
    }
  }, [sparepartReturns, loading]);

  const handleAddRow = () => {
    setSparePartsRows((rows) => [...rows, { sparepart_id: "", quantity: "" }]);
  };

  const handleRemoveRow = (index) => {
    setSparePartsRows((rows) => rows.filter((_, i) => i !== index));
    setFormErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[`sparepart-${index}`];
      delete newErrors[`quantity-${index}`];
      return newErrors;
    });
  };

  const handleRowChange = (index, field, value) => {
    setSparePartsRows((rows) => {
      const copy = [...rows];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    setFormErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[`${field}-${index}`];
      return newErrors;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (payload, items) => {
    let errors = {};
    if (!payload.vendor_id) {
      errors.vendor_id = "Vendor is required.";
    }
    if (!payload.batch_id) {
      errors.batch_id = "Batch is required.";
    }
    if (!payload.reference_no) {
      errors.reference_no = "Reference No. is required.";
    }
    if (!payload.return_date) {
      errors.return_date = "Return Date is required.";
    }
    if (items.length === 0) {
      errors.items = "Please add at least one spare part.";
    } else {
      items.forEach((item, index) => {
        if (!item.sparepart_id) {
          errors[`sparepart-${index}`] = "Spare part is required.";
        }
        if (!item.quantity || parseInt(item.quantity, 10) <= 0 || isNaN(parseInt(item.quantity, 10))) {
          errors[`quantity-${index}`] = "Quantity must be a positive number.";
        }
      });
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstErrorMsg = errors[Object.keys(errors)[0]];
      toast.error(firstErrorMsg || "Please correct the errors in the form.");
    }
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const vendor_id = formData.vendor_id;
    const batch_id = formData.batch_id;
    const reference_no = formData.referenceNo;
    const notes = formData.notes || null;
    const return_date = returnDate ? returnDate.toISOString().split("T")[0] : null;
    const items = sparePartsRows
      .map((row) => {
        const quantity = parseInt(row.quantity, 10) || 0;
        return { sparepart_id: row.sparepart_id, quantity };
      })
      .filter((i) => i.sparepart_id && i.quantity > 0);
    const payload = { vendor_id, batch_id, reference_no, return_date, notes, items };
    if (!validateForm(payload, sparePartsRows)) {
      return;
    }
    try {
      let data;
      if (editingReturn) {
        const resp = await axios.put(
          `${API_BASE}/api/sparepart-returns/${editingReturn.id}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        data = resp.data;
      } else {
        const resp = await axios.post(
          `${API_BASE}/api/sparepart-returns`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        data = resp.data;
      }
      if (data?.success) {
        toast.success(editingReturn ? "Return updated successfully!" : "Return added successfully!");
        setShowForm(false);
        setEditingReturn(null);
        setSparePartsRows([{ sparepart_id: "", quantity: "" }]);
        setReturnDate(null);
        if (datePickerRef.current?._flatpickr) {
          datePickerRef.current._flatpickr.clear();
        }
        setFormErrors({});
        setFormData({ vendor_id: "", batch_id: "", referenceNo: "", notes: "" });
      } else {
        toast.error(data?.message || "Failed to save return.");
      }
    } catch (error) {
      if (error.response) {
        console.error("Server responded with error:", error.response.status, error.response.data);
        toast.error(`Server error (${error.response.status}): ${error.response.data?.message ?? "See console"}`);
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from server. Check network/API base URL.");
      } else {
        console.error("Request setup error:", error.message);
        toast.error("Error preparing request. See console.");
      }
    }
  };

  const handleDelete = async (id) => {
    toast.warn(
      ({ closeToast }) => (
        <div>
          Are you sure you want to delete this return?
          <div className="d-flex justify-content-end mt-2">
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                closeToast();
                try {
                  const { data } = await axios.delete(`${API_BASE}/api/sparepart-returns/${id}`, {
                    headers: { Accept: "application/json" },
                  });
                  if (data?.success) {
                    setSparepartReturns((rows) => rows.filter((p) => p.id !== id));
                    toast.success("Return deleted successfully!");
                  } else {
                    toast.error(data?.message || "Failed to delete.");
                  }
                } catch (err) {
                  console.error("Error during delete request:", err);
                  toast.error("Error deleting return. See console.");
                }
              }}
              className="me-2"
            >
              Yes, Delete
            </Button>
            <Button variant="secondary" size="sm" onClick={closeToast}>
              Cancel
            </Button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeButton: false,
        draggable: false,
      }
    );
  };

  const customSelectStyle = {
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    backgroundSize: "16px 16px",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  };

  const handleIconClick = () => {
    datePickerRef.current?._flatpickr?.open();
  };

  const handleShowForm = (ret = null) => {
    setEditingReturn(ret);
    setFormErrors({});
    if (ret) {
      setSparePartsRows(
        ret.items.map((item) => ({
          sparepart_id: String(item.sparepart_id),
          quantity: String(item.quantity),
        }))
      );
      setReturnDate(new Date(ret.return_date));
      setFormData({
        vendor_id: String(ret.vendor_id),
        batch_id: String(ret.batch_id),
        referenceNo: ret.reference_no,
        notes: ret.notes || ""
      });
    } else {
      setSparePartsRows([{ sparepart_id: "", quantity: "" }]);
      setReturnDate(null);
      setFormData({ vendor_id: "", batch_id: "", referenceNo: "", notes: "" });
    }
    setShowForm(true);
  };

  return (
    <div className="vh-80 d-flex flex-column position-relative bg-light">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover limit={1} />
      <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white">
        <h5 className="mb-0 fw-bold">Return Spare Parts ({sparepartReturns.length})</h5>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={fetchReturns}>
            {loading ? <Spinner animation="border" size="sm" /> : <i className="bi bi-arrow-clockwise"></i>}
          </Button>
          <Button variant="success" size="sm" onClick={() => handleShowForm()}>
            + Add New
          </Button>
        </div>
      </div>
      <div className="flex-grow-1 overflow-auto px-4 py-3">
        <div className="table-responsive">
          <table ref={tableRef} className="table custom-table">
            <thead>
              <tr>
                <th style={{ textAlign: "center", width: "70px" }}>S.No</th>
                <th>Vendor Name</th>
                <th>Return Date</th>
                <th>Reference No</th>
                <th>Return ID</th>
                <th>Sparepart Name</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : sparepartReturns.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No returns found.
                  </td>
                </tr>
              ) : (
                sparepartReturns.map((ret, index) => {
                  const items = ret.items || [];
                  return (
                    <tr key={ret.id}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td>
                        {(() => {
                          const vendor = vendors.find((v) => String(v.id) === String(ret.vendor_id));
                          return vendor
                            ? `${vendor.first_name ?? ""} ${vendor.last_name ?? ""}`.trim()
                            : ret.vendor_id;
                        })()}
                      </td>
                      <td>{new Date(ret.return_date).toLocaleDateString("en-GB")}</td>
                      <td>{ret.reference_no}</td>
                      <td>{ret.id}</td>
                      <td>
                        {items.length === 0
                          ? <span className="text-muted">No items</span>
                          : (
                            <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
                              {items.map((item, idx) => {
                                const sp = availableSpareparts.find(sp => String(sp.id) === String(item.sparepart_id));
                                return (
                                  <li key={idx}>
                                    {sp ? sp.name : item.sparepart_id}
                                  </li>
                                );
                              })}
                            </ul>
                          )
                        }
                      </td>
                      <td>
                        {items.length === 0
                          ? <span className="text-muted">-</span>
                          : (
                            <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
                              {items.map((item, idx) => (
                                <li key={idx}>{item.quantity}</li>
                              ))}
                            </ul>
                          )
                        }
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleShowForm(ret)}
                        >
                          <i className="bi bi-pencil-square me-1"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(ret.id)}
                        >
                          <i className="bi bi-trash me-1"></i>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Slide Form */}
      <div
        className={`position-fixed bg-white shadow-lg purchase-form-slide`}
        style={{
          width: "600px",
          height: "100vh",
          top: "58px",
          right: showForm ? "0" : "-800px",
          transition: "right 0.4s ease-in-out",
          overflowY: "auto",
          overflowX: "hidden",
          opacity: 1,
          fontFamily: "Product Sans, sans-serif",
          fontWeight: 400,
          zIndex: 1050,
          padding: "30px",
          borderLeft: "1px solid #dee2e6"
        }}
      >
        <div className="d-flex justify-content-between align-items-start mb-4">
          <h5 className="fw-bold mb-0">{editingReturn ? "Edit Sparepart Return" : "Add New Sparepart Return"}</h5>
          <button
            onClick={() => {
              setShowForm(false);
              setEditingReturn(null);
              setFormErrors({});
              setSparePartsRows([{ sparepart_id: "", quantity: "" }]);
              setReturnDate(null);
              if (datePickerRef.current?._flatpickr) {
                datePickerRef.current._flatpickr.clear();
              }
              setFormData({ vendor_id: "", batch_id: "", referenceNo: "", notes: "" });
            }}
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#DBDBDB73",
              border: "none",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "bold",
              cursor: "pointer",
              lineHeight: "1",
              padding: 0,
            }}
          >
            &times;
          </button>
        </div>
        <Form onSubmit={handleFormSubmit} noValidate>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>Vendor <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="vendor_id"
                required
                style={{ ...customSelectStyle, ...getBlueBorderStyles(formData.vendor_id, !!formErrors.vendor_id) }}
                value={formData.vendor_id}
                onChange={handleInputChange}
                isInvalid={!!formErrors.vendor_id}
              >
                <option value="" disabled>Select Vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.first_name} {vendor.last_name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid" className="d-block">
                {formErrors.vendor_id}
              </Form.Control.Feedback>
            </div>
            <div className="col-6">
              <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>Batch <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="batch_id"
                required
                style={{ ...customSelectStyle, ...getBlueBorderStyles(formData.batch_id, !!formErrors.batch_id) }}
                value={formData.batch_id}
                onChange={handleInputChange}
                isInvalid={!!formErrors.batch_id}
              >
                <option value="" disabled>Select Batch</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batch}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid" className="d-block">
                {formErrors.batch_id}
              </Form.Control.Feedback>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>Reference No. <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="referenceNo"
                placeholder="Enter Reference No."
                required
                value={formData.referenceNo}
                onChange={handleInputChange}
                style={getBlueBorderStyles(formData.referenceNo, !!formErrors.reference_no)}
                isInvalid={!!formErrors.reference_no}
              />
              <Form.Control.Feedback type="invalid" className="d-block">
                {formErrors.reference_no}
              </Form.Control.Feedback>
            </div>
            <div className="col-6">
              <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>Return Date <span className="text-danger">*</span></Form.Label>
              <div style={{ position: "relative" }}>
                <Form.Control
                  ref={datePickerRef}
                  placeholder="DD/MM/YY"
                  required
                  style={getBlueBorderStyles(returnDate, !!formErrors.return_date)}
                  isInvalid={!!formErrors.return_date}
                />
                <img
                  src="https://placehold.co/22x27/E0E0E0/333333?text=Cal"
                  alt="calendar"
                  onClick={handleIconClick}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "22px",
                    height: "27px",
                    cursor: "pointer",
                    filter:
                      "invert(47%) sepia(9%) saturate(295%) hue-rotate(102deg) brightness(92%) contrast(91%)",
                  }}
                />
                <Form.Control.Feedback type="invalid" className="d-block mt-0">
                  {formErrors.return_date}
                </Form.Control.Feedback>
              </div>
            </div>
          </div>
          <div className="mb-3">
            <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>Notes</Form.Label>
            <Form.Control
              as="textarea"
              name="notes"
              placeholder="Enter any notes"
              rows="3"
              value={formData.notes}
              onChange={handleInputChange}
              style={getBlueBorderStyles(formData.notes, false)}
            ></Form.Control>
          </div>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-semibold mb-0">Add Spare parts <span className="text-danger">*</span></h6>
              <button
                type="button"
                onClick={handleAddRow}
                style={{
                  backgroundColor: "#278C580F",
                  color: "#278C58",
                  border: "1px solid #D5E8D4",
                  fontSize: "14px",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  boxShadow: "none",
                  cursor: "pointer",
                }}
              >
                + Add Row
              </button>
            </div>
            <div style={{ position: "relative", width: "530px" }}>
              <div className="table-responsive">
                <table
                  className="table align-middle mb-0"
                  style={{ width: "100%", border: "1px solid #D3DBD5", tableLayout: "fixed" }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#E9ECEF", height: "40px", color: "#393C3A" }}>
                      <th style={{ width: "50%", border: "1px solid #D3DBD5" }}>Sparepart Name <span className="text-danger">*</span></th>
                      <th style={{ width: "50%", border: "1px solid #D3DBD5" }}>Quantity <span className="text-danger">*</span></th>
                      <th style={{ width: "auto", border: "1px solid #D3DBD5", textAlign: "center", width: "50px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sparePartsRows.map((row, index) => (
                      <tr key={index} style={{ height: "52px" }}>
                        <td style={{ border: "1px solid #D3DBD5", padding: "0 8px" }}>
                          <Form.Select
                            className="shadow-none"
                            name={`sparepart-${index}`}
                            required
                            style={{ ...customSelectStyle, ...getTableInputStyles(row.sparepart_id, !!formErrors[`sparepart-${index}`]) }}
                            value={row.sparepart_id}
                            onChange={(e) => handleRowChange(index, "sparepart_id", e.target.value)}
                            isInvalid={!!formErrors[`sparepart-${index}`]}
                          >
                            <option value="">Select Spare part</option>
                            {availableSpareparts.map((sparepart) => (
                              <option key={sparepart.id} value={sparepart.id}>
                                {sparepart.name}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid" className="d-block mt-0">
                            {formErrors[`sparepart-${index}`]}
                          </Form.Control.Feedback>
                        </td>
                        <td style={{ border: "1px solid #D3DBD5", padding: "0 8px" }}>
                          <Form.Control
                            type="number"
                            name={`quantity-${index}`}
                            placeholder="Qty"
                            required
                            min="1"
                            value={row.quantity}
                            onChange={(e) => handleRowChange(index, "quantity", e.target.value)}
                            style={getTableInputStyles(row.quantity, !!formErrors[`quantity-${index}`])}
                            isInvalid={!!formErrors[`quantity-${index}`]}
                          />
                          <Form.Control.Feedback type="invalid" className="d-block mt-0">
                            {formErrors[`quantity-${index}`]}
                          </Form.Control.Feedback>
                        </td>
                        <td style={{ border: "1px solid #D3DBD5", textAlign: "center", width: "50px" }}>
                          {sparePartsRows.length > 1 && (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => handleRemoveRow(index)}
                              className="text-danger p-0"
                              style={{
                                backgroundColor: "#FFEBEBC9",
                                color: "#DF5555",
                                borderRadius: "50%",
                                width: "32px",
                                height: "32px",
                                fontSize: "20px",
                                lineHeight: "1",
                                textAlign: "center",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              &minus;
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {sparePartsRows.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center text-muted py-3">
                          No spare parts added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!!formErrors.items && (
                <div className="invalid-feedback d-block mt-1">{formErrors.items}</div>
              )}
            </div>
          </div>
          <div className="d-flex justify-content-end mt-4">
            <Button
              variant="light"
              className="me-2"
              onClick={() => {
                setShowForm(false);
                setEditingReturn(null);
                setFormErrors({});
                setSparePartsRows([{ sparepart_id: "", quantity: "" }]);
                setReturnDate(null);
                if (datePickerRef.current?._flatpickr) {
                  datePickerRef.current._flatpickr.clear();
                }
                setFormData({ vendor_id: "", batch_id: "", referenceNo: "", notes: "" });
              }}
            >
              Cancel
            </Button>
            <Button variant="success" type="submit" style={{ width: "179px", height: "50px", borderRadius: "6px" }}>
              {editingReturn ? "Update Return" : "Save"}
            </Button>
          </div>
        </Form>
      </div>
      <style>{`
        .purchase-form-slide {
          box-shadow: 0 0 24px rgba(0,0,0,0.08);
        }
        .custom-table th, .custom-table td {
          font-family: 'Product Sans', sans-serif;
          font-weight: 400;
          font-size: 16px;
          color: #212529;
        }
        .custom-placeholder::placeholder {
          font-family: 'Product Sans', sans-serif;
          font-weight: 400;
          color: #828282;
        }
      `}</style>
    </div>
  );
}