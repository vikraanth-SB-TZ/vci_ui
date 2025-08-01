import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button, Spinner, Form } from "react-bootstrap";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";

const API_BASE = "http://127.0.0.1:8000";

export default function ReturnSparePartsPage() {
    const [vendors, setVendors] = useState([]);
    const [batches, setBatches] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [availableSpareparts, setAvailableSpareparts] = useState([]);
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [sparePartsRows, setSparePartsRows] = useState([{ sparepart_id: "", quantity: "" }]);
    const [returnDate, setReturnDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });
    const dateInputRef = useRef();
    const [editingReturn, setEditingReturn] = useState(null);

    const [formData, setFormData] = useState({
        vendor_id: "",
        invoiceNo: "",
        notes: ""
    });

    const [formErrors, setFormErrors] = useState({});
    const tableRef = useRef(null);
    const dataTableInstance = useRef(null);

    const getBlueBorderStyles = (value, isInvalid) => {
        const baseStyle = {
            fontFamily: 'Product Sans, sans-serif',
            fontSize: '14px',
            border: '1px solid #ced4da',
        };
        if (isInvalid) {
            return {
                ...baseStyle,
                borderColor: '#dc3545',
                boxShadow: '0 0 0 0.25rem rgba(220, 53, 69, 0.25)',
            };
        } else if (value) {
            return baseStyle;
        }
        return baseStyle;
    };

    const getTableInputStyles = (value, isInvalid) => {
        const baseTableInputStyle = {
            height: "40px",
            backgroundColor: "transparent",
            padding: "0.375rem 0.75rem",
            border: "1px solid #ced4da",
            fontFamily: 'Product Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '0.25rem',
            width: '100%',
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
                boxShadow: '0 0 0 0.25rem rgba(39, 140, 88, 0.25)',
            };
        }
        return baseTableInputStyle;
    };

    const customSelectStyle = {
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
        backgroundSize: "16px 16px",
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236c757d' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
        paddingRight: '2.5rem',
    };

    const fetchVendors = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_BASE}/api/vendors`, { headers: { Accept: "application/json" } });
            let rows = Array.isArray(data) ? data : data.data ?? [];
            setVendors(rows);
        } catch (err) {
            console.error("Error loading vendors:", err);
        }
    }, []);

    const fetchBatches = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_BASE}/api/batches`, { headers: { Accept: "application/json" } });
            let rows = Array.isArray(data) ? data : data.batches ?? data.data ?? [];
            setBatches(rows);
        } catch (err) {
            console.error("Error loading batches:", err);
        }
    }, []);

    const fetchPurchases = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_BASE}/api/sparepart-purchases`, { headers: { Accept: "application/json" } });
            let rows = Array.isArray(data) ? data : data.data ?? [];
            setPurchases(rows);
        } catch (err) {
            console.error("Error loading purchases:", err);
        }
    }, []);

    const fetchAvailableSpareparts = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_BASE}/api/spareparts`, { headers: { Accept: "application/json" } });
            let rows = Array.isArray(data) ? data : data.data ?? [];
            setAvailableSpareparts(rows);
        } catch (err) {
            console.error("Error loading spareparts master list:", err);
        }
    }, []);

    const fetchReturns = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_BASE}/api/sparepart-returns`, { headers: { Accept: "application/json" } });
            let rows = Array.isArray(data) ? data : data.data ?? [];
            setReturns(rows);
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
        fetchPurchases();
    }, [fetchVendors, fetchBatches, fetchAvailableSpareparts, fetchReturns, fetchPurchases]);

    useEffect(() => {
        if (dataTableInstance.current) {
            dataTableInstance.current.destroy();
            dataTableInstance.current = null;
        }

        if (!loading && returns.length > 0 && tableRef.current) {
            dataTableInstance.current = $(tableRef.current).DataTable({
                ordering: true,
                paging: true,
                searching: true,
                lengthChange: true,
                columnDefs: [{ targets: 0, className: "text-center" }],
            });
        }
    }, [returns, loading]);


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

    const handleReturnDateChange = (e) => {
        const { value } = e.target;
        setReturnDate(value);
        setFormErrors((prev) => ({ ...prev, return_date: "" }));
    };

    const validateForm = (payload, items) => {
        let errors = {};
        if (!payload.vendor_id) {
            errors.vendor_id = "Vendor is required.";
        }
        if (!payload.invoice_no) {
            errors.invoice_no = "Invoice No. is required.";
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
                if (!item.quantity || parseInt(item.quantity, 10) < 1 || isNaN(parseInt(item.quantity, 10))) {
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

        const items = sparePartsRows
            .map((row) => ({
                sparepart_id: row.sparepart_id,
                quantity: parseInt(row.quantity, 10),
            }))
            .filter((i) => i.sparepart_id && i.quantity > 0);

        const payload = {
            vendor_id: formData.vendor_id,
            invoice_no: formData.invoiceNo,
            return_date: returnDate,
            notes: formData.notes || null,
            items: items,
        };

        if (!validateForm(payload, sparePartsRows)) {
            return;
        }

        try {
            setLoading(true);
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
                if (data?.success || data?.message) {
                    toast.success("Return updated successfully!");
                    fetchReturns();
                } else {
                    toast.error(data?.message || "Failed to update return.");
                }
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
                if (data?.success || data?.message) {
                    toast.success("Return added successfully!");
                    fetchReturns();
                } else {
                    toast.error(data?.message || "Failed to add return.");
                }
            }

            setShowForm(false);
            setEditingReturn(null);
            setSparePartsRows([{ sparepart_id: "", quantity: "" }]);
            setReturnDate(new Date().toISOString().split("T")[0]);
            setFormErrors({});
            setFormData({ vendor_id: "", invoiceNo: "", notes: "" });

        } catch (error) {
            if (error.response) {
                console.error("Server responded with error:", error.response.status, error.response.data);
                toast.error(`Server error (${error.response.status}): ${error.response.data?.message ?? "Please check form data or server logs."}`);
            } else if (error.request) {
                console.error("No response received:", error.request);
                toast.error("No response from server");
            } else {
                console.error("Request setup error:", error.message);
                toast.error("An error occurred before sending the request");
            }
        } finally {
            setLoading(false);
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
                                    if (data?.success || data?.message) {
                                        setReturns((rows) => rows.filter((p) => String(p.id) !== String(id)));
                                        toast.success("Return deleted successfully!");
                                    } else {
                                        toast.error(data?.message || "Failed to delete.");
                                    }
                                } catch (err) {
                                    console.error("Error during delete request:", err);
                                    toast.error("Error deleting return. Please see console.");
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

    const handleShowForm = (returnedItem = null) => {
        setEditingReturn(returnedItem);
        setFormErrors({});
        if (returnedItem) {
            setSparePartsRows(
                returnedItem.items && returnedItem.items.length > 0
                    ? returnedItem.items.map((item) => ({
                        sparepart_id: String(item.sparepart_id),
                        quantity: String(item.quantity),
                    }))
                    : [{ sparepart_id: "", quantity: "" }]
            );
            setReturnDate(returnedItem.return_date);
            setFormData({
                vendor_id: String(returnedItem.vendor_id),
                invoiceNo: returnedItem.invoice_no,
                notes: returnedItem.notes || ""
            });
        } else {
            setSparePartsRows([{ sparepart_id: "", quantity: "" }]);
            setReturnDate(new Date().toISOString().split("T")[0]);
            setFormData({ vendor_id: "", invoiceNo: "", notes: "" });
        }
        setShowForm(true);
    };

    return (
        <div className="vh-80 d-flex flex-column position-relative bg-light">
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white">
                <h5 className="mb-0 fw-bold">Return Spare Parts ({returns.length})</h5>
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
                                <th>Invoice No</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && returns.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">
                                        <Spinner animation="border" />
                                    </td>
                                </tr>
                            ) : returns.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">
                                        No returns found.
                                    </td>
                                </tr>
                            ) : (
                                returns.map((returned, index) => (
                                    <tr key={returned.id}>
                                        <td style={{ textAlign: "center" }}>{index + 1}</td>
                                        <td>
                                            {(() => {
                                                const vendor = vendors.find((v) => String(v.id) === String(returned.vendor_id));
                                                return vendor
                                                    ? `${vendor.first_name ?? ""} ${vendor.last_name ?? ""}`.trim()
                                                    : `ID: ${returned.vendor_id}`;
                                            })()}
                                        </td>
                                        <td>{new Date(returned.return_date).toLocaleDateString("en-GB")}</td>
                                        <td>{returned.invoice_no}</td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-1"
                                                onClick={() => handleShowForm(returned)}
                                            >
                                                <i className="bi bi-pencil-square me-1"></i>
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDelete(returned.id)}
                                            >
                                                <i className="bi bi-trash me-1"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
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
                    <h5 className="fw-bold mb-0">{editingReturn ? "Edit Spare part Return" : "Add New Spare part Return"}</h5>
                    <button
                        onClick={() => {
                            setShowForm(false);
                            setEditingReturn(null);
                            setFormErrors({});
                            setSparePartsRows([{ sparepart_id: "", quantity: "" }]);
                            setReturnDate(new Date().toISOString().split("T")[0]);
                            setFormData({ vendor_id: "", invoiceNo: "", notes: "" });
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
                            <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>Return Date <span className="text-danger">*</span></Form.Label>
                            <div style={{ position: "relative" }}>
                                <Form.Control
                                    type="date"
                                    name="return_date"
                                    placeholder="YYYY-MM-DD"
                                    value={returnDate || ""}
                                    onChange={handleReturnDateChange}
                                    style={getBlueBorderStyles(returnDate, !!formErrors.return_date)}
                                    isInvalid={!!formErrors.return_date}
                                    max={new Date().toISOString().split("T")[0]}
                                    required
                                />
                                <Form.Control.Feedback type="invalid" className="d-block">
                                    {formErrors.return_date}
                                </Form.Control.Feedback>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-6">
                            <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>Purchase Invoice No. <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                                name="invoiceNo"
                                required
                                value={formData.invoiceNo}
                                onChange={handleInputChange}
                                style={{ ...customSelectStyle, ...getBlueBorderStyles(formData.invoiceNo, !!formErrors.invoice_no) }}
                                isInvalid={!!formErrors.invoice_no}
                            >
                                <option value="" disabled>Select Invoice No.</option>
                                {purchases.map(purchase => (
                                    <option key={purchase.id} value={purchase.invoice_no}>
                                        {purchase.invoice_no}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid" className="d-block">
                                {formErrors.invoice_no}
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
                        <div className="col-12">
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
                                            <th style={{ border: "1px solid #D3DBD5", padding: "0 8px" }}>Spare Part Name</th>
                                            <th style={{ border: "1px solid #D3DBD5", padding: "0 8px" }}>Quantity</th>
                                            <th style={{ width: "50px", border: "1px solid #D3DBD5", textAlign: "center" }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sparePartsRows.length > 0 ? (
                                            sparePartsRows.map((row, index) => (
                                                <tr key={index} style={{ height: "52px" }}>
                                                    <td style={{ border: "1px solid #D3DBD5", padding: "4px 8px" }}>
                                                        <Form.Select
                                                            className="shadow-none"
                                                            name={`sparepart-${index}`}
                                                            required
                                                            value={row.sparepart_id}
                                                            onChange={(e) => handleRowChange(index, "sparepart_id", e.target.value)}
                                                            isInvalid={!!formErrors[`sparepart-${index}`]}
                                                            style={{
                                                                ...customSelectStyle,
                                                                ...getTableInputStyles(row.sparepart_id, !!formErrors[`sparepart-${index}`])
                                                            }}
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
                                                    <td style={{ border: "1px solid #D3DBD5", padding: "4px 8px" }}>
                                                        <Form.Control
                                                            type="number"
                                                            name={`quantity-${index}`}
                                                            required
                                                            value={row.quantity}
                                                            onChange={(e) => handleRowChange(index, "quantity", e.target.value)}
                                                            isInvalid={!!formErrors[`quantity-${index}`]}
                                                            style={getTableInputStyles(row.quantity, !!formErrors[`quantity-${index}`])}
                                                        />
                                                        <Form.Control.Feedback type="invalid" className="d-block mt-0">
                                                            {formErrors[`quantity-${index}`]}
                                                        </Form.Control.Feedback>
                                                    </td>
<td style={{ border: "1px solid #D3DBD5", textAlign: "center" }}>
    {sparePartsRows.length > 1 && (
        <Button
            variant="danger"
            size="sm"
            onClick={() => handleRemoveRow(index)}
            style={{ height: "40px", width: "40px", padding: 0 }}
        >
            <i className="bi bi-dash"></i> {/* change made here */}
        </Button>
    )}
</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="text-center text-muted py-3" style={{ border: "1px solid #D3DBD5" }}>
                                                    No spare parts added.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="success"
                            type="submit"
                            disabled={loading}
                            style={{
                                backgroundColor: "#278C58",
                                border: "none",
                                borderRadius: "4px",
                                padding: "10px 20px",
                                fontSize: "16px",
                            }}
                        >
                            {loading ? <Spinner animation="border" size="sm" /> : editingReturn ? "Update Return" : "Add Return"}
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
}