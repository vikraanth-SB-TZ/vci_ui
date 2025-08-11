import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button, Spinner, Form, Card } from "react-bootstrap";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BsDashLg } from "react-icons/bs";
import MiniCalendar from "./MiniCalendar";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { API_BASE_URL } from "../api";
import { useNavigate } from 'react-router-dom';

const AddSpareParts = () => {
    const [vendors, setVendors] = useState([]);
    const [availableSpareparts, setAvailableSpareparts] = useState([]);
    const [spareparts, setSpareparts] = useState([]);
    const [loading, setLoading] = useState(false);


    const [sparePartsRows, setSparePartsRows] = useState([{
        sparepart_id: "",
        quantity: ""
    }]);
    const navigate = useNavigate()
    const [invoiceDate, setInvoiceDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });

    const [editingPurchase, setEditingPurchase] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);

    const [formData, setFormData] = useState({
        vendor_id: "",
        invoiceNo: "",
        notes: "",
    });

    const [formErrors, setFormErrors] = useState({});
    const tableRef = useRef(null);
    const dataTableInstance = useRef(null);

    const getBlueBorderStyles = (value, isInvalid) => {
        const baseStyle = {
            fontFamily: "Product Sans, sans-serif",
            fontSize: "14px",
            border: "1px solid #ced4da",
        };
        if (isInvalid) {
            return {
                ...baseStyle,
                borderColor: "#dc3545",
                boxShadow: "0 0 0 0.25rem rgba(220, 53, 69, 0.25)",
            };
        } else if (value) {
            return baseStyle;
        }
        return baseStyle;
    };

    const fetchVendors = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/vendors`, {
                headers: {
                    Accept: "application/json"
                },
            });
            let rows = Array.isArray(data) ? data : data.data ?? [];
            setVendors(rows);
        } catch (err) {
            console.error("Error loading vendors:", err);
        }
    }, []);

    const fetchAvailableSpareparts = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/spareparts`, {
                headers: {
                    Accept: "application/json"
                },
            });

            let rows = Array.isArray(data) ? data : data.data ?? [];

            const activeSpareparts = rows.filter(
                (sparepart) => sparepart.is_active === "Enable"
            );

            setAvailableSpareparts(activeSpareparts);
        } catch (err) {
            console.error("Error loading spareparts master list:", err);
        }
    }, []);

    const fetchPurchases = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_BASE_URL}/sparepart-purchases`, {
                headers: {
                    Accept: "application/json"
                },
            });
            let rows = Array.isArray(data) ? data : data.data ?? [];
            setSpareparts(rows);
        } catch (err) {
            console.error("Error loading purchases:", err);
            toast.error("Failed to load purchases.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVendors();
        fetchAvailableSpareparts();
        fetchPurchases();
    }, [fetchVendors, fetchAvailableSpareparts, fetchPurchases]);


    const handleAddRow = () => {
        setSparePartsRows((rows) => [...rows, {
            sparepart_id: "",
            quantity: ""
        }]);
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
            copy[index] = {
                ...copy[index],
                [field]: value
            };
            return copy;
        });

        setFormErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            const row = sparePartsRows[index];

            if (field === 'sparepart_id') {
                if (!value) {
                    newErrors[`sparepart-${index}`] = "Spare part is required.";
                } else {
                    delete newErrors[`sparepart-${index}`];
                }
            }

            if (field === 'quantity') {
                const quantity = parseInt(value, 10);
                if (!value || isNaN(quantity) || quantity < 0) {
                    newErrors[`quantity-${index}`] = "Quantity must be a non-negative number.";
                } else {
                    delete newErrors[`quantity-${index}`];
                }
            }
            return newErrors;
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setFormErrors((prev) => {
            const newErrors = { ...prev };
            const errorKey = name === 'invoiceNo' ? 'invoice_no' : name;

            if (!value) {
                newErrors[errorKey] = `${name.charAt(0).toUpperCase() + name.slice(1).replace('No', ' No.')} is required.`;
            } else {
                delete newErrors[errorKey];
            }
            return newErrors;
        });
    };

    const validateForm = (payload, items) => {
        let errors = {};
        if (!payload.vendor_id) {
            errors.vendor_id = "Vendor is required.";
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
                if (
                    !item.quantity ||
                    parseInt(item.quantity, 10) < 0 ||
                    isNaN(parseInt(item.quantity, 10))
                ) {
                    errors[`quantity-${index}`] =
                        "Quantity must be a non-negative number.";
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
        const invoice_no = formData.invoiceNo?.trim();
        const notes = formData.notes || null;
        const invoice_date = invoiceDate;

        const items = sparePartsRows
            .map(row => ({
                sparepart_id: row.sparepart_id,
                quantity: parseInt(row.quantity, 10) || 0
            }))
            .filter(i => i.sparepart_id && i.quantity > 0);

        const payload = { vendor_id, invoice_no, invoice_date, notes, items };

        if (!validateForm(payload, sparePartsRows)) return;

        try {
            setLoading(true);
            const { data } = await axios.post(
                `${API_BASE_URL}/spareparts/purchase`,
                payload,
                { headers: { "Content-Type": "application/json", Accept: "application/json" } }
            );

            if (data?.success) {
                toast.success("Purchase added successfully!");
                navigate("/PurchaseSpareparts");
            } else {
                toast.error(data?.message || "Failed to add purchase.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error while adding purchase");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className={`bg-white shadow-lg purchase-form-slide`}
                style={{
                    fontFamily: "Product Sans, sans-serif",
                    fontWeight: 400,
                    padding: "30px",
                    borderLeft: "1px solid #dee2e6",
                    width: "100%",
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <h5 className="fw-bold mb-0">
                        {editingPurchase
                            ? "Edit Spare parts"
                            : "Add Spare parts"}
                    </h5>

                    <Button variant="outline-secondary" onClick={() => navigate('/PurchaseSpareparts')}>
                        <i className="bi bi-arrow-left" /> Back
                    </Button>

                </div>
                <div style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    paddingRight: "15px"
                }}>
                    <Form onSubmit={handleFormSubmit} noValidate>
                        <div className="row mb-3">
                            <div className="col-3">
                                <Form.Label
                                    className="fw-semibold mb-1"
                                    style={{ color: "#393C3AE5" }}
                                >
                                    Vendor <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    name="vendor_id"
                                    required
                                    style={{
                                        ...getBlueBorderStyles(
                                            formData.vendor_id,
                                            !!formErrors.vendor_id
                                        ),
                                    }}
                                    value={formData.vendor_id}
                                    onChange={handleInputChange}
                                    isInvalid={!!formErrors.vendor_id}
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
                                <Form.Control.Feedback type="invalid" className="d-block">
                                    {formErrors.vendor_id}
                                </Form.Control.Feedback>
                            </div>
                            <div className="col-3">
                                <Form.Label
                                    className="fw-semibold mb-1"
                                    style={{ color: "#393C3AE5" }}
                                >
                                    Invoice No. <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="invoiceNo"
                                    placeholder="Enter Invoice No."
                                    required
                                    value={formData.invoiceNo}
                                    onChange={handleInputChange}
                                    style={getBlueBorderStyles(
                                        formData.invoiceNo,
                                        !!formErrors.invoice_no
                                    )}
                                    isInvalid={!!formErrors.invoice_no}
                                />
                                <Form.Control.Feedback type="invalid" className="d-block">
                                    {formErrors.invoice_no}
                                </Form.Control.Feedback>
                            </div>
                            <div className="col-3 position-relative">
                                <Form.Label
                                    className="fw-semibold mb-1"
                                    style={{ color: "#393C3AE5" }}
                                >
                                    Invoice Date <span className="text-danger">*</span>
                                </Form.Label>

                                <div
                                    className="form-control d-flex align-items-center justify-content-between"
                                    style={{
                                        position: "relative",
                                        cursor: "pointer",
                                        ...getBlueBorderStyles(
                                            invoiceDate,
                                            !!formErrors.invoice_date
                                        ),
                                        minHeight: "34px",
                                    }}
                                    onClick={() => setShowCalendar(true)}
                                >
                                    <span>
                                        {invoiceDate
                                            ? new Date(invoiceDate + "T00:00:00").toLocaleDateString(
                                                "en-GB"
                                            )
                                            : "DD/MM/YYYY"}
                                    </span>
                                    <img
                                        src="/Calendar.png"
                                        alt="calendar icon"
                                        style={{
                                            position: "absolute",
                                            right: "10px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            width: "24px",
                                            height: "24px",
                                            pointerEvents: "none",
                                        }}
                                    />
                                </div>

                                {formErrors.invoice_date && (
                                    <div className="invalid-feedback d-block">
                                        {formErrors.invoice_date}
                                    </div>
                                )}

                                {showCalendar && (
                                    <div style={{ position: "absolute", zIndex: 10 }}>
                                        <MiniCalendar
                                            selectedDate={
                                                invoiceDate ? new Date(invoiceDate + "T00:00:00") : null
                                            }
                                            onDateChange={(date) => {
                                                const safeDate = new Date(
                                                    date.getFullYear(),
                                                    date.getMonth(),
                                                    date.getDate()
                                                );
                                                const formatted = `${safeDate.getFullYear()}-${String(
                                                    safeDate.getMonth() + 1
                                                ).padStart(2, "0")}-${String(safeDate.getDate()).padStart(
                                                    2,
                                                    "0"
                                                )}`;
                                                setInvoiceDate(formatted);
                                                setShowCalendar(false);
                                            }}
                                            onCancel={() => setShowCalendar(false)}
                                            allowFuture={false}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="row mb-3">

                        </div>
                        <div className="row">
                            <div className="mb-3 col-6">
                                <Form.Label
                                    className="fw-semibold mb-1"
                                    style={{ color: "#393C3AE5" }}
                                >
                                    Notes
                                </Form.Label>
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
                            <div className="mb-3 col-6">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="fw-semibold mb-0">
                                        Add Spare parts <span className="text-danger">*</span>
                                    </h6>
                                    <button
                                        type="button"
                                        onClick={handleAddRow}
                                        className="add-row-btn"
                                        disabled={sparePartsRows.length >= availableSpareparts.length}
                                        style={{
                                            border: "1px solid #C7E6D1",
                                            backgroundColor: "#F1FCF6",
                                            color: "#1F9254",
                                            padding: "6px 12px",
                                            fontSize: "14px",
                                            borderRadius: "6px",
                                            opacity: sparePartsRows.length >= availableSpareparts.length ? 0.6 : 1,
                                            cursor:
                                                sparePartsRows.length >= availableSpareparts.length
                                                    ? "not-allowed"
                                                    : "pointer",
                                            outline: "none",
                                            boxShadow: "none",
                                        }}
                                    >
                                        + Add Row
                                    </button>
                                </div>

                                <div
                                    style={{
                                        border: "1px solid #D3DBD5",
                                        borderRadius: "6px",
                                        overflow: "hidden",
                                        backgroundColor: "#fff",
                                    }}
                                >
                                    <table
                                        className="table mb-0"
                                        style={{
                                            tableLayout: "fixed",
                                            marginBottom: 0,
                                        }}
                                    >
                                        <thead
                                            style={{
                                                backgroundColor: "#F8F9FA",
                                            }}
                                        >
                                            <tr>
                                                <th style={{
                                                    textAlign: "left",
                                                    padding: "12px",
                                                    backgroundColor: "#F3F4F6",
                                                    borderBottom: "1px solid #D3DBD5",
                                                    fontWeight: 600,
                                                    fontSize: "15px",
                                                }}>
                                                    Sparepart Name
                                                </th>
                                                <th style={{
                                                    textAlign: "left",
                                                    padding: "12px",
                                                    backgroundColor: "#F3F4F6",
                                                    borderBottom: "1px solid #D3DBD5",
                                                    fontWeight: 600,
                                                    fontSize: "15px",
                                                }}>
                                                    Quantity
                                                </th>
                                                <th style={{
                                                    width: "40px",
                                                    padding: "12px",
                                                    backgroundColor: "#F3F4F6",
                                                    borderBottom: "1px solid #D3DBD5",
                                                }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sparePartsRows.length > 0 ? (
                                                sparePartsRows.map((row, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <Form.Select
                                                                className="shadow-none"
                                                                name={`sparepart-${index}`}
                                                                required
                                                                value={row.sparepart_id}
                                                                onChange={(e) => handleRowChange(index, "sparepart_id", e.target.value)}
                                                                isInvalid={!!formErrors[`sparepart-${index}`]}
                                                                style={{
                                                                    fontSize: "14px",
                                                                    border: "none",
                                                                    outline: "none",
                                                                    boxShadow: "none",
                                                                    backgroundColor: "transparent",
                                                                    height: "38px",
                                                                }}
                                                            >
                                                                <option value="">Select Spare part</option>
                                                                {availableSpareparts
                                                                    .filter(
                                                                        (sparepart) =>
                                                                            row.sparepart_id === String(sparepart.id) ||
                                                                            !sparePartsRows.some(
                                                                                (r, i) =>
                                                                                    i !== index &&
                                                                                    String(r.sparepart_id) === String(sparepart.id)
                                                                            )
                                                                    )
                                                                    .map((sparepart) => (
                                                                        <option key={sparepart.id} value={sparepart.id}>
                                                                            {sparepart.name}
                                                                        </option>
                                                                    ))}
                                                            </Form.Select>
                                                            <Form.Control.Feedback type="invalid" className="d-block mt-0">
                                                                {formErrors[`sparepart-${index}`]}
                                                            </Form.Control.Feedback>
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="number"
                                                                name={`quantity-${index}`}
                                                                placeholder="Enter Quantity"
                                                                required
                                                                min="1"
                                                                value={row.quantity}
                                                                onChange={(e) =>
                                                                    handleRowChange(index, "quantity", e.target.value)
                                                                }
                                                                isInvalid={!!formErrors[`quantity-${index}`]}
                                                                style={{
                                                                    fontSize: "14px",
                                                                    border: "none",
                                                                    outline: "none",
                                                                    boxShadow: "none",
                                                                    backgroundColor: "transparent",
                                                                    height: "38px",
                                                                }}
                                                            />
                                                            <Form.Control.Feedback type="invalid" className="d-block mt-0">
                                                                {formErrors[`quantity-${index}`]}
                                                            </Form.Control.Feedback>
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            <Button
                                                                variant="light"
                                                                size="sm"
                                                                onClick={() => handleRemoveRow(index)}
                                                                className="p-1"
                                                                style={{
                                                                    backgroundColor: "#FFEDED",
                                                                    borderRadius: "50%",
                                                                    width: "30px",
                                                                    height: "30px",
                                                                    padding: 0,
                                                                    lineHeight: 1,
                                                                }}
                                                            >
                                                                <BsDashLg style={{ color: "red", fontSize: "1.2rem" }} />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
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
                                variant="success"
                                type="submit"
                                style={{ width: "179px", height: "50px", borderRadius: "6px" }}
                            >
                                {editingPurchase ? "Update Purchase" : "Save"}
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </>
    )
}

export default AddSpareParts