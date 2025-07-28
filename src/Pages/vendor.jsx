import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";

export default function Vendor() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(initialForm());
    const [isEditing, setIsEditing] = useState(false);
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [errors, setErrors] = useState({});
    const tableRef = useRef(null);

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
    useEffect(() => {
        if (localStorage.getItem("vendor_refresh") === "true") {
            fetchVendors();
            localStorage.removeItem("vendor_refresh");
        }
    }, []);
    useEffect(() => {
        fetchVendors();
        fetchStates();
        fetchDistricts();
    }, []);

    useEffect(() => {
        if ($.fn.DataTable.isDataTable(tableRef.current)) {
            $(tableRef.current).DataTable().destroy();
        }
        if (!loading && vendors.length > 0) {
            $(tableRef.current).DataTable({
                ordering: true,
                paging: true,
                searching: true,
                lengthChange: true,
                columnDefs: [{ targets: 0, className: "text-center" }],
            });
        }
    }, [vendors, loading]);

    const fetchVendors = () => {
        setLoading(true);
        axios
            .get("/api/vendors")
            .then((res) => {
                setVendors(res.data.data || res.data);
            })
            // .catch(() => {
            //     toast.error("Failed to fetch vendors.", { autoClose: 3000 });
            // })
            .finally(() => {
                setLoading(false);
            });
    };

    const fetchStates = () => {
        axios.get("/api/states")
            .then((res) => setStates(res.data))
            // .catch(() => toast.error("Failed to fetch states.", { autoClose: 3000 }));
    };

    const fetchDistricts = () => {
        axios.get("/api/districts")
            .then((res) => setDistricts(res.data))
            // .catch(() => toast.error("Failed to fetch districts.", { autoClose: 3000 }));
    };

    const handleChange = (e, selectName = null) => {
        let name, value;
        if (selectName) {
            name = selectName;
            value = e ? e.value : "";
        } else {
            name = e.target.name;
            value = e.target.value;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.first_name.trim()) newErrors.first_name = "First name is required.";
        if (!formData.last_name.trim()) newErrors.last_name = "Last name is required.";
        if (!formData.email.trim()) newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email address is invalid.";
        if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required.";
        if (!formData.gender) newErrors.gender = "Gender is required.";
        if (!formData.dob) newErrors.dob = "Date of Birth is required.";
        if (!formData.company_name.trim()) newErrors.company_name = "Company name is required.";
        if (!formData.address.trim()) newErrors.address = "Address is required.";
        if (!formData.city.trim()) newErrors.city = "City is required.";
        if (!formData.state) newErrors.state = "State is required.";
        if (!formData.district) newErrors.district = "District is required.";
        if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please fill in all required fields correctly.", { autoClose: 3000 });
            return;
        }
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
            state_id: formData.state,
            district_id: formData.district,
            pincode: formData.pincode,
            gst_no: formData.gst,
            date_of_birth: formData.dob,
        };
        const request = isEditing
            ? axios.put(`/api/vendors/${formData.id}`, payload)
            : axios.post("/api/vendors", payload);

        request
            .then(() => {
                localStorage.setItem("vendor_refresh", "true");
                window.location.reload();
            })
            .catch((err) => {
                if (err.response && err.response.data) {
                    const { message, errors: backendErrors } = err.response.data;
                    let newErrors = {};
                    if (backendErrors) {
                        Object.keys(backendErrors).forEach(field => {
                            const fieldErrors = backendErrors[field];
                            if (Array.isArray(fieldErrors)) {
                                newErrors[field] = fieldErrors[0];
                                toast.error(fieldErrors[0], { autoClose: 3000 });
                            } else {
                                newErrors[field] = fieldErrors;
                                toast.error(fieldErrors, { autoClose: 3000 });
                            }
                        });
                    } else if (message) {
                        toast.error(`Failed to save vendor: ${message}`, { autoClose: 3000 });
                    } else {
                        toast.error("Failed to save vendor. Please try again.", { autoClose: 3000 });
                    }
                    setErrors(newErrors);
                } else {
                    toast.error("Failed to save vendor. Please check your network connection.", { autoClose: 3000 });
                }
            });
    };

    // --- FIXED: always use String for .value and for formData.state/formData.district ---
    const stateOptions = states.map(state => ({
        value: String(state.id),
        label: state.states || state.name,
    }));

    const districtOptions = districts.map(district => ({
        value: String(district.id),
        label: district.districts || district.name,
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
            // Make sure these are always strings:
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

    const SimpleOption = ({ innerProps, label }) => (
        <div {...innerProps} className="simple-option">
            {label}
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
            border: `1px solid ${state.selectProps.name && errors[state.selectProps.name] ? "#dc3545" : "#D3DBD5"}`,
            boxShadow: "none",
            "&:hover": {
                borderColor: "#D3DBD5",
            },
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '8px',
            paddingRight: '8px',
            cursor: 'pointer',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "#212529",
        }),
        placeholder: (provided) => ({
            ...provided,
            fontFamily: 'Product Sans, sans-serif',
            fontWeight: 400,
            color: "#828282",
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: '#000',
            transition: 'transform 0.2s ease-in-out',
            transform: state.isFocused ? 'rotate(180deg)' : null,
        }),
        menu: (provided) => ({
            ...provided,
            fontFamily: "Product Sans, sans-serif",
            fontWeight: 400,
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid #D3DBD5",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            marginTop: '4px',
            zIndex: 1000,
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? "#F0F0F0" : "white",
            color: "#212529",
            padding: "10px 15px",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            cursor: 'pointer',
            "&:active": {
                backgroundColor: "#E0E0E0",
            },
        }),
    };

    return (
        <div className="vh-80 d-flex flex-column position-relative bg-light">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                limit={1}
            />
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white">
                <h5 className="mb-0 fw-bold">Vendors ({vendors.length})</h5>
                <div>
                    <Button variant="outline-secondary" size="sm" className="me-2" onClick={fetchVendors}>
                        <i className="bi bi-arrow-clockwise"></i>
                    </Button>
                    <Button variant="success" size="sm" onClick={openForm}>
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
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-muted">
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
                            <Form.Label className="mb-1" style={{
                                color: "#393C3AE5", width: "325px",
                                fontFamily: "Product Sans, sans-serif", fontWeight: 400,
                            }}>First Name</Form.Label>
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
                            <Form.Label className="mb-1" style={{
                                color: "#393C3AE5", width: "325px",
                                fontFamily: "Product Sans, sans-serif", fontWeight: 400,
                            }}>Last Name</Form.Label>
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
                            <Form.Label className="mb-1" style={{
                                color: "#393C3AE5", width: "325px",
                                fontFamily: "Product Sans, sans-serif", fontWeight: 400,
                            }}>Gender</Form.Label>
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
                            />
                            {errors.gender && <div style={errorStyle}>{errors.gender}</div>}
                        </div>
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={{
                                color: "#393C3AE5", width: "325px",
                                fontFamily: "Product Sans, sans-serif", fontWeight: 400,
                            }}>Date of Birth</Form.Label>
                            <Form.Control
                                className="custom-placeholder"
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                size="sm"
                                isInvalid={!!errors.dob}
                                style={getInputStyle("dob")}
                            />
                            <Form.Control.Feedback type="invalid" style={errorStyle}>
                                {errors.dob}
                            </Form.Control.Feedback>
                        </div>
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={{
                                color: "#393C3AE5", width: "325px",
                                fontFamily: "Product Sans, sans-serif", fontWeight: 400,
                            }}>Mobile No.</Form.Label>
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
                            <Form.Label className="mb-1" style={{
                                color: "#393C3AE5", width: "325px",
                                fontFamily: "Product Sans, sans-serif", fontWeight: 400,
                            }}>Alternative Mobile</Form.Label>
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
                            <Form.Label className="mb-1" style={{
                                color: "#393C3AE5", width: "325px",
                                fontFamily: "Product Sans, sans-serif", fontWeight: 400,
                            }}>Email</Form.Label>
                            <Form.Control
                                className="custom-placeholder"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter Email"
                                size="sm"
                                isInvalid={!!errors.email}
                                style={getInputStyle("email")}
                            />
                            <Form.Control.Feedback type="invalid" style={errorStyle}>
                                {errors.email}
                            </Form.Control.Feedback>
                        </div>
                    </div>
                    <h6
                        className="fw-bold mb-1 mt-2"
                        style={{
                            fontFamily: "Product Sans, sans-serif",
                            fontWeight: 700,
                            fontSize: "20px",
                            color: "#141414",
                            lineHeight: "1",
                            letterSpacing: "0",
                        }}
                    >
                        Other Information
                    </h6>
                    <hr className="mt-1 mb-2" />
                    <div className="row gx-4">
                        {[
                            { name: "company_name", label: "Company Name", placeholder: "Enter Company Name" },
                            { name: "address", label: "Address", placeholder: "Enter Address" },
                            { name: "city", label: "City", placeholder: "Enter City" },
                            { name: "pincode", label: "Pincode", placeholder: "Enter Pincode" },
                            { name: "gst", label: "GST No.", placeholder: "Enter GST Number" },
                        ].map(({ name, label, placeholder }) => (
                            <div className="col-6 mb-2" key={name}>
                                <Form.Label className="mb-1" style={{
                                    color: "#393C3AE5", width: "325px",
                                    fontFamily: "Product Sans, sans-serif", fontWeight: 400,
                                }}>{label}</Form.Label>
                                <Form.Control
                                    name={name}
                                    value={formData[name]}
                                    onChange={handleChange}
                                    placeholder={placeholder}
                                    size="sm"
                                    isInvalid={!!errors[name]}
                                    style={getInputStyle(name)}
                                />
                                <Form.Control.Feedback type="invalid" style={errorStyle}>
                                    {errors[name]}
                                </Form.Control.Feedback>
                            </div>
                        ))}
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={{
                                color: "#393C3AE5", width: "325px",
                                fontFamily: "Product Sans, sans-serif", fontWeight: 400,
                            }}>State</Form.Label>
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
                            />
                            {errors.state && <div style={errorStyle}>{errors.state}</div>}
                        </div>
                        <div className="col-6 mb-2">
                            <Form.Label className="mb-1" style={{
                                color: "#393C3AE5", width: "325px",
                                fontFamily: "Product Sans, sans-serif", fontWeight: 400,
                            }}>District</Form.Label>
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
                            />
                            {errors.district && <div style={errorStyle}>{errors.district}</div>}
                        </div>
                    </div>
                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="success"
                            type="submit"
                            style={{
                                width: "179px",
                                height: "50px",
                                fontSize: "16px",
                                borderRadius: "6px",
                            }}
                        >
                            {isEditing ? "Update Vendor" : "Save"}
                        </Button>
                    </div>
                </form>
            </div>
            <style>{`
                .vendor-form-slide {
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
                .simple-option {
                    padding: 10px 15px;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}