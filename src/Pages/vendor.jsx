import React, { useState, useEffect } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import axios from "axios";

export default function Vendor() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialForm());
  const [isEditing, setIsEditing] = useState(false);
  const [states, setStates] = useState([]); // Corrected: Moved inside the component
  const [districts, setDistricts] = useState([]); // Corrected: Moved inside the component

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
    fetchVendors();
    fetchStates();
    fetchDistricts();
  }, []);

  const fetchVendors = () => {
    setLoading(true);
    axios
      .get("/api/vendors")
      .then((res) => {
        setVendors(res.data.data || res.data);
      })
      .catch((err) => {
        console.error("Error fetching vendors", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

const fetchStates = () => {
  axios.get("/api/states")
    .then((res) => {
      console.log("States API response:", res.data);
      setStates(res.data);
    })
    .catch((err) => console.error("Error fetching states", err));
};

const fetchDistricts = () => {
  axios.get("/api/districts")
    .then((res) => {
      console.log("Districts API response:", res.data);
      setDistricts(res.data);
    })
    .catch((err) => console.error("Error fetching districts", err));
};
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
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
        fetchVendors();
        closeForm();
      })
      .catch((err) => {
        console.error("Save failed", err);
        alert("Failed to save vendor");
      });
  };

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
      state: vendor.state_id || "",
      district: vendor.district_id || "",
      pincode: vendor.pincode || "",
      gst: vendor.gst_no || "",
      dob: vendor.date_of_birth || "",
    });
    setIsEditing(true);
    setShowForm(true);
  };

  // const handleDelete = (id) => {
  //   if (window.confirm("Are you sure you want to delete this vendor?")) {
  //     axios
  //       .delete(`/api/vendors/${id}`)
  //       .then(() => fetchVendors())
  //       .catch((err) => console.error("Delete failed", err));
  //   }
  // };

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
        <h5 className="mb-0 fw-bold">Vendor</h5>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={fetchVendors}>
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
            ) : vendors.length === 0 ? (
              <div
                className="d-flex flex-column justify-content-center align-items-center"
                style={{ height: "calc(80vh - 160px)", width: "100%" }}
              >
                <img src="/empty-box.png" alt="Empty" style={{ width: "160px" }} />
              </div>
            ) : (
              vendors.map((vendor, index) => (
                <div
                  key={vendor.id}
                  className="px-4 py-2 border-bottom d-flex bg-white align-items-center small"
                >
                  <div style={{ width: "80px" }}>{index + 1}</div>
                  <div style={{ flex: 2 }}>
                    {`${vendor.first_name || ""} ${vendor.last_name || ""}`}
                  </div>
                  <div style={{ flex: 2 }}>{vendor.mobile}</div>
                  <div style={{ flex: 2 }}>{vendor.email}</div>
                  <div style={{ flex: 2 }}>{vendor.gender}</div>
                  <div style={{ flex: 2 }}>{vendor.company_name}</div>
                  <div style={{ flex: 2 }}>{vendor.address}</div>
                  <div style={{ flex: 2 }}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-1"
                      onClick={() => handleEdit(vendor)}
                    >
                      <i className="bi bi-pencil-square me-1"></i>
                    </Button>
                    {/* <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(vendor.id)}
                    >
                      <i className="bi bi-trash me-1"></i>
                    </Button> */}
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
                              className="custom-dropdown"

            //   className="custom-placeholder"

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
        <div className="row gx-2"> {/* Added a row for consistent layout */}
          {[
            { name: "company_name", label: "Company Name" },
            { name: "address" },
            { name: "city" },
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

          {/* Custom Select for State */}
          <div className="col-6 mb-2">
            <Form.Label className="mb-1" style={{ color: "#393C3AE5", fontFamily: "Product Sans, sans-serif", fontWeight: 400 }}>
              State
            </Form.Label>
<Form.Select
  name="state"
  value={formData.state}
  onChange={handleChange}
  size="sm"
  className="custom-dropdown"
>
  <option value="">Select State</option>
  {states.map((state) => (
    <option key={state.id} value={state.id}>
      {state.states}
    </option>
  ))}
</Form.Select>

          </div>

          {/* Custom Select for District */}
          <div className="col-6 mb-2">
            <Form.Label className="mb-1" style={{ color: "#393C3AE5", fontFamily: "Product Sans, sans-serif", fontWeight: 400 }}>
              District
            </Form.Label>
            <Form.Select
              name="district"
              value={formData.district}
              onChange={handleChange}
              size="sm"
                className="custom-dropdown"

              style={{
                fontFamily: "Product Sans, sans-serif",
                fontWeight: 400,
              }}
            >
              <option value="">Select District</option>
              {districts.map((district) => (
<option key={district.id} value={district.id}>
  {district.districts}
</option>
              ))}
            </Form.Select>
          </div>
        </div> {/* Closing tag for the row added */}

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
        }
        .custom-placeholder::placeholder {
          font-family: 'Product Sans', sans-serif;
          font-weight: 400;
          color: #828282;
        }
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

      `}</style>
    </div>
  );
}