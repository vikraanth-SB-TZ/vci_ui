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
import Breadcrumb from "./Components/Breadcrumb";
import Pagination from "./Components/Pagination";
import Search from "./Components/Search";

export default function PurchaseSparepartsPage() {
    const [vendors, setVendors] = useState([]);
    const [batches, setBatches] = useState([]);
    const [availableSpareparts, setAvailableSpareparts] = useState([]);
    const [spareparts, setSpareparts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const MySwal = withReactContent(Swal);
    const [sortField, setSortField] = useState("asc");
    const [sortDirection, setSortDirection] = useState("desc");
    

    const [sparePartsRows, setSparePartsRows] = useState([{
        sparepart_id: "",
        quantity: ""
    }]);
    const [invoiceDate, setInvoiceDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });

    const [editingPurchase, setEditingPurchase] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState({
        vendor_id: "",
        batch_id: "",
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

    const getTableInputStyles = (value, isInvalid) => {
        const baseTableInputStyle = {
            height: "40px",
            backgroundColor: "transparent",
            padding: "0.375rem 0.75rem",
            border: "1px solid #ced4da",
            fontFamily: "Product Sans, sans-serif",
            fontSize: "14px",
            borderRadius: "0.25rem",
            width: "100%",
        };
        if (isInvalid) {
            return {
                ...baseTableInputStyle,
                borderColor: "#dc3545",
                boxShadow: "0 0 0 0.25rem rgba(220, 53, 69, 0.25)",
            };
        } else if (value) {
            return {
                ...baseTableInputStyle,
                boxShadow: "0 0 0 0.25rem rgba(39, 140, 88, 0.25)",
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
        paddingRight: "2.5rem",
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

    const fetchBatches = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/batches`, {
                headers: {
                    Accept: "application/json"
                },
            });
            let rows = Array.isArray(data) ? data : data.batches ?? data.data ?? [];
            setBatches(rows);
        } catch (err) {
            console.error("Error loading batches:", err);
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
        fetchBatches();
        fetchAvailableSpareparts();
        fetchPurchases();
    }, [fetchVendors, fetchBatches, fetchAvailableSpareparts, fetchPurchases]);


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

    const handleDateChange = (e) => {
        const { value } = e.target;
        setInvoiceDate(value);
        setFormErrors((prev) => ({
            ...prev,
            invoice_date: ""
        }));
    };

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
        const batch_id = formData.batch_id;
        const invoice_no = formData.invoiceNo;
        const notes = formData.notes || null;
        const invoice_date = invoiceDate;

        const items = sparePartsRows
            .map((row) => {
                const quantity = parseInt(row.quantity, 10);
                return {
                    sparepart_id: row.sparepart_id,
                    quantity: isNaN(quantity) ? 0 : quantity,
                };
            })
            .filter((i) => i.sparepart_id && i.quantity > 0);

        const payload = {
            vendor_id,
            batch_id,
            invoice_no,
            invoice_date,
            notes,
            items,
        };

        if (!validateForm(payload, sparePartsRows)) {
            return;
        }

        try {
            setLoading(true);
            let data;
            if (editingPurchase) {
                const resp = await axios.put(
                    `${API_BASE_URL}/sparepart-purchases/${editingPurchase.id}`,
                    payload, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
                );
                data = resp.data;
                if (data?.success) {
                    toast.success("Purchase updated successfully!");
                    setSpareparts((prev) =>
                        prev.map((p) =>
                            p.id === editingPurchase.id ?
                                {
                                    ...p,
                                    ...payload,
                                    items: items
                                } :
                                p
                        )
                    );
                } else {
                    toast.error(data?.message || "Failed to update purchase.");
                }
            } else {
                const resp = await axios.post(
                    `${API_BASE_URL}/spareparts/purchase`,
                    payload, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
                );
                data = resp.data;
                if (data?.success && data.data?.id) {
                    const newEntry = {
                        ...payload,
                        id: data.data.id,
                        items,
                        created_at: data.data.created_at,
                        updated_at: data.data.updated_at,
                    };

                    if (dataTableInstance.current) {
                        dataTableInstance.current.destroy();
                        dataTableInstance.current = null;
                    }

                    const updatedSpareparts = [...spareparts, newEntry];
                    setSpareparts(updatedSpareparts);

                    setTimeout(() => {
                        if (updatedSpareparts.length && tableRef.current) {
                            dataTableInstance.current = $(tableRef.current).DataTable({
                                ordering: true,
                                paging: true,
                                searching: true,
                                lengthChange: true,
                                columnDefs: [{
                                    targets: 0,
                                    className: "text-center"
                                }],
                            });
                        }
                    }, 0);

                    toast.success("Purchase added successfully!");
                } else {
                    toast.error(data?.message || "Failed to add purchase.");
                }
            }

            setShowForm(false);
            setEditingPurchase(null);
            setSparePartsRows([{
                sparepart_id: "",
                quantity: ""
            }]);
            setInvoiceDate(new Date().toISOString().split("T")[0]);
            setFormErrors({});
            setFormData({
                vendor_id: "",
                batch_id: "",
                invoiceNo: "",
                notes: ""
            });
        } catch (error) {
            if (error.response) {
                console.error(
                    "Server responded with error:",
                    error.response.status,
                    error.response.data
                );
                toast.error(
                    `Server error (${error.response.status}): ${error.response.data?.message ?? "Please check form data"
                    }`
                );
            } else if (error.request) {
                console.error("No response received:", error.request);
                toast.error("No response ");
            } else {
                console.error("Request setup error:", error.message);
                toast.error("An error occurred before sending the request");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await MySwal.fire({
            title: "Are you sure?",
            text: "Do you really want to delete this purchase?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;

        try {
            if (dataTableInstance.current) {
                dataTableInstance.current.destroy();
                dataTableInstance.current = null;
            }

            const { data } = await axios.delete(`${API_BASE_URL}/sparepart-purchases/${id}`, {
                headers: {
                    Accept: "application/json"
                },
            });

            if (data?.success) {
                const updatedSpareparts = spareparts.filter((p) => String(p.id) !== String(id));

                if (dataTableInstance.current) {
                    dataTableInstance.current.destroy();
                    dataTableInstance.current = null;
                }

                setSpareparts(updatedSpareparts);

                setTimeout(() => {
                    if (updatedSpareparts.length && tableRef.current) {
                        dataTableInstance.current = $(tableRef.current).DataTable({
                            ordering: true,
                            paging: true,
                            searching: true,
                            lengthChange: true,
                            columnDefs: [{
                                targets: 0,
                                className: "text-center"
                            }],
                        });
                    }
                }, 0);

                toast.success("Purchase deleted successfully!");
            } else {
                toast.error(data?.message || "Failed to delete.");
            }
        } catch (err) {
            console.error("Delete Error:", err);
            toast.error("Failed to delete purchase. Check logs.");
        }
    };

    const handleShowForm = (purchase = null) => {
        setEditingPurchase(purchase);
        setFormErrors({});
        if (purchase) {
            setSparePartsRows(
                purchase.items && purchase.items.length > 0 ?
                    purchase.items.map((item) => ({
                        sparepart_id: String(item.sparepart_id),
                        quantity: String(item.quantity),
                    })) :
                    [{
                        sparepart_id: "",
                        quantity: ""
                    }]
            );
            setInvoiceDate(purchase.invoice_date);
            setFormData({
                vendor_id: String(purchase.vendor_id),
                batch_id: String(purchase.batch_id),
                invoiceNo: purchase.invoice_no,
                notes: purchase.notes || "",
            });
        } else {
            setSparePartsRows([{
                sparepart_id: "",
                quantity: ""
            }]);
            setInvoiceDate(new Date().toISOString().split("T")[0]);
            setFormData({
                vendor_id: "",
                batch_id: "",
                invoiceNo: "",
                notes: ""
            });
        }
        setShowForm(true);
    };

    const getVendorNameById = (id) => {
        const vendor = vendors.find((v) => String(v.id) === String(id));
        return vendor ?
            `${vendor.first_name ?? ""} ${vendor.last_name ?? ""}`.trim() :
            `ID: ${id}`;
    };

    const getBatchNameById = (id) => {
        const batch = batches.find((b) => String(b.id) === String(id));
        return batch ? batch.batch : `ID: ${id}`;
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const filteredSpareparts = spareparts.filter((purchase) =>
        getVendorNameById(purchase.vendor_id).toLowerCase().includes(search.toLowerCase()) ||
        purchase.invoice_no.toLowerCase().includes(search.toLowerCase())
    );

    const sortedSpareparts = [...filteredSpareparts].sort((a, b) => {
        if (!sortField) return 0;

        let valA, valB;

        if (sortField === "vendor_name") {
            valA = getVendorNameById(a.vendor_id).toLowerCase();
            valB = getVendorNameById(b.vendor_id).toLowerCase();
        } else {
            valA = a[sortField];
            valB = b[sortField];
        }

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    const paginatedSpareparts = sortedSpareparts.slice(
        (page - 1) * perPage,
        page * perPage
    );


    return (
        <div className="px-4 py-2">
            <Breadcrumb title="Purchase Spare Parts" />

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
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </Form.Select>
                    </div>

                    <div className="col-md-6 text-md-end">
                        <div className="mt-2 d-inline-block mb-2">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                                onClick={fetchPurchases}
                            >
                                {loading ? (
                                    <Spinner animation="border" size="sm" />
                                ) : (
                                    <i className="bi bi-arrow-clockwise"></i>
                                )}
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleShowForm()}
                                style={{
                                    backgroundColor: '#2FA64F',
                                    borderColor: '#2FA64F',
                                    color: '#fff'
                                }}
                            >
                                + Add New
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
                    <table ref={tableRef} className="table align-middle mb-0">
                        <thead style={{ backgroundColor: "#2E3A59", color: "white" }}>
                            <tr>
                                <th style={{
                                    width: "70px", textAlign: "center", backgroundColor: "#2E3A59",
                                    color: "white",
                                }}>S.No</th>
                                <th
                                    onClick={() => handleSort("vendor_name")}
                                    style={{ cursor: "pointer", backgroundColor: "#2E3A59", color: "white" }}
                                >
                                    Vendor Name {sortField === "vendor_name" && (sortDirection === "asc" ? "▲" : "▼")}
                                </th>
                                <th
                                    onClick={() => handleSort("invoice_date")}
                                    style={{ cursor: "pointer", backgroundColor: "#2E3A59", color: "white" }}
                                >
                                    Invoice Date {sortField === "invoice_date" && (sortDirection === "asc" ? "▲" : "▼")}
                                </th>
                                <th
                                    onClick={() => handleSort("invoice_no")}
                                    style={{ cursor: "pointer", backgroundColor: "#2E3A59", color: "white" }}
                                >
                                    Invoice No {sortField === "invoice_no" && (sortDirection === "asc" ? "▲" : "▼")}
                                </th>
                                <th style={{
                                    backgroundColor: "#2E3A59",
                                    color: "white",
                                }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">
                                        <Spinner animation="border" />
                                    </td>
                                </tr>
                            ) : paginatedSpareparts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">
                                        <img
                                            src="/empty-box.png"
                                            alt="No purchases found"
                                            style={{ width: "80px", height: "100px", opacity: 0.6 }}
                                        />
                                    </td>
                                </tr>
                            ) : (
                                paginatedSpareparts.map((purchase, index) => (
                                    <tr key={purchase.id}>
                                        <td className="text-center">
                                            {(page - 1) * perPage + index + 1}
                                        </td>
                                        <td>{getVendorNameById(purchase.vendor_id)}</td>
                                        <td>{new Date(purchase.invoice_date).toLocaleDateString("en-GB")}</td>
                                        <td>{purchase.invoice_no}</td>
                                        <td>
                                            <Button
                                                variant=""
                                                size="sm"
                                                className="me-1"
                                                onClick={() => handleShowForm(purchase)}
                                                style={{
                                                    borderColor: '#2E3A59',
                                                    color: '#2E3A59'
                                                }}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </Button>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleDelete(purchase.id)}
                                                style={{
                                                    borderColor: '#2E3A59',
                                                    color: '#2E3A59',
                                                    backgroundColor: 'transparent'
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

                <div className="">
                    <Pagination
                        page={page}
                        setPage={setPage}
                        perPage={perPage}
                        totalEntries={filteredSpareparts.length}
                    />
                </div>
            </Card>

            <div
                className={`position-fixed bg-white shadow-lg purchase-form-slide`}
                style={{
                    width: "600px",
                    height: "100vh",
                    top: "61px",
                    right: showForm ? "0" : "-800px",
                    transition: "right 0.4s ease-in-out",
                    overflowY: "auto",
                    overflowX: "hidden",
                    opacity: 1,
                    fontFamily: "Product Sans, sans-serif",
                    fontWeight: 400,
                    zIndex: 1050,
                    padding: "30px",
                    borderLeft: "1px solid #dee2e6",
                }}
            >
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <h5 className="fw-bold mb-0">
                        {editingPurchase
                            ? "Edit Purchase Spare parts"
                            : "Add New Purchase Spare parts"}
                    </h5>
                    <button
                        onClick={() => {
                            setShowForm(false);
                            setEditingPurchase(null);
                            setFormErrors({});
                            setSparePartsRows([{ sparepart_id: "", quantity: "" }]);
                            setInvoiceDate(new Date().toISOString().split("T")[0]);
                            setFormData({
                                vendor_id: "",
                                batch_id: "",
                                invoiceNo: "",
                                notes: "",
                            });
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
                <div style={{ maxHeight: "calc(100vh - 150px)", overflowY: "auto", paddingRight: '15px' }}>
                    <Form onSubmit={handleFormSubmit} noValidate>
                        <div className="row mb-3">
                            <div className="col-6">
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
                                        ...customSelectStyle,
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
                            <div className="col-6">
                                <Form.Label
                                    className="fw-semibold mb-1"
                                    style={{ color: "#393C3AE5" }}
                                >
                                    Batch <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    name="batch_id"
                                    required
                                    style={{
                                        ...customSelectStyle,
                                        ...getBlueBorderStyles(
                                            formData.batch_id,
                                            !!formErrors.batch_id
                                        ),
                                    }}
                                    value={formData.batch_id}
                                    onChange={handleInputChange}
                                    isInvalid={!!formErrors.batch_id}
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
                                <Form.Control.Feedback type="invalid" className="d-block">
                                    {formErrors.batch_id}
                                </Form.Control.Feedback>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-6">
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
                            <div className="col-6 position-relative">
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
                        <div className="mb-3">
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
                        <div className="mb-3">
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
        </div>
    );
}
