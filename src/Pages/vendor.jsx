import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import Select from 'react-select';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import MiniCalendar from "./MiniCalendar";
import { FaRegCalendarAlt } from "react-icons/fa";
import { API_BASE_URL } from "../api";
function initialForm() {
    return {
        id: null,
        first_name: "",
        last_name: "",
        gender: "",
        mobile: "",
        altMobile: "",
        email: "",
        company_name: "",
        address: "",
        city: "",
        state: "",
        district: "",
        pincode: "",
        gst: "",
        dob: "",
    };
}

export default function Vendor() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(initialForm());
    const [isEditing, setIsEditing] = useState(false);
    const [states, setStates] = useState([]);
    const [districtsForTable, setDistrictsForTable] = useState([]);
    const [districtsForForm, setDistrictsForForm] = useState([]);
    const [errors, setErrors] = useState({});
    const [showCalendar, setShowCalendar] = useState(false);
    const toastIdRef = useRef(null); // Ref to store the toast ID

    const tableRef = useRef(null);

    // const apiBase = "http://127.0.0.1:8000/api";

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const statesRes = await axios.get(`${API_BASE_URL}/states`);
                setStates(Array.isArray(statesRes.data) ? statesRes.data : []);

                const districtsRes = await axios.get(`${API_BASE_URL}/districts`);
                setDistrictsForTable(Array.isArray(districtsRes.data) ? districtsRes.data : []);

                const vendorsRes = await axios.get(`${API_BASE_URL}/vendors`);
                setVendors(Array.isArray(vendorsRes.data.data) ? vendorsRes.data.data : vendorsRes.data);
            } catch (err) {
                console.error("Failed to load initial data:", err);
                toast.error("Failed to load data.", { autoClose: 1500 });
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        if (!loading && vendors.length > 0) {
            $(tableRef.current).DataTable({
                destroy: true,
                ordering: true,
                paging: true,
                searching: true,
                lengthChange: true,
                columnDefs: [{ targets: 0, className: "text-center" }],
            });
        }
        return () => {
            if ($.fn.DataTable.isDataTable(tableRef.current)) {
                $(tableRef.current).DataTable().destroy();
            }
        };
    }, [vendors, loading]);

    useEffect(() => {
        if (formData.state) {
            fetchDistrictsForForm(formData.state);
        } else {
            setDistrictsForForm([]);
        }
    }, [formData.state]);

    const fetchDistrictsForForm = (stateId) => {
        if (!stateId) {
            setDistrictsForForm([]);
            return;
        }

        axios.get(`${API_BASE_URL}/districts/state/${stateId}`)
            .then((res) => {
                setDistrictsForForm(Array.isArray(res.data) ? res.data : []);
            })
            .catch((err) => {
                console.error("Error fetching districts for form:", err);
                setDistrictsForForm([]);
            });
    };

    const handleChange = (e, selectName = null) => {
        let name, value;

        if (selectName) {
            name = selectName;
            value = e ? e.value : "";
            if (selectName === "state") {
                setFormData(prev => ({ ...prev, district: "" }));
            }
        } else {
            name = e.target.name;
            value = e.target.value;


            if ((name === "first_name" || name === "last_name" || name === "city")) {
                if (!/^[a-zA-Z\s]*$/.test(value)) {
                    // Show error below the field
                    setErrors(prev => ({ ...prev, [name]: "Only alphabets are allowed." }));
                    return;
                } else {

                    if (errors[name]) {
                        setErrors(prev => ({ ...prev, [name]: "" }));
                    }
                }
            }

            // ✅ Allow only digits in mobile and altMobile
            if ((name === "mobile" || name === "altMobile")) {
                if (!/^\d*$/.test(value)) {
                    setErrors(prev => ({ ...prev, [name]: "Only digits are allowed." }));
                    return;
                } else {
                    if (errors[name]) {
                        setErrors(prev => ({ ...prev, [name]: "" }));
                    }
                }
            }
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEmailBlur = () => {
        const email = formData.email.trim();

        if (!email) {
            setErrors((prev) => ({ ...prev, email: "Email is required." }));
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrors((prev) => ({ ...prev, email: "Email format is invalid." }));
        } else {
            setErrors((prev) => ({ ...prev, email: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.first_name.trim()) newErrors.first_name = "First name is required.";
        if (!formData.last_name.trim()) newErrors.last_name = "Last name is required.";
        if (!formData.email.trim()) newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email address is invalid.";
        if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required.";
        else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile number must be 10 digits.";
        if (formData.altMobile.trim() && !/^\d{10}$/.test(formData.altMobile)) newErrors.altMobile = "Alternative mobile number must be 10 digits.";
        if (!formData.gender) newErrors.gender = "Gender is required.";
        const today = new Date().toISOString().slice(0, 10);
        if (!formData.dob) newErrors.dob = "Date of Birth is required.";
        else if (formData.dob > today) {
            newErrors.dob = "Date of Birth cannot be in the future.";
        }
        if (!formData.company_name.trim()) newErrors.company_name = "Company name is required.";
        if (!formData.address.trim()) newErrors.address = "Address is required.";
        if (!formData.city.trim()) newErrors.city = "City is required.";
        if (formData.gst.trim() && !/^[0-9A-Z]{15}$/.test(formData.gst)) {
            newErrors.gst = "GST No. must be 15 alphanumeric characters.";
        }
        if (!formData.state) newErrors.state = "State is required.";
        if (!formData.district) newErrors.district = "District is required.";
        if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required.";
        else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Pincode must be 6 digits.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const payload = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            gender: formData.gender,
            mobile: formData.mobile,
            alter_mobile: formData.altMobile,
            email: formData.email,
            company_name: formData.company_name,
            address: formData.address,
            city: formData.city,
            state_id: formData.state ? parseInt(formData.state, 10) : null,
            district_id: formData.district ? parseInt(formData.district, 10) : null,
            pincode: formData.pincode,
            gst_no: formData.gst,
            date_of_birth: formData.dob,
        };

        const request = isEditing
            ? axios.put(`${API_BASE_URL}/vendors/${formData.id}`, payload)
            : axios.post(`${API_BASE_URL}/vendors`, payload);

        request
            .then((res) => {
                const newVendor = res.data?.data || payload;

                toast.success(isEditing ? "Vendor updated successfully!" : "Vendor added successfully!", {
                    autoClose: 1500,
                });

                if (isEditing) {
                    setVendors((prev) =>
                        prev.map((v) => (v.id === formData.id ? { ...v, ...newVendor } : v))
                    );
                } else {

                    setVendors((prev) => [...prev, newVendor]);
                }

                closeForm();
            })
            .catch((err) => {
                const newErrors = {};
                const { message, errors: backendErrors } = err?.response?.data || {};
                if (backendErrors) {
                    for (const key in backendErrors) {
                        newErrors[key] = Array.isArray(backendErrors[key])
                            ? backendErrors[key][0]
                            : backendErrors[key];
                        toast.error(newErrors[key], { autoClose: 1500 });
                    }
                } else {
                    toast.error(message || "Failed to save vendor.", { autoClose: 1500 });
                }
                setErrors(newErrors);
            });
    };

    const stateOptions = states.map(state => ({
        value: String(state.id),
        label: state.state,
    }));

    const districtOptions = districtsForForm.map(d => ({
        value: String(d.id),
        label: d.district,
    }));

    const genderOptions = [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Other", label: "Other" },
    ];

    const handleEdit = (vendor) => {
        setFormData({
            id: vendor.id,
            first_name: vendor.first_name || "",
            last_name: vendor.last_name || "",
            gender: vendor.gender || "",
            mobile: vendor.mobile || "",
            altMobile: vendor.alter_mobile || "",
            email: vendor.email || "",
            company_name: vendor.company_name || "",
            address: vendor.address || "",
            city: vendor.city || "",
            state: vendor.state_id ? String(vendor.state_id) : "",
            district: vendor.district_id ? String(vendor.district_id) : "",
            pincode: vendor.pincode || "",
            gst: vendor.gst_no || "",
            dob: vendor.date_of_birth || "",
        });

        setIsEditing(true);
        setShowForm(true);
        setErrors({});
    };

    const openForm = () => {
        setFormData(initialForm());
        setIsEditing(false);
        setShowForm(true);
        setErrors({});
    };

    const closeForm = () => {
        setFormData(initialForm());
        setIsEditing(false);
        setShowForm(false);
        setErrors({});
    };

    const errorStyle = {
        color: "#dc3545",
        fontSize: "13px",
        marginTop: "4px",
    };

    const getInputStyle = (fieldName) => ({
        width: "270px",
        height: "50px",
        fontFamily: "Product Sans, sans-serif",
        fontWeight: 400,
        fontSize: "16px",
        borderRadius: "4px",
        border: `1px solid ${errors[fieldName] ? "#dc3545" : "#D3DBD5"}`,
        backgroundColor: "#FFFFFF",
        color: "#212529",
    });

    const SimpleOption = ({ innerRef, innerProps, data }) => (
        <div ref={innerRef} {...innerProps} className="simple-option" style={{ padding: "10px 15px" }}>
            {data.label}
        </div>
    );

    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            width: "270px",
            height: "50px",
            minHeight: "50px",
            fontFamily: "Product Sans, sans-serif",
            fontWeight: 400,
            fontSize: "16px",
            borderRadius: "4px",
            border: `1px solid ${state.selectProps.name && state.selectProps.errors?.[state.selectProps.name]
                    ? "#dc3545"
                    : "#D3DBD5"
                }`,
            boxShadow: "none",
            "&:hover": {
                borderColor: "#D3DBD5",
            },
            display: "flex",
            alignItems: "center",
            paddingLeft: "8px",
            paddingRight: "8px",
            cursor: "pointer",
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "#212529",
        }),
        placeholder: (provided) => ({
            ...provided,
            fontFamily: "Product Sans, sans-serif",
            fontWeight: 400,
            color: "#828282",
        }),
        indicatorSeparator: () => ({
            display: "none",
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: "#000",
            transition: "transform 0.2s ease-in-out",
            transform: state.isFocused ? "rotate(180deg)" : null,
        }),
        menu: (provided) => ({
            ...provided,
            fontFamily: "Product Sans, sans-serif",
            fontWeight: 400,
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid #D3DBD5",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            marginTop: "4px",
            zIndex: 1000,
            paddingTop: "4px",
            paddingBottom: "4px",
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? "#F0F0F0" : "white",
            color: "#212529",
            padding: "12px 18px",
            margin: "2px 8px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            "&:active": {
                backgroundColor: "#E0E0E0",
            },
        }),
    };
    const labelStyle = {
        color: "#393C3AE5",
        width: "325px",
        fontFamily: "Product Sans, sans-serif",
        fontWeight: 400,
    };

    const getStateNameById = (stateId) => {
        const state = states.find(s => String(s.id) === String(stateId));
        return state ? state.state : '';
    };

    const getDistrictNameById = (districtId) => {
        const district = districtsForTable.find(d => String(d.id) === String(districtId));
        return district ? district.district : '';
    };

    return (
        <div className="vh-80 d-flex flex-column position-relative bg-light">
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white">
                <h5 className="mb-0 fw-bold">Vendors ({vendors.length})</h5>

                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        size="sm"

                        onClick={() => {
                            setLoading(true);
                            axios
                                .get(`${apiBase}/vendors`)
                                .then((res) => {
                                    const rows = Array.isArray(res.data.data) ? res.data.data : res.data;
                                    setVendors(rows);
                                    toast.success("Vendors reloaded!", {
                                        toastId: "vendors-loaded-refresh",
                                        autoClose: 1500,
                                    });
                                })
                                .catch(() => {
                                    toast.error("Failed to reload vendors.", { autoClose: 1500 });
                                })
                                .finally(() => setLoading(false));
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            <i className="bi bi-arrow-clockwise"></i>
                        )}
                    </Button>

                    <Button variant="success" size="sm" onClick={openForm} style={{
                        backgroundColor: '#2FA64F',
                        borderColor: '#2FA64F',
                        color: '#fff',

                    }}>
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
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Email</th>
                                <th>Gender</th>
                                <th>Company</th>
                                <th>Address</th>
                                <th>State</th>
                                <th>District</th>
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
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="text-center py-4 text-muted">
                                        No vendors found.
                                    </td>
                                </tr>
                            ) : (
                                vendors.map((vendor, index) => (
                                    <tr key={vendor.id}>
                                        <td style={{ textAlign: "center" }}>{index + 1}</td>
                                        <td>{`${vendor.first_name || ""} ${vendor.last_name || ""}`}</td>
                                        <td>{vendor.mobile}</td>
                                        <td>{vendor.email}</td>
                                        <td>{vendor.gender}</td>
                                        <td>{vendor.company_name}</td>
                                        <td>{vendor.address}</td>
                                        <td>{getStateNameById(vendor.state_id)}</td>
                                        <td>{getDistrictNameById(vendor.district_id)}</td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-1"
                                                onClick={() => handleEdit(vendor)}
                                            >
                                                <i className="bi bi-pencil-square me-1"></i>
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
                className={`position-fixed bg-white shadow-lg px-3 pt-2 pb-2 vendor-form-slide`}
                style={{
                    width: "600px",
                    height: "calc(100vh - 58px)",
                    top: "58px",
                    right: showForm ? "0" : "-800px",
                    transition: "right 0.4s ease-in-out",
                    overflowY: "auto",
                    overflowX: "hidden",
                    opacity: 1,
                    fontFamily: "Product Sans, sans-serif",
                    fontWeight: 400,
                    zIndex: 1050,
                }}
            >
                <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ marginBottom: "30px" }}
                >
                    <h5
                        className="mb-0 fw-bold"
                        style={{
                            fontFamily: "Product Sans, sans-serif",
                            fontWeight: 700,
                            fontSize: "25px",
                            color: "#212529",
                            lineHeight: "1",
                            letterSpacing: "0",
                        }}
                    >
                        {isEditing ? "Edit Vendor" : "Add New Vendor"}
                    </h5>
                    <button
                        onClick={closeForm}
                        style={{
                            width: "33px",
                            height: "33px",
                            backgroundColor: "#F0F0F0",
                            border: "none",
                            borderRadius: "50%",
                            fontSize: "20px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                        }}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                <h6
                    className="mb-1"
                    style={{
                        fontFamily: "Product Sans, sans-serif",
                        fontWeight: 700,
                        fontSize: "20px",
                        color: "#141414",
                        lineHeight: "1",
                        letterSpacing: "0",
                    }}
                >
                    Personal Information
                </h6>
                <hr className="mt-1 mb-2" />
                <form onSubmit={handleSubmit}>
                    <div className="row gx-4 personal-form">
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={labelStyle}>First Name</Form.Label>
                            <Form.Control
                                className="custom-placeholder"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="Enter Vendor First Name"
                                size="sm"
                                isInvalid={!!errors.first_name}
                                style={getInputStyle("first_name")}
                            />
                            <Form.Control.Feedback type="invalid" style={errorStyle}>
                                {errors.first_name}
                            </Form.Control.Feedback>
                        </div>
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={labelStyle}>Last Name</Form.Label>
                            <Form.Control
                                className="custom-placeholder"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="Enter Vendor Last Name"
                                size="sm"
                                isInvalid={!!errors.last_name}
                                style={getInputStyle("last_name")}
                            />
                            <Form.Control.Feedback type="invalid" style={errorStyle}>
                                {errors.last_name}
                            </Form.Control.Feedback>
                        </div>
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={labelStyle}>Gender</Form.Label>
                            <Select
                                name="gender"
                                value={genderOptions.find(option => option.value === formData.gender) || null}
                                onChange={(selectedOption) => handleChange(selectedOption, "gender")}
                                options={genderOptions}
                                placeholder="Select Gender"
                                isClearable={true}
                                styles={customSelectStyles}
                                components={{ Option: SimpleOption }}
                                classNamePrefix="react-select"
                                errors={errors}
                            />
                            {errors.gender && <div style={errorStyle}>{errors.gender}</div>}
                        </div>
                        {/* Date of Birth */}
                        <div className="col-6 mb-2">
                            <Form.Label
                                className="mb-1"
                                style={{
                                    color: "#393C3AE5",
                                    width: "325px",
                                    fontFamily: "Product Sans, sans-serif",
                                    fontWeight: 400,
                                }}
                            >
                                Date of Birth
                            </Form.Label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type="text"
                                    readOnly
                                    className={`form-control custom-placeholder ${errors.dob ? "is-invalid" : ""
                                        }`}
                                    value={
                                        formData.dob
                                            ? new Date(formData.dob + "T00:00:00").toLocaleDateString("en-GB")
                                            : ""
                                    }
                                    placeholder="Select Date of Birth"
                                    onClick={() => setShowCalendar((prev) => !prev)} // Toggle calendar
                                    style={{ cursor: "pointer" }}
                                />

                                {/* Calendar icon */}
                                <img
                                    src="/Calendar.png"
                                    alt="calendar icon"
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: "18px",
                                        height: "18px",
                                        pointerEvents: "none",
                                    }}
                                />

                                {/* Error */}
                                {errors.dob && <div style={errorStyle}>{errors.dob}</div>}

                                {/* Calendar dropdown */}
                                {showCalendar && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            zIndex: 2000,
                                            top: "100%",
                                            left: 0,
                                            background: "white",
                                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                            marginTop: "4px",
                                            borderRadius: "6px",
                                        }}
                                    >
                                        <MiniCalendar
                                            selectedDate={formData.dob ? new Date(formData.dob) : null}
                                            onDateChange={(date) => {
                                                if (!date) return;

                                                const normalizedDate = new Date(
                                                    date.getFullYear(),
                                                    date.getMonth(),
                                                    date.getDate()
                                                );

                                                const localDateStr =
                                                    normalizedDate.getFullYear() +
                                                    "-" +
                                                    String(normalizedDate.getMonth() + 1).padStart(2, "0") +
                                                    "-" +
                                                    String(normalizedDate.getDate()).padStart(2, "0");

                                                setFormData((prev) => ({
                                                    ...prev,
                                                    dob: localDateStr,
                                                }));

                                                setErrors((prev) => ({ ...prev, dob: "" }));
                                                setShowCalendar(false);
                                            }}
                                            onCancel={() => setShowCalendar(false)}
                                            allowFuture={false}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={labelStyle}>Mobile No.</Form.Label>
                            <Form.Control
                                className="custom-placeholder"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="Enter Mobile No."
                                size="sm"
                                isInvalid={!!errors.mobile}
                                style={getInputStyle("mobile")}
                            />
                            <Form.Control.Feedback type="invalid" style={errorStyle}>
                                {errors.mobile}
                            </Form.Control.Feedback>
                        </div>
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={labelStyle}>Alternative Mobile</Form.Label>
                            <Form.Control
                                className="custom-placeholder"
                                name="altMobile"
                                value={formData.altMobile}
                                onChange={handleChange}
                                placeholder="Enter Alternative Mobile No."
                                size="sm"
                                isInvalid={!!errors.altMobile}
                                style={getInputStyle("altMobile")}
                            />
                            <Form.Control.Feedback type="invalid" style={errorStyle}>
                                {errors.altMobile}
                            </Form.Control.Feedback>
                        </div>
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={labelStyle}>Email</Form.Label>
                            <Form.Control
                                className="custom-placeholder"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleEmailBlur}
                                placeholder="Enter Email"
                                size="sm"
                                isInvalid={!!errors.email}
                                style={getInputStyle("email")}
                            />
                            <Form.Control.Feedback type="invalid" style={errorStyle}>
                                {errors.email}
                            </Form.Control.Feedback>
                        </div>
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={labelStyle}>GST No.</Form.Label>
                            <Form.Control
                                className="custom-placeholder"
                                name="gst"
                                value={formData.gst}
                                onChange={handleChange}
                                placeholder="Enter GST No."
                                size="sm"
                                isInvalid={!!errors.gst}
                                style={getInputStyle("gst")}
                            />
                            <Form.Control.Feedback type="invalid" style={errorStyle}>
                                {errors.gst}
                            </Form.Control.Feedback>
                        </div>
                    </div>

                    <h6
                        className="mb-1 mt-4"
                        style={{
                            fontFamily: "Product Sans, sans-serif",
                            fontWeight: 700,
                            fontSize: "20px",
                            color: "#141414",
                            lineHeight: "1",
                            letterSpacing: "0",
                        }}
                    >
                        Company Address
                    </h6>
                    <hr className="mt-1 mb-2" />
                    <div className="row gx-4 address-form">
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={labelStyle}>Company Name</Form.Label>
                            <Form.Control
                                className="custom-placeholder"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                placeholder="Enter Company Name"
                                size="sm"
                                isInvalid={!!errors.company_name}
                                style={getInputStyle("company_name")}
                            />
                            <Form.Control.Feedback type="invalid" style={errorStyle}>
                                {errors.company_name}
                            </Form.Control.Feedback>
                        </div>
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={labelStyle}>Address</Form.Label>
                            <Form.Control
                                className="custom-placeholder"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter Address"
                                size="sm"
                                isInvalid={!!errors.address}
                                style={getInputStyle("address")}
                            />
                            <Form.Control.Feedback type="invalid" style={errorStyle}>
                                {errors.address}
                            </Form.Control.Feedback>
                        </div>
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={labelStyle}>City</Form.Label>
                            <Form.Control
                                className="custom-placeholder"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Enter City"
                                size="sm"
                                isInvalid={!!errors.city}
                                style={getInputStyle("city")}
                            />
                            <Form.Control.Feedback type="invalid" style={errorStyle}>
                                {errors.city}
                            </Form.Control.Feedback>
                        </div>
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={labelStyle}>State</Form.Label>
                            <Select
                                name="state"
                                value={stateOptions.find(option => option.value === formData.state) || null}
                                onChange={(selectedOption) => handleChange(selectedOption, "state")}
                                options={stateOptions}
                                placeholder="Select State"
                                isClearable={true}
                                styles={customSelectStyles}
                                components={{ Option: SimpleOption }}
                                classNamePrefix="react-select"
                                errors={errors}
                            />
                            {errors.state && <div style={errorStyle}>{errors.state}</div>}
                        </div>
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={labelStyle}>District</Form.Label>
                            <Select
                                name="district"
                                value={districtOptions.find(option => option.value === formData.district) || null}
                                onChange={(selectedOption) => handleChange(selectedOption, "district")}
                                options={districtOptions}
                                placeholder="Select District"
                                isClearable={true}
                                styles={customSelectStyles}
                                components={{ Option: SimpleOption }}
                                classNamePrefix="react-select"
                                isDisabled={!formData.state}
                                errors={errors}
                            />
                            {errors.district && <div style={errorStyle}>{errors.district}</div>}
                        </div>
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={labelStyle}>Pincode</Form.Label>
                            <Form.Control
                                className="custom-placeholder"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                placeholder="Enter Pincode"
                                size="sm"
                                isInvalid={!!errors.pincode}
                                style={getInputStyle("pincode")}
                            />
                            <Form.Control.Feedback type="invalid" style={errorStyle}>
                                {errors.pincode}
                            </Form.Control.Feedback>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end py-3 px-2">
                        <Button variant="secondary" className="me-2" onClick={closeForm}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="success" className="me-2">
                            {isEditing ? "Update Vendor" : "Add Vendor"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

