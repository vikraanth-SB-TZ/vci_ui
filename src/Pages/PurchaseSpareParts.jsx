import { useState, useRef, useEffect, useCallback } from "react";
import { Button, Spinner, Form, ToastContainer, Toast } from "react-bootstrap";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/material_green.css";
import axios from "axios"; // <-- make sure axios is installed

const API_BASE = import.meta?.env?.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function PurchaseSparepartsPage() {
  const [vendors, setVendors] = useState([]); 
  const [batches, setBatches] = useState([]); 
  const [availableSpareparts, setAvailableSpareparts] = useState([]);
  const [spareparts, setSpareparts] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sparePartsRows, setSparePartsRows] = useState([{ sparepart_id: "", quantity: "" }]);
  const [invoiceDate, setInvoiceDate] = useState(null);
  const datePickerRef = useRef();
  const [editingPurchase, setEditingPurchase] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default items per page

  // Form error states
  const [formErrors, setFormErrors] = useState({});

  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success"); // 'success' or 'danger'

  /* ------------------------------------------------------------------ */
  /* Flatpickr init                                                     */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!datePickerRef.current) return;
    const fp = flatpickr(datePickerRef.current, {
      defaultDate: editingPurchase ? new Date(editingPurchase.invoice_date) : null,
      dateFormat: "d/m/Y",
      onChange: ([date]) => setInvoiceDate(date),
      disableMobile: true,
      locale: { firstDayOfWeek: 1 },
    });

    // Set initial date if editing
    if (editingPurchase && datePickerRef.current) {
      fp.setDate(new Date(editingPurchase.invoice_date), true);
    }
    return () => fp?.destroy();
  }, [editingPurchase]); // Re-initialize flatpickr when editingPurchase changes

  /* ------------------------------------------------------------------ */
  /* Toast Helper                                                       */
  /* ------------------------------------------------------------------ */
  const showCustomToast = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  /* ------------------------------------------------------------------ */
  /* Data fetch helpers                                                 */
  /* ------------------------------------------------------------------ */
  const fetchVendors = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/vendors`, { headers: { Accept: "application/json" } });
      let rows = Array.isArray(data) ? data : data.data ?? [];
      setVendors(rows);
    } catch (err) {
      console.error("Error loading vendors:", err);
      showCustomToast("Failed to load vendors.", "danger");
    }
  }, []);

  const fetchBatches = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/batches`, { headers: { Accept: "application/json" } });
      let rows = Array.isArray(data) ? data : data.batches ?? data.data ?? [];
      setBatches(rows);
    } catch (err) {
      console.error("Error loading batches:", err);
      showCustomToast("Failed to load batches.", "danger");
    }
  }, []);

  const fetchAvailableSpareparts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/spareparts`, { headers: { Accept: "application/json" } });
      let rows = Array.isArray(data) ? data : data.data ?? [];
      setAvailableSpareparts(rows);
    } catch (err) {
      console.error("Error loading spareparts master list:", err);
      showCustomToast("Failed to load available spare parts.", "danger");
    }
  }, []);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/sparepart-purchases`, { headers: { Accept: "application/json" } });
      let rows = Array.isArray(data) ? data : data.data ?? [];
      setSpareparts(rows);
    } catch (err) {
      console.error("Error loading purchases:", err);
      showCustomToast("Failed to load purchases.", "danger");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* Initial load                                                       */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    fetchVendors();
    fetchBatches();
    fetchAvailableSpareparts();
    fetchPurchases();
  }, [fetchVendors, fetchBatches, fetchAvailableSpareparts, fetchPurchases]);

  /* ------------------------------------------------------------------ */
  /* Form row management                                                */
  /* ------------------------------------------------------------------ */
  const handleAddRow = () => {
    setSparePartsRows((rows) => [...rows, { sparepart_id: "", quantity: "" }]);
  };

  const handleRemoveRow = (index) => {
    setSparePartsRows((rows) => rows.filter((_, i) => i !== index));
    // Also remove any related errors
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
    // Clear error for this specific field when it changes
    setFormErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[`${field}-${index}`];
      return newErrors;
    });
  };

  /* ------------------------------------------------------------------ */
  /* Form Validation                                                    */
  /* ------------------------------------------------------------------ */
  const validateForm = (payload, items) => {
    let errors = {};
    if (!payload.vendor_id) {
      errors.vendor_id = "Vendor is required.";
    }
    if (!payload.batch_id) {
      errors.batch_id = "Batch is required.";
    }
    if (!payload.invoice_no) {
      errors.invoice_no = "Invoice No. is required.";
    }
    if (!payload.invoice_date) {
      errors.invoice_date = "Invoice Date is required.";
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
    return Object.keys(errors).length === 0;
  };

  /* ------------------------------------------------------------------ */
  /* Submit                                                             */
  /* ------------------------------------------------------------------ */
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const vendor_id = form.get("vendor_id");
    const batch_id = form.get("batch_id");
    const invoice_no = form.get("invoiceNo");
    const notes = form.get("notes") || null;

    const invoice_date = invoiceDate ? invoiceDate.toISOString().split("T")[0] : null;

    // Build items from controlled state (safer than re-reading form)
    const items = sparePartsRows
      .map((row) => {
        const quantity = parseInt(row.quantity, 10) || 0;
        return { sparepart_id: row.sparepart_id, quantity };
      })
      .filter((i) => i.sparepart_id && i.quantity > 0);

    const payload = { vendor_id, batch_id, invoice_no, invoice_date, notes, items };

    if (!validateForm(payload, sparePartsRows)) { // Pass sparePartsRows directly for item validation
      showCustomToast("Please correct the errors in the form.", "danger");
      return;
    }

    try {
      const { data } = editingPurchase
        ? await axios.put(
            `${API_BASE}/api/sparepart-purchases/${editingPurchase.id}`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          )
        : await axios.post(
            `${API_BASE}/api/spareparts/purchase`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );

      if (data?.success) {
        showCustomToast(editingPurchase ? "Purchase updated successfully!" : "Purchase added successfully!");
        setShowForm(false);
        setEditingPurchase(null); // Clear editing state
        fetchPurchases();
        // reset form rows
        setSparePartsRows([{ sparepart_id: "", quantity: "" }]);
        // reset invoice date in UI
        if (datePickerRef.current?._flatpickr) {
          datePickerRef.current._flatpickr.clear();
        }
        setInvoiceDate(null);
        setFormErrors({}); // Clear errors on success
      } else {
        showCustomToast(data?.message || "Failed to save purchase.", "danger");
      }
    } catch (error) {
      // Axios error diagnostics
      if (error.response) {
        console.error("Server responded with error:", error.response.status, error.response.data);
        showCustomToast(`Server error (${error.response.status}): ${error.response.data?.message ?? "See console"}`, "danger");
      } else if (error.request) {
        console.error("No response received:", error.request);
        showCustomToast("No response from server. Check network/API base URL.", "danger");
      } else {
        console.error("Request setup error:", error.message);
        showCustomToast("Error preparing request. See console.", "danger");
      }
    }
  };

  /* ------------------------------------------------------------------ */
  /* Delete purchase                                                    */
  /* ------------------------------------------------------------------ */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purchase?")) return;
    try {
      const { data } = await axios.delete(`${API_BASE}/api/sparepart-purchases/${id}`, {
        headers: { Accept: "application/json" },
      });
      if (data?.success) {
        setSpareparts((rows) => rows.filter((p) => p.id !== id));
        showCustomToast("Purchase deleted successfully!");
      } else {
        showCustomToast(data?.message || "Failed to delete.", "danger");
      }
    } catch (err) {
      console.error("Error during delete request:", err);
      showCustomToast("Error deleting purchase. See console.", "danger");
    }
  };

  /* ------------------------------------------------------------------ */
  /* Pagination Logic                                                   */
  /* ------------------------------------------------------------------ */
  const totalPurchases = spareparts.length;
  const totalPages = Math.ceil(totalPurchases / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentPurchases = spareparts.slice(startIndex, startIndex + pageSize);

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page on size change
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */
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

  const handleShowForm = (purchase = null) => {
    setEditingPurchase(purchase);
    setFormErrors({}); // Clear errors when opening form
    if (purchase) {
      setSparePartsRows(
        purchase.items.map((item) => ({
          sparepart_id: String(item.sparepart_id), // Ensure it's a string for select value
          quantity: String(item.quantity), // Ensure it's a string for input value
        }))
      );
      // Set the invoice date for flatpickr
      const date = new Date(purchase.invoice_date);
      setInvoiceDate(date);
      if (datePickerRef.current?._flatpickr) {
        datePickerRef.current._flatpickr.setDate(date, true);
      }
    } else {
      // Reset form for new entry
      setSparePartsRows([{ sparepart_id: "", quantity: "" }]);
      setInvoiceDate(null);
      if (datePickerRef.current?._flatpickr) {
        datePickerRef.current._flatpickr.clear();
      }
    }
    setShowForm(true);
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="d-flex flex-column h-100" style={{ height: "100vh" }}>
      {/* Toast Container */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1060 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Header>
            <strong className="me-auto">{toastVariant === "success" ? "Success" : "Error"}</strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === "success" ? "text-white" : "text-white"}>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Header */}
      <section className="px-4 py-3 border-bottom bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">
          Purchase Spare Parts <span className="text-muted fw-normal">({totalPurchases})</span>
        </h5>
        <div>
          <Button variant="light" className="me-2" onClick={fetchPurchases}>
            {loading ? <Spinner animation="border" size="sm" /> : <i className="bi bi-arrow-clockwise"></i>}
          </Button>
          <Button variant="success" onClick={() => handleShowForm()}>
            <i className="bi bi-plus-lg me-1"></i> Add New
          </Button>
        </div>
      </section>

      {/* Table Header */}
      <div className="d-flex flex-column position-relative" style={{ height: "89vh", overflow: "hidden" }}>
        <div
          className="d-flex px-4 align-items-center"
          style={{
            backgroundColor: "#f2f2f2",
            height: "60px",
            fontWeight: 700,
            color: "#393C3A",
            fontFamily: "Product Sans, sans-serif",
            borderBottom: "1px solid #ccc",
            fontSize: "18px",
          }}
        >
          <div style={{ width: "80px" }}>S.No</div>
          <div style={{ flex: 2 }}>Vendor Name</div>
          <div style={{ flex: 2 }}>Invoice Date</div>
          <div style={{ flex: 2 }}>Invoice No</div>
          <div style={{ flex: 2 }}>Purchase ID</div>
          <div style={{ flex: 2 }}>Action</div>
        </div>

        <div className="flex-grow-1 overflow-auto bg-light">
          {loading ? (
            <div className="text-center mt-4">
              <Spinner animation="border" />
            </div>
          ) : spareparts.length === 0 ? (
            <div
              className="d-flex flex-column justify-content-center align-items-center"
              style={{ height: "calc(80vh - 160px)", width: "100%" }}
            >
              <img src="/empty-box.png" alt="Empty" style={{ width: "160px" }} />
              <p className="mt-3 text-muted">No purchases found.</p>
            </div>
          ) : (
            currentPurchases.map((purchase, index) => (
              <div
                key={purchase.id}
                className="px-4 py-2 border-bottom d-flex bg-white align-items-center small"
              >
                {/* Index */}
                <div style={{ width: "80px" }}>{startIndex + index + 1}</div>

                {/* Vendor Name */}
                <div style={{ flex: 2 }}>
                  {(() => {
                    const vendor = vendors.find((v) => String(v.id) === String(purchase.vendor_id));
                    return vendor
                      ? `${vendor.first_name ?? ""} ${vendor.last_name ?? ""}`.trim()
                      : purchase.vendor_id;
                  })()}
                </div>

                {/* Invoice Date */}
                <div style={{ flex: 2 }}>
                  {new Date(purchase.invoice_date).toLocaleDateString("en-GB")}
                </div>

                {/* Invoice No */}
                <div style={{ flex: 2 }}>{purchase.invoice_no}</div>

                {/* Purchase ID */}
                <div style={{ flex: 2 }}>{purchase.id}</div>

                {/* Action Buttons */}
                <div style={{ flex: 2 }}>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-1"
                    onClick={() => {
                      handleShowForm(purchase);
                    }}
                  >
                    <i className="bi bi-pencil-square me-1"></i>
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(purchase.id)}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && spareparts.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-3 px-4 pb-4">
            <Form.Select
              className="form-select form-select-sm pagination-select"
              onChange={handlePageSizeChange}
              value={pageSize}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="15">15 per page</option>
              <option value="20">20 per page</option>
            </Form.Select>

            <div className="pagination-controls-group">
              <Button
                variant="link"
                className="pagination-arrow-btn"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <i className="bi bi-chevron-left"></i>
              </Button>
              <span className="pagination-info-text">
                {totalPurchases === 0
                  ? "0-0"
                  : `${startIndex + 1}-${Math.min(
                      startIndex + pageSize,
                      totalPurchases
                    )}`} of {totalPurchases}
              </span>
              <Button
                variant="link"
                className="pagination-arrow-btn"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPurchases === 0}
              >
                <i className="bi bi-chevron-right"></i>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Slide Form */}
      <div
        style={{
          position: "fixed",
          top: "78px",
          right: showForm ? "0" : "-600px",
          width: "100%",
          maxWidth: "600px",
          height: "100%",
          backgroundColor: "#fff",
          boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
          zIndex: 1050,
          padding: "30px",
          overflowY: "auto",
          borderLeft: "1px solid #dee2e6",
          transition: "right 0.4s ease-in-out",
        }}
      >
        <div className="d-flex justify-content-between align-items-start mb-4">
          <h5 className="mb-4 fw-semibold">
            {editingPurchase ? "Edit Spare Part Purchase" : "Add Spare Part Purchase"}
          </h5>
          <button
            onClick={() => {
              setShowForm(false);
              setEditingPurchase(null); // Clear editing state on close
              setFormErrors({}); // Clear errors on close
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

        <Form onSubmit={handleFormSubmit}>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Group controlId="vendor_id">
                <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>
                  Vendor
                </Form.Label>
                <Form.Select
                  name="vendor_id"
                  required
                  style={customSelectStyle}
                  defaultValue={editingPurchase?.vendor_id || ""} // Set default value for editing
                  isInvalid={!!formErrors.vendor_id}
                  onChange={(e) => setFormErrors((prev) => ({ ...prev, vendor_id: "" }))} // Clear error on change
                >
                  <option value="" disabled>
                    Select Vendor
                  </option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.first_name} {vendor.last_name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formErrors.vendor_id}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-6">
              <Form.Group controlId="batch_id">
                <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>
                  Batch
                </Form.Label>
                <Form.Select
                  name="batch_id"
                  required
                  style={customSelectStyle}
                  defaultValue={editingPurchase?.batch_id || ""} // Set default value for editing
                  isInvalid={!!formErrors.batch_id}
                  onChange={(e) => setFormErrors((prev) => ({ ...prev, batch_id: "" }))} // Clear error on change
                >
                  <option value="" disabled>
                    Select Batch
                  </option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batch}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formErrors.batch_id}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-6">
              <Form.Group controlId="invoiceNo">
                <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>
                  Invoice No.
                </Form.Label>
                <Form.Control
                  type="text"
                  name="invoiceNo"
                  placeholder="Enter Invoice No."
                  required
                  defaultValue={editingPurchase?.invoice_no || ""} // Set default value for editing
                  isInvalid={!!formErrors.invoice_no}
                  onChange={(e) => setFormErrors((prev) => ({ ...prev, invoice_no: "" }))} // Clear error on change
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.invoice_no}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-6">
              <Form.Group controlId="invoiceDate">
                <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>
                  Invoice Date
                </Form.Label>
                <div style={{ position: "relative" }}>
                  <Form.Control
                    ref={datePickerRef}
                    placeholder="DD/MM/YY"
                    required
                    isInvalid={!!formErrors.invoice_date}
                    // Flatpickr's onChange handles setting state, no need for another onChange here
                  />
                  <img
                    src="/calendar-icon.png"
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
                  <Form.Control.Feedback type="invalid" className="mt-0">
                    {formErrors.invoice_date}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </div>
          </div>

          <div className="mb-3">
            <Form.Group controlId="notes">
              <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>
                Notes
              </Form.Label>
              <Form.Control
                as="textarea"
                name="notes"
                placeholder="Enter any notes"
                rows="3"
                defaultValue={editingPurchase?.notes || ""}
              ></Form.Control>
            </Form.Group>
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-semibold mb-0">Add Spare parts</h6>
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
                      <th style={{ width: "50%", border: "1px solid #D3DBD5" }}>Sparepart Name</th>
                      <th style={{ width: "50%", border: "1px solid #D3DBD5" }}>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sparePartsRows.map((row, index) => (
                      <tr key={index} style={{ height: "52px" }}>
                        <td style={{ border: "1px solid #D3DBD5", padding: "0 8px" }}>
                          <Form.Select
                            className="border-0 shadow-none"
                            name={`sparepart-${index}`}
                            required
                            style={{ height: "38px", backgroundColor: "transparent", paddingLeft: "0", ...customSelectStyle }}
                            value={row.sparepart_id}
                            onChange={(e) => handleRowChange(index, "sparepart_id", e.target.value)}
                            isInvalid={!!formErrors[`sparepart-${index}`]}
                          >
                            <option value="">Select Spare part</option>
                            {availableSpareparts.map((part) => (
                              <option key={part.id} value={part.id}>
                                {part.name}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid" className="mt-0">
                            {formErrors[`sparepart-${index}`]}
                          </Form.Control.Feedback>
                        </td>
                        <td style={{ border: "1px solid #D3DBD5", padding: "0 8px" }}>
                          <Form.Control
                            type="number"
                            min="1"
                            className="border-0 shadow-none"
                            name={`quantity-${index}`}
                            placeholder="Enter Quantity"
                            required
                            style={{ height: "38px", backgroundColor: "transparent", paddingLeft: "0" }}
                            value={row.quantity}
                            onChange={(e) => handleRowChange(index, "quantity", e.target.value)}
                            isInvalid={!!formErrors[`quantity-${index}`]}
                          />
                          <Form.Control.Feedback type="invalid" className="mt-0">
                            {formErrors[`quantity-${index}`]}
                          </Form.Control.Feedback>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sparePartsRows.map((_, index) => (
                <div key={index} style={{ position: "absolute", top: 40 + index * 52 + 6 + "px", right: "-40px" }}>
                  <button
                    type="button"
                    className="btn p-0 border-0"
                    onClick={() => handleRemoveRow(index)}
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
                      justifyContent: "center",
                    }}
                  >
                    &minus;
                  </button>
                </div>
              ))}
              {/* General error message for spare parts rows */}
              {formErrors.items && (
                <div className="text-danger mt-2 small">{formErrors.items}</div>
              )}
            </div>
          </div>

          {showForm && (
            <div style={{ position: "absolute", bottom: "80px", right: "30px", zIndex: 1000 }}>
              <Button type="submit" className="w-100 btn btn-success">
                {editingPurchase ? "Update Purchase" : "Save Purchase"}
              </Button>
            </div>
          )}
        </Form>
      </div>

      <style>{`
        .custom-dropdown {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: none;
          padding-right: 2.5rem;
          position: relative;
          background-color: #fff;
          font-family: 'Product Sans', sans-serif;
          font-weight: 400;
          border: 1px solid #ced4da;
          border-radius: 0.25rem;
          /* Add custom ▼ arrow */
          background-image: url("data:image/svg+xml;utf8,<svg fill='black' height='10' viewBox='0 0 24 24' width='10' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 10px;
        }

        /* Pagination styles */
        .pagination-select {
          width: 150px;
          border-radius: 4px;
          border: 1px solid #D3DBD5;
          height: 40px;
          font-family: 'Product Sans', sans-serif;
          font-weight: 400;
          font-size: 16px;
          color: #212529;
        }

        .pagination-controls-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pagination-arrow-btn {
          color: #007bff;
          font-size: 20px;
          text-decoration: none;
          padding: 5px;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .pagination-arrow-btn:hover:not(:disabled) {
          background-color: #e9ecef;
          color: #0056b3;
        }

        .pagination-arrow-btn:disabled {
          color: #ced4da;
          cursor: not-allowed;
        }

        .pagination-info-text {
          font-family: 'Product Sans', sans-serif;
          font-weight: 400;
          font-size: 16px;
          color: #212529;
        }
      `}</style>
    </div>
  );
}