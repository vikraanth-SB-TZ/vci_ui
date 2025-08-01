import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import { FaRegCalendarAlt } from "react-icons/fa";

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

export default function VciCustomer() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(initialForm());
    const [isEditing, setIsEditing] = useState(false);
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [errors, setErrors] = useState({});
      const [selectedDate, setSelectedDate] = useState(null);

    const tableRef = useRef(null);
    
    const apiBase = "http://127.0.0.1:8000/api";

    useEffect(() => {
        fetchCustomers();
        fetchStates();
        fetchDistricts();
    }, []);

    useEffect(() => {
        if (!loading && customers.length > 0) {
            $(tableRef.current).DataTable({
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
    }, [customers, loading]);

    const fetchCustomers = () => {
        setLoading(true); 
        axios
            .get(`${apiBase}/customers`) // GET request to the customers endpoint.
            .then((res) => {
                setCustomers(Array.isArray(res.data.data) ? res.data.data : res.data);
                 toast.success("Customers loaded successfully!", { toastId: 'customers-loaded', autoClose: 1500 });
            })
          
            .finally(() => {
                setLoading(false);
            });
    };

    const fetchStates = () => {
        axios.get(`${apiBase}/states`) 
            .then((res) => {
                console.log("States API response:", res.data); // Log response for debugging.
                setStates(Array.isArray(res.data) ? res.data : []); // Ensure response is an array.
            })

    };

    const fetchDistricts = () => {
        axios.get(`${apiBase}/districts`) // GET request to the districts endpoint.
            .then((res) => {
                console.log("Districts API response:", res.data); // Log response for debugging.
                setDistricts(Array.isArray(res.data) ? res.data : []); // Ensure response is an array.
            })
    
    };
    const handleChange = (e, selectName = null) => {
        let name, value;
        if (selectName) {
            name = selectName;
            value = e ? e.value : ""; // Extract the 'value' from the selected option.
        } else {
            name = e.target.name;
            value = e.target.value;
        }
        setFormData((prev) => ({ ...prev, [name]: value })); // Update formData state.
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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
 const today = new Date().toISOString().slice(0, 10); // Get today's date in 'YYYY-MM-DD' format

    // ... (existing validation rules)

    if (!formData.dob) newErrors.dob = "Date of Birth is required.";
    // New validation rule to check for future dates
    else if (formData.dob > today) {
        newErrors.dob = "Date of Birth cannot be in the future.";
    }        if (!formData.company_name.trim()) newErrors.company_name = "Company name is required.";
        if (!formData.address.trim()) newErrors.address = "Address is required.";
        if (!formData.city.trim()) newErrors.city = "City is required.";
        if (!formData.state) newErrors.state = "State is required.";
        if (!formData.district) newErrors.district = "District is required.";
        if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required.";
        else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Pincode must be 6 digits.";
        
        setErrors(newErrors); // Update errors state.
        return Object.keys(newErrors).length === 0; // Return true if no errors, false otherwise.
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission behavior.
        if (!validateForm()) {
            // toast.error("Please fill in all required fields correctly.", { close: 500 });
            return; // Stop submission if validation fails.
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
            state_id: formData.state ? parseInt(formData.state, 10) : null,
            district_id: formData.district ? parseInt(formData.district, 10) : null,
            pincode: formData.pincode,
            gst_no: formData.gst,
            date_of_birth: formData.dob,
        };

        console.log("Submitting payload:", payload); // Debugging: log payload before sending.

        const request = isEditing
            ? axios.put(`${apiBase}/customers/${formData.id}`, payload)
            : axios.post(`${apiBase}/customers`, payload);

        request
            .then(() => {
                localStorage.setItem("customer_refresh", "true");
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
                                toast.error(fieldErrors[0], { autoClose: 1000 });
                            } else {
                                newErrors[field] = fieldErrors;
                                toast.error(fieldErrors, { autoClose: 1000 });
                            }
                        });
                    } else if (message) {
                        // If a general message is returned, display it.
                        toast.error(`Failed to save customer: ${message}`, { autoClose: 1000 });
                    } else {
                        // Generic error message.
                        toast.error("Failed to save customer. Please try again.", { autoClose: 1000 });
                    }
                    setErrors(newErrors); // Update errors state with backend errors.
                } else {
                    toast.error("Failed to save customer.", { autoClose: 1000 });
                }
            });
    };

    // Function to handle PDF download.
    const handleDownloadPdf = async () => {
        try {
            // Make a GET request to the PDF endpoint, expecting a binary response (blob).
            const response = await axios.get(`${apiBase}/pdf`, {
                responseType: "blob",
            });

            if (response.status === 200 && response.data) {
                // Create a Blob from the response data.
                const blob = new Blob([response.data], { type: response.headers['content-type'] || "application/pdf" });
                // Create a URL for the Blob.
                const url = window.URL.createObjectURL(blob);
                // Create a temporary anchor element to trigger download.
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "customers.pdf"); // Set download filename.
                document.body.appendChild(link);
                link.click(); // Programmatically click the link to start download.
                document.body.removeChild(link); // Clean up the temporary link.
                window.URL.revokeObjectURL(url); // Release the object URL.
                toast.success("PDF downloaded successfully.", { autoClose: 1000 });
            } else {
                toast.error("No PDF data received from server.", { autoClose: 1000 });
            }
        } catch (error) {
            console.error("PDF download error:", error);
            toast.error("Failed to download PDF. Please check your network or contact support.", { autoClose: 1000
             });
        }
    };

    // Options for state dropdown, mapping API response to { value, label } format.
   const stateOptions = states.map(state => ({
        value: String(state.id),
        label: state.state, // Correctly using 'state' column from DB schema
    }));

    // Options for district dropdown, mapping API response to { value, label } format.
    const districtOptions = districts.map(district => ({
        value: String(district.id),
        label: district.district, // Correctly using 'district' column from DB schema
    }));
    // Static options for gender dropdown.
    const genderOptions = [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Other", label: "Other" },
    ];

    const handleEdit = (customer) => {
        setFormData({
            id: customer.id,
            first_name: customer.first_name || "",
            last_name: customer.last_name || "",
            gender: customer.gender || "",
            mobile: customer.mobile || "",
            altMobile: customer.alter_mobile || "", // Note: backend sends 'alter_mobile'
            email: customer.email || "",
            company_name: customer.company_name || "",
            address: customer.address || "",
            city: customer.city || "",
            state: customer.state_id ? String(customer.state_id) : "",
            district: customer.district_id ? String(customer.district_id) : "",
            pincode: customer.pincode || "",
            gst: customer.gst_no || "", // Note: backend sends 'gst_no'
            dob: customer.date_of_birth || "", // Note: backend sends 'date_of_birth'
        });
        setIsEditing(true); // Set editing mode to true.
        setShowForm(true); // Show the form.
        setErrors({}); // Clear any previous errors.
    };

    const openForm = () => {
        setFormData(initialForm()); // Reset form data to initial empty state.
        setIsEditing(false); // Set editing mode to false.
        setShowForm(true); // Show the form.
        setErrors({}); // Clear any previous errors.
    };

    const closeForm = () => {
        setFormData(initialForm()); // Clear form data.
        setIsEditing(false); // Reset editing status.
        setShowForm(false); // Hide the form.
        setErrors({}); // Clear errors.
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
        border: `1px solid ${errors[fieldName] ? "#dc3545" : "#D3DBD5"}`, // Red border for errors.
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
    border: `1px solid ${
      state.selectProps.name && state.selectProps.errors?.[state.selectProps.name]
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




    const getStateNameById = (stateId) => {
        const state = states.find(s => String(s.id) === String(stateId));
        return state ? state.state : ''; // Directly use 'state' field as per DB schema
    };

    const getDistrictNameById = (districtId) => {
        const district = districts.find(d => String(d.id) === String(districtId));
        return district ? district.district : ''; // Directly use 'district' field as per DB schema
    };


    return (
        <div className="vh-80 d-flex flex-column position-relative bg-light">
       
            {/* Header section with title and action buttons */}
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white">
                <h5 className="mb-0 fw-bold">Customers ({customers.length})</h5>
                <div>
                    {/* Download PDF button */}
                    <Button variant="info" size="sm" className="me-2" onClick={handleDownloadPdf}>
                        <i className="bi bi-file-earmark-pdf me-1"></i> Download PDF
                    </Button>
                    {/* Add New Customer button */}
                    <Button variant="success" size="sm" onClick={openForm}>
                        + Add New
                    </Button>
                </div>
            </div>

            {/* Main content area: Customer table */}
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
                            {/* Conditional rendering based on loading state and customer data */}
                            {loading ? (
                                <tr>
                                    <td colSpan="10" className="text-center py-4">
                                        <Spinner animation="border" /> {/* Loading spinner */}
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="text-center py-4 text-muted">
                                        No customers found. {/* Message when no customers */}
                                    </td>
                                </tr>
                            ) : (
                                // Map over customers array to render table rows
                                customers.map((customer, index) => (
                                    <tr key={customer.id}>
                                        <td style={{ textAlign: "center" }}>{index + 1}</td>
                                        <td>{`${customer.first_name || ""} ${customer.last_name || ""}`}</td>
                                        <td>{customer.mobile}</td>
                                        <td>{customer.email}</td>
                                        <td>{customer.gender}</td>
                                        <td>{customer.company_name}</td>
                                        <td>{customer.address}</td>
                                        {/* Display state and district names using helper functions */}
                                        <td>{getStateNameById(customer.state_id)}</td>
                                        <td>{getDistrictNameById(customer.district_id)}</td>
                                        <td>
                                            {/* Edit button */}
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-1"
                                                onClick={() => handleEdit(customer)}
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

            {/* Customer Add/Edit Form (slides in from the right) */}
            <div
                className={`position-fixed bg-white shadow-lg px-3 pt-2 pb-2 customer-form-slide`}
                style={{
                    width: "600px",
                    height: "calc(100vh - 58px)",
                    top: "58px",
                    right: showForm ? "0" : "-800px", // Controls slide-in/out animation
                    transition: "right 0.4s ease-in-out",
                    overflowY: "auto",
                    overflowX: "hidden",
                    opacity: 1,
                    fontFamily: "Product Sans, sans-serif",
                    fontWeight: 400,
                    zIndex: 1050,
                }}
            >
                {/* Form header with title and close button */}
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
                        {isEditing ? "Edit Customer" : "Add New Customer"}
                    </h5>
                    {/* Close form button */}
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

                {/* Personal Information Section */}
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
                        {/* First Name */}
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
                                placeholder="Enter Customer First Name"
                                size="sm"
                                isInvalid={!!errors.first_name}
                                style={getInputStyle("first_name")}
                            />
                            <Form.Control.Feedback type="invalid" style={errorStyle}>
                                {errors.first_name}
                            </Form.Control.Feedback>
                        </div>
                        {/* Last Name */}
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
                                placeholder="Enter Customer Last Name"
                                size="sm"
                                isInvalid={!!errors.last_name}
                                style={getInputStyle("last_name")}
                            />
                            <Form.Control.Feedback type="invalid" style={errorStyle}>
                                {errors.last_name}
                            </Form.Control.Feedback>
                        </div>
                        {/* Gender Select */}
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
                        {/* Date of Birth */}
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
            max={new Date().toISOString().slice(0, 10)} // Set max attribute to today's date
        />
        <Form.Control.Feedback type="invalid" style={errorStyle}>
            {errors.dob}
        </Form.Control.Feedback>
    </div>

                        {/* Mobile No. */}
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
                        {/* Alternative Mobile */}
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
                        {/* Email */}
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

                    {/* Other Information Section */}
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
    Company & Address Details
</h6>
<hr className="mt-1 mb-2" />

<div className="row gx-4">
    {/* Company Name */}
    <div className="col-6 mb-2">
        <Form.Label className="mb-1" style={{
            color: "#393C3AE5", width: "325px",
            fontFamily: "Product Sans, sans-serif", fontWeight: 400,
        }}>Company Name</Form.Label>
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

    {/* Address */}
    <div className="col-6 mb-2">
        <Form.Label className="mb-1" style={{
            color: "#393C3AE5", width: "325px",
            fontFamily: "Product Sans, sans-serif", fontWeight: 400,
        }}>Address</Form.Label>
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

    {/* City */}
    <div className="col-6 mb-2">
        <Form.Label className="mb-1" style={{
            color: "#393C3AE5", width: "325px",
            fontFamily: "Product Sans, sans-serif", fontWeight: 400,
        }}>City</Form.Label>
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

    {/* State */}
    <div className="col-6 mb-2">
        <Form.Label className="mb-1" style={{
            color: "#393C3AE5", width: "325px",
            fontFamily: "Product Sans, sans-serif", fontWeight: 400,
        }}>State</Form.Label>
        <Select
            name="state"
            value={stateOptions.find((option) => option.value === formData.state) || null}
            onChange={(selectedOption) => handleChange(selectedOption, "state")}
            options={stateOptions}
            placeholder="Select State"
            isClearable={true}
            styles={{ ...customSelectStyles, errors }}
            components={{ Option: SimpleOption }}
            classNamePrefix="react-select"
        />
        {errors.state && <div style={errorStyle}>{errors.state}</div>}
    </div>

    {/* District */}
    <div className="col-6 mb-2">
        <Form.Label className="mb-1" style={{
            color: "#393C3AE5", width: "325px",
            fontFamily: "Product Sans, sans-serif", fontWeight: 400,
        }}>District</Form.Label>
        <Select
            name="district"
            value={districtOptions.find((option) => option.value === formData.district) || null}
            onChange={(selectedOption) => handleChange(selectedOption, "district")}
            options={districtOptions}
            placeholder="Select District"
            isClearable={true}
            styles={{ ...customSelectStyles, errors }}
            components={{ Option: SimpleOption }}
            classNamePrefix="react-select"
        />
        {errors.district && <div style={errorStyle}>{errors.district}</div>}
    </div>

    {/* Pincode */}
    <div className="col-6 mb-2">
        <Form.Label className="mb-1" style={{
            color: "#393C3AE5", width: "325px",
            fontFamily: "Product Sans, sans-serif", fontWeight: 400,
        }}>Pincode</Form.Label>
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


                    {/* Form action buttons */}

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
                            {isEditing ? "Update Customer" : "Save"}
                        </Button>
                    </div>
                </form>
            </div>
            <style>{`
                .customer-form-slide {
                    box-shadow: 0 0 24px rgba(0,0,0,0.08);
                }
            `}</style>
        </div>
    );
}
