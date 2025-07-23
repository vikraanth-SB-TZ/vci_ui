import React, { useState, useEffect } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import axios from "axios";

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialForm());
  const [isEditing, setIsEditing] = useState(false);

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
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    setLoading(true);
    axios
      .get("/api/customers")
      .then((res) => {
        setCustomers(res.data.data || res.data);
      })
      .catch((err) => {
        console.error("Error fetching customers", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      date_of_birth: formData.dob,
      alter_mobile: formData.altMobile,
      gst_no: formData.gst,
      state_id: formData.state,
      district_id: formData.district,
    };

    if (isEditing) {
      axios
        .put(`/api/customers/${formData.id}`, payload)
        .then(() => {
          fetchCustomers();
          closeForm();
        })
        .catch((err) => {
          console.error("Error updating customer", err);
        });
    } else {
      axios
        .post("/api/customers", payload)
        .then(() => {
          fetchCustomers();
          closeForm();
        })
        .catch((err) => {
          console.error("Error adding customer", err);
        });
    }
  };

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
      state: customer.state_id || "",
      district: customer.district_id || "",
      pincode: customer.pincode || "",
      gst: customer.gst_no || "",
      dob: customer.date_of_birth || "",
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      axios
        .delete(`/api/customers/${id}`)
        .then(() => fetchCustomers())
        .catch((err) => console.error("Delete failed", err));
    }
  };

  const openForm = () => {
    setFormData(initialForm());
    setIsEditing(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setFormData(initialForm());
    setIsEditing(false);
    setShowForm(false);
  };

  return (
    <div className="vh-80 d-flex flex-column position-relative bg-light">
      <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white">
        <h5 className="mb-0 fw-bold">Customer</h5>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={fetchCustomers}>
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button variant="success" size="sm" onClick={openForm}>
            + Add New
          </Button>
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto">
        <div style={{ minWidth: "1200px" }}>
          <div className="d-flex align-items-center px-4 border-bottom small fw-semibold" style={{ backgroundColor: "#DBDBDB73", fontSize: "16px", height: "60px", color: "#0e0f0eff" }}>
            <div style={{ width: "80px" }}>S.No</div>
            <div style={{ flex: 2 }}>Name</div>
            <div style={{ flex: 2 }}>Mobile</div>
            <div style={{ flex: 2 }}>Email</div>
            <div style={{ flex: 2 }}>Gender</div>
            <div style={{ flex: 2 }}>Company</div>
            <div style={{ flex: 2 }}>Address</div>
            <div style={{ flex: 2 }}>Action</div>
          </div>

          <div className="bg-light" style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto", fontFamily: "Product Sans, sans-serif", fontWeight: 400, fontSize: "18px", color: "#212529" }}>
            {loading ? (
              <div className="text-center mt-4">
                <Spinner animation="border" />
              </div>
            ) : customers.length === 0 ? (
              <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "calc(80vh - 160px)", width: "100%" }}>
                <img src="/empty-box.png" alt="Empty" style={{ width: "160px" }} />
              </div>
            ) : (
              customers.map((customer, index) => (
                <div key={customer.id} className="px-4 py-2 border-bottom d-flex bg-white align-items-center small">
                  <div style={{ width: "80px" }}>{index + 1}</div>
                  <div style={{ flex: 2 }}>{`${customer.first_name || ""} ${customer.last_name || ""}`}</div>
                  <div style={{ flex: 2 }}>{customer.mobile}</div>
                  <div style={{ flex: 2 }}>{customer.email}</div>
                  <div style={{ flex: 2 }}>{customer.gender}</div>
                  <div style={{ flex: 2 }}>{customer.company_name}</div>
                  <div style={{ flex: 2 }}>{customer.address}</div>
                  <div style={{ flex: 2 }}>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(customer)}>
                      <i className="bi bi-pencil-square me-1"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(customer.id)}>
                      <i className="bi bi-trash me-1"></i>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Slide-in Form */}
        <div className={`position-fixed top-10 bg-white shadow-lg px-3 pt-2 pb-2 ${showForm ? "slide-in" : "slide-out"}`} style={{
          width: "590px", height: "100vh", zIndex: 1050, overflowY: "auto", paddingBottom: "80px",
          fontFamily: "Product Sans, sans-serif", fontWeight: 400
        }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0 fw-bold">{isEditing ? "Edit Vendor" : "Add New Vendor"}</h5>
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

          {/* Personal Info */}
        <h6 className="fw-bold mb-1">Personal Information</h6>
        <hr className="mt-1 mb-2" />
<div className="row gx-2 personal-form">
  <div className="col-6 mb-2">
    <Form.Label
      className="mb-1"
      style={{ color: "#393C3AE5", fontFamily: "Product Sans, sans-serif", fontWeight: 400 }}
    >
      First Name
    </Form.Label>
    <Form.Control
      className="custom-placeholder"
      name="first_name"
      value={formData.first_name}
      onChange={handleChange}
      placeholder="Enter First Name"
      size="sm"
    />
  </div>

  <div className="col-6 mb-2">
    <Form.Label
      className="mb-1"
      style={{ color: "#393C3AE5", fontFamily: "Product Sans, sans-serif", fontWeight: 400 }}
    >
      Last Name
    </Form.Label>
    <Form.Control
      className="custom-placeholder"
      name="last_name"
      value={formData.last_name}
      onChange={handleChange}
      placeholder="Enter Last Name"
      size="sm"
    />
  </div>

  <div className="col-6 mb-2">
    <Form.Label
      className="mb-1"
      style={{ color: "#393C3AE5", fontFamily: "Product Sans, sans-serif", fontWeight: 400 }}
    >
      Gender
    </Form.Label>
    <Form.Select
      name="gender"
      value={formData.gender}
      onChange={handleChange}
      size="sm"
      className="custom-placeholder"
    >
      <option value="">Select Gender</option>
      <option>Male</option>
      <option>Female</option>
    </Form.Select>
  </div>

  <div className="col-6 mb-2">
    <Form.Label
      className="mb-1"
      style={{ color: "#393C3AE5", fontFamily: "Product Sans, sans-serif", fontWeight: 400 }}
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
    />
  </div>

  <div className="col-6 mb-2">
    <Form.Label
      className="mb-1"
      style={{ color: "#393C3AE5", fontFamily: "Product Sans, sans-serif", fontWeight: 400 }}
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
    />
  </div>

  <div className="col-6 mb-2">
    <Form.Label
      className="mb-1"
      style={{ color: "#393C3AE5", fontFamily: "Product Sans, sans-serif", fontWeight: 400 }}
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
    />
  </div>
</div>


        {/* Other Info */}
        <h6 className="fw-bold mb-1 mt-2">Other Information</h6>
        <hr className="mt-1 mb-2" />
<div className="row gx-2 vendor-form">
  {[
    { name: "company_name", label: "Company Name" },
    { name: "address" },
    { name: "city" },
    { name: "state" },
    { name: "district" },
    { name: "pincode" },
    { name: "gst", label: "GST No." },
    { name: "email" },
  ].map(({ name, label }) => (
    <div className="col-6 mb-2" key={name}>
      <Form.Label
        className="mb-1"
        style={{
          fontFamily: "Product Sans, sans-serif",
          fontWeight: 400,
          color: "#393C3AE5",
        }}
      >
        {label || name.charAt(0).toUpperCase() + name.slice(1)}
      </Form.Label>
      <Form.Control
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={`Enter ${label || name}`}
        size="sm"
        style={{
          fontFamily: "Product Sans, sans-serif",
          fontWeight: 400,
        }}
      />
    </div>
  ))}
</div>


<div className="text-end mt-3">
  <Button
    variant="success"
    onClick={handleSubmit}
    style={{ width: "179px" }}
  >
    {isEditing ? "Update" : "Save"}
  </Button>
</div>
      </div>

      <style>{`
        .slide-in { right: 0; transition: right 0.4s ease-in-out; }
        .slide-out { right: -600px; transition: right 0.4s ease-in-out; }
        input.form-control:focus, select.form-select:focus {
          box-shadow: none !important;
          border-color: #ced4da !important;
.custom-placeholder::placeholder {
  font-family: 'Product Sans', sans-serif;
  font-weight: 400;
  color: #828282;
}
}

        }
      `}</style>
    </div>
  );
}
