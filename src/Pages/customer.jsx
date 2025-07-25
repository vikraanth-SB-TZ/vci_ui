import { useState, useEffect } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import Select from 'react-select'; // Import react-select
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import React-Toastify CSS

export default function App() { // Changed to App as per instructions for default export
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialForm());
  const [isEditing, setIsEditing] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null); // For the main customer dropdown

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default items per page

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
      state: "", // Will store state.id
      district: "", // Will store district.id
      pincode: "",
      gst: "",
      dob: "",
    };
  }

  useEffect(() => {
    fetchCustomers();
    fetchStates();
    fetchDistricts();
  }, []);

  const fetchCustomers = () => {
    setLoading(true);
    axios
      .get("/api/customers")
      .then((res) => {
        setCustomers(res.data.data || res.data);
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error("Error fetching customers", err);
        toast.error("Failed to fetch customers.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchStates = () => {
    axios
      .get("/api/states")
      .then((res) => {
        console.log("States API response:", res.data);
        setStates(res.data);
      })
      .catch((err) => {
        console.error("Error fetching states", err);
        toast.error("Failed to fetch states.");
      });
  };

  const fetchDistricts = () => {
    axios
      .get("/api/districts")
      .then((res) => {
        console.log("Districts API response:", res.data);
        setDistricts(res.data);
      })
      .catch((err) => {
        console.error("Error fetching districts", err);
        toast.error("Failed to fetch districts.");
      });
  };

  // Modified handleChange to handle both standard inputs and react-select
  const handleChange = (e, selectName = null) => {
    let name;
    let value;

    if (selectName) { // This is a react-select change
      name = selectName;
      value = e ? e.value : ""; // e can be null if option is cleared
    } else { // This is a standard input change
      name = e.target.name;
      value = e.target.value;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the specific error for the field being changed
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };


  const handleCustomerSelectChange = (selectedOption) => {
    setSelectedCustomer(selectedOption);
    // You can also populate form data if this dropdown is meant for editing
    if (selectedOption) {
      // Example: If you want to load customer data into the form when selected
      // setFormData({
      //     ...initialForm(), // Start with a fresh form or current form data
      //     id: selectedOption.value,
      //     first_name: selectedOption.first_name,
      //     last_name: selectedOption.last_name,
      //     company_name: selectedOption.company_name,
      //     // ... other fields
      // });
      // setIsEditing(true); // Maybe open the form for editing
      // setShowForm(true);
    } else {
      // setSelectedCustomer(null); // Reset if "Select Customer" is chosen or cleared
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required.";
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid.";
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required.";
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required.";
    }
    if (!formData.dob) {
      newErrors.dob = "Date of Birth is required.";
    }
    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required.";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required.";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }
    if (!formData.state) {
      newErrors.state = "State is required.";
    }
    if (!formData.district) {
      newErrors.district = "District is required.";
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required.";
    }
    // GST and Alt Mobile are optional, so no direct validation for being empty.
    // If you need format validation for GST, add it here.

    setErrors(newErrors);

    // Show toast messages for each error
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach(errorMsg => {
        toast.error(errorMsg);
      });
      return false; // Indicate that there are errors
    }
    return true; // Indicate that there are no errors
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // First, run client-side validation
    if (!validateForm()) {
      return; // Stop if client-side validation fails
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
      states_id: formData.state,
      districts_id: formData.district,
      pincode: formData.pincode,
      gst_no: formData.gst,
      date_of_birth: formData.dob,
    };

    const request = isEditing
      ? axios.put(`/api/customers/${formData.id}`, payload)
      : axios.post("/api/customers", payload);

    request
      .then(() => {
        fetchCustomers();
        closeForm();
        toast.success(`Customer ${isEditing ? "updated" : "added"} successfully!`);
      })
      .catch((err) => {
        console.error("Save failed", err);
        if (err.response && err.response.data) {
          const { message, errors: backendErrors } = err.response.data;

          let newErrors = {};
          if (backendErrors) {
            // Backend validation errors (e.g., Laravel's validation response)
            // The structure is typically { fieldName: ["error message 1", "error message 2"] }
            Object.keys(backendErrors).forEach(field => {
              const fieldErrors = backendErrors[field];
              if (Array.isArray(fieldErrors)) {
                // Take the first error message for the field to display in the input feedback
                newErrors[field] = fieldErrors[0];
                // Display all backend errors as toasts
                fieldErrors.forEach(msg => toast.error(msg));
              } else {
                // If it's not an array, just display it
                newErrors[field] = fieldErrors;
                toast.error(fieldErrors);
              }
            });
          } else if (message) {
            // General error message from the backend
            toast.error(`Failed to save customer: ${message}`);
          } else {
            // Fallback for unexpected error structures
            toast.error("Failed to save customer. Please try again.");
          }
          setErrors(newErrors); // Set errors for red border on inputs
        } else {
          // Network error or no response from server
          toast.error("Failed to save customer. Please check your network connection.");
        }
      });
  };

  const errorStyle = {
    color: "#dc3545",
    fontSize: "13px",
    marginTop: "4px",
  };

  const getInputStyle = (fieldName) => ({
    width: "270px", // Standard input width
    height: "50px",
    fontFamily: "Product Sans, sans-serif",
    fontWeight: 400,
    fontSize: "16px",
    borderRadius: "4px",
    border: `1px solid ${errors[fieldName] ? "#dc3545" : "#D3DBD5"}`,
    backgroundColor: "#FFFFFF",
    color: "#212529",
  });

  const handleEdit = (customer) => {
    setFormData({
      id: customer.id,
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      gender: customer.gender || "",
      mobile: customer.mobile || "",
      altMobile: customer.alter_mobile || "",
      email: customer.email || "",
      company_name: customer.company_name || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.states_id || "", // Store ID
      district: customer.districts_id || "", // Store ID
      pincode: customer.pincode || "",
      gst: customer.gst_no || "",
      dob: customer.date_of_birth || "",
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

  // --- Pagination Logic ---
  const totalCustomers = customers.length;
  const totalPages = Math.ceil(totalCustomers / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentCustomers = customers.slice(startIndex, startIndex + pageSize);

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
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

  // Prepare options for react-select for main customer dropdown
  const customerOptions = customers.map(customer => ({
    value: customer.id,
    label: `${customer.first_name} ${customer.last_name}`,
    company: customer.company_name, // Include company for sub-label
  }));

  // Prepare options for react-select for gender
  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  // Prepare options for react-select for states
  const stateOptions = states.map(state => ({
    value: state.id,
    label: state.states,
  }));

  // Prepare options for react-select for districts
  const districtOptions = districts.map(district => ({
    value: district.id,
    label: district.districts,
  }));

  // Custom styles for react-select to match the design (reusable for all selects)
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      width: "270px", // Match your form input width
      height: "50px", // Match your form input height
      minHeight: "50px",
      fontFamily: "Product Sans, sans-serif",
      fontWeight: 400,
      fontSize: "16px",
      borderRadius: "4px",
      // Dynamically apply border color based on validation error
      border: `1px solid ${state.selectProps.name && errors[state.selectProps.name] ? "#dc3545" : "#D3DBD5"}`,
      boxShadow: "none", // Remove shadow on focus
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
      color: "#212529", // Text color
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
      zIndex: 1000, // Ensure menu appears above other elements
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

  // Custom Option component for the main Customer dropdown
  const CustomerOption = ({ innerProps, label, data }) => (
    <div {...innerProps} className="customer-option">
      <div className="customer-avatar">
        {label.charAt(0).toUpperCase()}
      </div>
      <div className="customer-info">
        <div className="customer-name">{label}</div>
        <div className="customer-company">{data.company}</div>
      </div>
    </div>
  );

  // Simple Option component for Gender, State, District (no avatar/company)
  const SimpleOption = ({ innerProps, label }) => (
    <div {...innerProps} className="simple-option">
      {label}
    </div>
  );


  return (
    <div className="vh-80 d-flex flex-column position-relative bg-light">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover /> {/* Toast container */}
      <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white">
        <h5 className="mb-0 fw-bold">Customers ({totalCustomers})</h5>
        <div>
          <Button
            variant="outline-secondary"
            size="sm"
            className="me-2"
            onClick={fetchCustomers}
          >
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button variant="success" size="sm" onClick={openForm}>
            + Add New
          </Button>
        </div>
      </div>

      {/* Main customer selection dropdown */}
      <div className="px-4 py-3 bg-white border-bottom">
        <Form.Group controlId="selectCustomerDropdown" style={{ width: "325px" }}>
          <Select
            value={customerOptions.find(option => option.value === selectedCustomer?.value)}
            onChange={handleCustomerSelectChange}
            options={customerOptions}
            placeholder="Select Customer"
            isClearable={true}
            styles={customSelectStyles}
            components={{ Option: CustomerOption }} // Use the custom CustomerOption component
            name="selectedCustomer" // Added name for potential future validation or tracking
          />
        </Form.Group>
      </div>


      <div className="flex-grow-1 overflow-auto">
        <div style={{ minWidth: "1200px" }}>
          <div
            className="d-flex align-items-center px-4 border-bottom small fw-semibold"
            style={{
              backgroundColor: "#DBDBDB73",
              fontSize: "16px",
              height: "60px",
              color: "#0e0f0eff",
            }}
          >
            <div style={{ width: "80px" }}>S.No</div>
            <div style={{ flex: 2 }}>Name</div>
            <div style={{ flex: 2 }}>Mobile</div>
            <div style={{ flex: 2 }}>Email</div>
            <div style={{ flex: 2 }}>Gender</div>
            <div style={{ flex: 2 }}>Company</div>
            <div style={{ flex: 2 }}>Address</div>
            <div style={{ flex: 2 }}>Action</div>
          </div>

          <div
            className="bg-light"
            style={{
              maxHeight: "calc(100vh - 200px)",
              overflowY: "auto",
              fontFamily: "Product Sans, sans-serif",
              fontWeight: 400,
              fontSize: "18px",
              fontStyle: "regular",
              color: "#212529",
            }}
          >
            {loading ? (
              <div className="text-center mt-4">
                <Spinner animation="border" />
              </div>
            ) : currentCustomers.length === 0 ? (
              <div
                className="d-flex flex-column justify-content-center align-items-center"
                style={{ height: "calc(80vh - 160px)", width: "100%" }}
              >
                <img
                  src="https://placehold.co/160x160/E0E0E0/333333?text=No+Data"
                  alt="Empty"
                  style={{ width: "160px" }}
                />
                <p className="mt-3 text-muted">
                  {customers.length === 0
                    ? "No customers found."
                    : "No customers found on this page."}
                </p>
              </div>
            ) : (
              currentCustomers.map((customer, index) => (
                <div
                  key={customer.id}
                  className="px-4 py-2 border-bottom d-flex bg-white align-items-center small"
                >
                  <div style={{ width: "80px" }}>
                    {startIndex + index + 1}
                  </div>
                  <div style={{ flex: 2 }}>
                    {`${customer.first_name || ""} ${
                      customer.last_name || ""
                    }`}
                  </div>
                  <div style={{ flex: 2 }}>{customer.mobile}</div>
                  <div style={{ flex: 2 }}>{customer.email}</div>
                  <div style={{ flex: 2 }}>{customer.gender}</div>
                  <div style={{ flex: 2 }}>{customer.company_name}</div>
                  <div style={{ flex: 2 }}>{customer.address}</div>
                  <div style={{ flex: 2 }}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-1"
                      onClick={() => handleEdit(customer)}
                    >
                      <i className="bi bi-pencil-square me-1"></i>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && customers.length > 0 && (
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
              {totalCustomers === 0
                ? "0-0"
                : `${startIndex + 1}-${Math.min(
                    startIndex + pageSize,
                    totalCustomers
                  )}`}
            </span>
            <Button
              variant="link"
              className="pagination-arrow-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalCustomers === 0}
            >
              <i className="bi bi-chevron-right"></i>
            </Button>
          </div>
        </div>
      )}

      {/* Slide-in Form */}
      <div
        className={`position-fixed bg-white shadow-lg px-3 pt-2 pb-2 customer-form-slide`}
        style={{
          width: "580px",
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
            {isEditing ? "Edit customer" : "Add New Customer"}
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
        <div className="row gx-4 personal-form">
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
              First Name
            </Form.Label>
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
              Last Name
            </Form.Label>
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

          {/* Gender Dropdown - now with react-select */}
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
              Gender
            </Form.Label>
            <Select
              name="gender"
              value={genderOptions.find(option => option.value === formData.gender)}
              onChange={(selectedOption) => handleChange(selectedOption, "gender")}
              options={genderOptions}
              placeholder="Select Gender"
              isClearable={true}
              styles={customSelectStyles}
              components={{ Option: SimpleOption }} // Use the simpler Option component
              classNamePrefix="react-select" // For more specific styling if needed
            />
            {/* Manual feedback for react-select */}
            {errors.gender && <div style={errorStyle}>{errors.gender}</div>}
          </div>

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
            <Form.Label
              className="mb-1"
              style={{
                color: "#393C3AE5",
                width: "325px",
                fontFamily: "Product Sans, sans-serif",
                fontWeight: 400,
              }}
            >
              Mobile No.
            </Form.Label>
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
            <Form.Label
              className="mb-1"
              style={{
                color: "#393C3AE5",
                width: "325px",
                fontFamily: "Product Sans, sans-serif",
                fontWeight: 400,
              }}
            >
              Alternative Mobile
            </Form.Label>
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
            <Form.Label
              className="mb-1"
              style={{
                color: "#393C3AE5",
                width: "325px",
                fontFamily: "Product Sans, sans-serif",
                fontWeight: 400,
              }}
            >
              Email
            </Form.Label>
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
              <Form.Label
                className="mb-1"
                style={{
                  color: "#393C3AE5",
                  width: "325px",
                  fontFamily: "Product Sans, sans-serif",
                  fontWeight: 400,
                }}
              >
                {label}
              </Form.Label>
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

          {/* State Dropdown - now with react-select */}
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
              State
            </Form.Label>
            <Select
              name="state"
              value={stateOptions.find(option => option.value === formData.state)}
              onChange={(selectedOption) => handleChange(selectedOption, "state")}
              options={stateOptions}
              placeholder="Select State"
              isClearable={true}
              styles={customSelectStyles}
              components={{ Option: SimpleOption }}
              classNamePrefix="react-select"
            />
            {/* Manual feedback for react-select */}
            {errors.state && <div style={errorStyle}>{errors.state}</div>}
          </div>

          {/* District Dropdown - now with react-select */}
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
              District
            </Form.Label>
            <Select
              name="district"
              value={districtOptions.find(option => option.value === formData.district)}
              onChange={(selectedOption) => handleChange(selectedOption, "district")}
              options={districtOptions}
              placeholder="Select District"
              isClearable={true}
              styles={customSelectStyles}
              components={{ Option: SimpleOption }}
              classNamePrefix="react-select"
            />
            {/* Manual feedback for react-select */}
            {errors.district && <div style={errorStyle}>{errors.district}</div>}
          </div>
        </div>
        <div className="d-flex justify-content-end mt-4 mb-2 me-2">
          <Button
            variant="secondary"
            onClick={closeForm}
            className="me-2"
            style={{
              width: "120px",
              height: "45px",
              backgroundColor: "#F0F0F0",
              color: "#212529",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: 500,
              fontFamily: "Product Sans, sans-serif",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            onClick={handleSubmit}
            style={{
              width: "120px",
              height: "45px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: 500,
              fontFamily: "Product Sans, sans-serif",
            }}
          >
            {isEditing ? "Update" : "Save"}
          </Button>
        </div>
      </div>
      <style>{`
        /* Add any custom CSS here */
        .customer-option {
          display: flex;
          align-items: center;
        }

        .customer-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #007bff; /* Example background color */
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          margin-right: 10px;
        }

        .customer-info {
          display: flex;
          flex-direction: column;
        }

        .customer-name {
          font-weight: bold;
        }

        .customer-company {
          font-size: 0.8em;
          color: #666;
        }

        .simple-option {
          padding: 10px 15px;
        }

        /* Custom placeholder style */
        .custom-placeholder::placeholder {
          font-family: 'Product Sans', sans-serif;
          font-weight: 400;
          color: #828282;
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

        /* General form input focus style */
        .form-control:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25);
        }

        /* Hide Bootstrap's default invalid feedback icon */
        .form-control.is-invalid ~ .invalid-feedback {
          display: block; /* Ensure it's visible */
        }
      `}</style>
    </div>
  );
}
