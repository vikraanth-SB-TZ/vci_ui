import { useEffect, useState, useRef } from "react";
import { Button, Spinner, Form } from "react-bootstrap";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";

const CustomDropdown = ({ name, value, onChange, options, isInvalid, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (optionValue) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedLabel = options.find(option => option.value === value)?.label || "Select Status";

  return (
    <div ref={dropdownRef} className="custom-dropdown-container">
      <div
        className={`custom-dropdown-toggle ${isOpen ? 'active' : ''} ${isInvalid ? 'is-invalid' : ''}`}
        onClick={handleToggle}
        style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <span className="selected-value">{selectedLabel}</span>
        <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'} custom-dropdown-arrow`}></i>
      </div>
      {isOpen && (
        <div className="custom-dropdown-menu">
          {options.map((option) => (
            <div
              key={option.value}
              className="custom-dropdown-item"
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      {isInvalid && <div className="invalid-feedback" style={{ color: "#dc3545", fontSize: "13px", marginTop: "4px", display: 'block' }}>{error}</div>}
    </div>
  );
};

export default function App() {
  const [spareparts, setSpareparts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [formData, setFormData] = useState(initialFormState());
  const [errors, setErrors] = useState({});
  const tableRef = useRef(null);

  function initialFormState() {
    return {
      name: "",
      quantity_per_vci: "",
      notes: "",
      quantity: "",
      is_active: "Enable",
    };
  }

  useEffect(() => {
    fetchSpareparts();
  }, []);

  useEffect(() => {
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }

    if (spareparts.length > 0) {
      $(tableRef.current).DataTable({
        ordering: true,
        paging: true,
        searching: true,
        lengthChange: true,
        columnDefs: [{ targets: 0, className: "text-center" }],
      });
    }
  }, [spareparts]);

  const fetchSpareparts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/spareparts");
      const fetchedData = response.data.data;
      setSpareparts(fetchedData);
      return fetchedData;
    } catch (error) {
      console.error("Error fetching spareparts:", error);
      if (showForm) toast.error("Failed to fetch spare parts.", { toastId: "fetch-fail" });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Spare Part Name is required.";
    }

    if (!editingPart) {
      if (!formData.quantity || isNaN(formData.quantity) || parseInt(formData.quantity, 10) < 0) {
        newErrors.quantity = "Opening Stock must be a non-negative number.";
      }
      if (formData.quantity_per_vci === "" || isNaN(formData.quantity_per_vci) || parseInt(formData.quantity_per_vci, 10) <= 0) {
        newErrors.quantity_per_vci = "Quantity per VCI must be a positive number.";
      }
      if (!formData.is_active || !["Enable", "Disable"].includes(formData.is_active)) {
        newErrors.is_active = "Status must be Enable or Disable.";
      }
    } else {
      if (formData.quantity && (isNaN(formData.quantity) || parseInt(formData.quantity, 10) < 0)) {
        newErrors.quantity = "Quantity to add must be a non-negative number.";
      }
      if (formData.quantity_per_vci && (isNaN(formData.quantity_per_vci) || parseInt(formData.quantity_per_vci, 10) <= 0)) {
        newErrors.quantity_per_vci = "Quantity per VCI must be a non-negative number.";
      }
    }
    return newErrors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fill in all required fields correctly.", { toastId: "form-validation" });
      return;
    }

    let payload = {
      name: formData.name,
      notes: formData.notes,
      is_active: formData.is_active
    };

    if (editingPart) {
      if (formData.quantity) {
        payload.quantity = parseInt(formData.quantity, 10);
      }
      if (formData.quantity_per_vci) {
        payload.quantity_per_vci = parseInt(formData.quantity_per_vci, 10);
      }
    } else {
      payload.quantity = parseInt(formData.quantity, 10);
      payload.quantity_per_vci = parseInt(formData.quantity_per_vci, 10);
    }

    try {
      if (editingPart) {
        await axios.put(`http://localhost:8000/api/spareparts/${editingPart.id}`, payload);
      } else {
        await axios.post("http://localhost:8000/api/spareparts", payload);
      }

      toast.success(`Spare part ${editingPart ? "updated" : "added"} successfully!`, {
        toastId: "save-success",
      });

      closeForm();
      localStorage.setItem("sparepart_refresh", "true");
      window.location.reload();
    } catch (error) {
      console.error("Error saving sparepart:", error);
      if (error.response && error.response.data) {
        const { message, errors: backendErrors } = error.response.data;
        let newErrors = {};
        if (backendErrors) {
          Object.keys(backendErrors).forEach((field) => {
            const fieldErrors = backendErrors[field];
            if (Array.isArray(fieldErrors)) {
              newErrors[field] = fieldErrors[0];
              fieldErrors.forEach((msg) =>
                toast.error(msg, { toastId: `err-${field}-${msg}` })
              );
            } else {
              newErrors[field] = fieldErrors;
              toast.error(fieldErrors, {
                toastId: `err-${field}-${fieldErrors}`,
              });
            }
          });
        } else if (message) {
          toast.error(`Failed to save spare part: ${message}`, {
            toastId: "save-fail",
          });
        } else {
          toast.error("Failed to save spare part.", { toastId: "save-fail2" });
        }
        setErrors(newErrors);
      } else {
        toast.error("Failed to save spare part.", { toastId: "network-fail" });
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/spareparts/${id}`);

      toast.success("Spare part deleted successfully!", { toastId: "delete-success" });

      if (editingPart && editingPart.id === id) {
        closeForm();
      }

      localStorage.setItem("sparepart_refresh", "true");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting:", error);
      if (error.response?.data?.message) {
        toast.error(`Failed to delete spare part: ${error.response.data.message}`, { toastId: "delete-fail" });
      } else {
        toast.error("Failed to delete spare part.", { toastId: "delete-fail2" });
      }
    }
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setFormData({
      name: part.name || "",
      quantity_per_vci: part.quantity_per_vci || "",
      notes: part.notes || "",
      quantity: "", // Reset on edit
      is_active: part.is_active || "Enable"
    });
    setShowForm(true);
    setErrors({});
  };

  const openForm = () => {
    setEditingPart(null);
    setFormData(initialFormState());
    setShowForm(true);
    setErrors({});
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPart(null);
    setFormData(initialFormState());
    setErrors({});
  };

  const errorStyle = {
    color: "#dc3545",
    fontSize: "13px",
    marginTop: "4px",
  };

  const getInputStyle = (fieldName) => ({
    width: "100%",
    height: "50px",
    fontFamily: "Product Sans, sans-serif",
    fontWeight: 400,
    fontSize: "16px",
    borderRadius: "4px",
    border: `1px solid ${errors[fieldName] ? "#dc3545" : "#D3DBD5"}`,
    backgroundColor: "#FFFFFF",
    color: "#212529",
    padding: "0 10px",
  });

  const getTextAreaStyle = (fieldName) => ({
    width: "100%",
    minHeight: "100px",
    fontFamily: "Product Sans, sans-serif",
    fontWeight: 400,
    fontSize: "16px",
    borderRadius: "4px",
    border: `1px solid ${errors[fieldName] ? "#dc3545" : "#D3DBD5"}`,
    backgroundColor: "#FFFFFF",
    color: "#212529",
    padding: "10px",
  });
  
  const drawerClass = showForm ? "slide-in" : "slide-out";

  const statusOptions = [
    { value: "Enable", label: "Enable" },
    { value: "Disable", label: "Disable" },
  ];

  return (
    <>
      <div className="vh-80 d-flex flex-column position-relative bg-light">
        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white">
          <h5 className="mb-0 fw-bold">Spare parts ({spareparts.length})</h5>
          <div>
            <Button
              variant="outline-secondary"
              size="sm"
              className="me-2"
              onClick={() => {
                if (!loading) fetchSpareparts();
              }}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <i className="bi bi-arrow-clockwise"></i>
              )}
            </Button>
            <Button variant="success" size="sm" onClick={openForm}>
              + Add New
            </Button>
          </div>
        </div>
        <div className="flex-grow-1 px-4 py-3" style={{ overflowX: "auto", overflowY: "auto" }}>
          <div style={{ minWidth: "900px" }}>
            <table ref={tableRef} className="table custom-table" style={{ minWidth: "900px", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "center", width: "70px" }}>S.No</th>
                  <th>Spare Part Name</th>
                  <th style={{ width: "150px" }}>Current Qty</th>
                  <th style={{ width: "150px" }}>Quantity per VCI</th>
                  <th style={{ width: "250px" }}>Notes</th>
                  <th style={{ width: "120px" }}>Status</th>
                  <th style={{ width: "120px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <Spinner animation="border" />
                    </td>
                  </tr>
                ) : spareparts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No spare parts found.
                    </td>
                  </tr>
                ) : (
                  spareparts.map((part, index) => (
                    <tr key={part.id}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td style={{ wordBreak: "break-word" }}>{part.name}</td>
                      <td>{part.quantity}</td>
                      <td>{part.quantity_per_vci}</td>
                      <td>{part.notes || "-"}</td>
                      <td>
                       <span className={`badge ${part.is_active === 'Enable' ? 'bg-success' : 'bg-danger'}`}>
  {part.is_active}
</span>

                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleEdit(part)}
                        >
                          <i className="bi bi-pencil-square me-1"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(part.id)}
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
        </div>
        {showForm && (
          <div className={drawerClass} style={{
            position: "fixed",
            top: "63px",
            right: 0,
            width: "600px",
            height: "100vh",
            backgroundColor: "#fff",
            boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
            zIndex: 2000,
            padding: "30px",
            overflowY: "auto",
            borderLeft: "1px solid #dee2e6"
          }}>
            <div className="d-flex justify-content-between align-items-start mb-4">
              <h5 className="fw-bold mb-0">{editingPart ? "Edit Spare Part" : "Add New Spare Part"}</h5>
              <Button
                variant="light"
                onClick={closeForm}
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
                  padding: 0
                }}
                tabIndex={0}
              >
                &times;
              </Button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="row">
                <div className="mb-3 col-6">
                  <Form.Label className="mb-1" style={{ color: "#393C3AE5", fontFamily: "Product Sans, sans-serif", fontWeight: 400 }}>Spare Part Name</Form.Label>
                    <span style={{ color: "red", marginLeft: "5px" }}>*</span>

                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="custom-placeholder"
                    placeholder="Enter Name"
                    isInvalid={!!errors.name}
                    style={getInputStyle("name")}
                  />
                  <Form.Control.Feedback type="invalid" style={errorStyle}>
                    {errors.name}
                  </Form.Control.Feedback>
                </div>
                <div className="mb-3 col-6">
                  <Form.Label className="mb-1" style={{ color: "#393C3AE5", fontFamily: "Product Sans, sans-serif", fontWeight: 400 }}>Quantity per VCI</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity_per_vci"
                    value={formData.quantity_per_vci}
                    onChange={handleChange}
                    className="custom-placeholder"
                    placeholder="Enter quantity per VCI"
                    isInvalid={!!errors.quantity_per_vci}
                    style={getInputStyle("quantity_per_vci")}
                  />
                  <Form.Control.Feedback type="invalid" style={errorStyle}>
                    {errors.quantity_per_vci}
                  </Form.Control.Feedback>
                </div>
                <div className="mb-3 col-12">
                  <Form.Label className="mb-1" style={{ color: "#393C3AE5", fontFamily: "Product Sans, sans-serif", fontWeight: 400 }}>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="custom-placeholder"
                    rows="4"
                    placeholder="Enter any notes"
                    isInvalid={!!errors.notes}
                    style={getTextAreaStyle("notes")}
                  />
                  <Form.Control.Feedback type="invalid" style={errorStyle}>
                    {errors.notes}
                  </Form.Control.Feedback>
                </div>
                <div className="row">
                  <div className="mb-3 col-6">
                    {editingPart ? (
                      <>
                        <Form.Label className="mb-1" style={{ color: "#393C3AE5", fontFamily: "Product Sans, sans-serif", fontWeight: 400 }}>
                          <span style={{ color: "red", marginLeft: "5px" }}>*</span>

                          Current Stock
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={editingPart.quantity}
                          readOnly
                          style={{
                            ...getInputStyle("quantity"),
                            backgroundColor: "#e9ecef",
                            cursor: "not-allowed"
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <Form.Label className="mb-1" style={{ color: "#393C3AE5", fontFamily: "Product Sans, sans-serif", fontWeight: 400 }}>
                        Opening Stock<span style={{ color: "red", marginLeft: "5px" }}>*</span>

                          
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleChange}
                          className="custom-placeholder"
                          placeholder="Enter Opening Quantity"
                          isInvalid={!!errors.quantity}
                          style={getInputStyle("quantity")}
                        />
                        <Form.Control.Feedback type="invalid" style={errorStyle}>
                          {errors.quantity}
                        </Form.Control.Feedback>
                      </>
                    )}
                  </div>

                  <div className="mb-3 col-6">
                    <Form.Label className="mb-1" style={{ color: "#393C3AE5", fontFamily: "Product Sans, sans-serif", fontWeight: 400 }}>
                      Status<span style={{ color: "red", marginLeft: "5px" }}>*</span>
                    </Form.Label>
                    <CustomDropdown
                      name="is_active"
                      value={formData.is_active}
                      onChange={handleChange}
                      options={statusOptions}
                      isInvalid={!!errors.is_active}
                      error={errors.is_active}
                    />
                  </div>
                </div>
              </div>
                    <div
  className="save-button-footer"
>
  <Button
    type="submit"
    variant="success"
    style={{ width: "20%", height: "50px", borderRadius: "6px", right: "0px", position: "sticky", bottom: "0" }}
  >
    {editingPart ? "Update" : "Save"}
  </Button>
</div>	
            </form>
          </div>
        )}
        <style>{`
          .slide-in {
            position: fixed;
            top: 0;
            right: 0;
            width: 600px;
            height: 100vh;
            transition: right 0.4s ease-in-out;
            z-index: 2000;
          }

          .slide-out {
            position: fixed;
            top: 0;
            right: -600px;
            width: 600px;
            height: 100vh;
            transition: right 0.4s ease-in-out;
            z-index: 2000;
          }

          .custom-table th, .custom-table td {
            font-weight: 400;
            font-size: 16px;
            color: #212529;
            white-space: normal;
          }

          .flex-grow-1 {
            overflow-x: auto !important;
          }

          .custom-placeholder::placeholder {
            font-family: 'Product Sans', sans-serif;
            font-weight: 400;
            color: #828282;
          }

          .form-control:focus {
            border-color: #CED4DA !important;
            box-shadow: none !important;
          }

          .form-control:valid {
            border-color: #CED4DA !important;
            box-shadow: none !important;
          }

          .form-control.is-invalid ~ .invalid-feedback {
            display: block;
          }

          /* New Custom Dropdown Styles */
          .custom-dropdown-container {
            position: relative;
            width: 100%;
            height: 50px; /* Set a fixed height for consistency */
          }

          .custom-dropdown-toggle {
            height: 100%;
            font-family: "Product Sans, sans-serif";
            font-weight: 400;
            font-size: 16px;
            border-radius: 4px;
            border: 1px solid #D3DBD5;
            background-color: #FFFFFF;
            color: #212529;
            padding: 0 10px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .custom-dropdown-toggle.is-invalid {
            border-color: #dc3545;
          }

          .custom-dropdown-toggle .selected-value {
            line-height: 1.5;
            flex-grow: 1;
            padding-right: 1rem;
          }
          
          .custom-dropdown-arrow {
            font-size: 1rem;
            color: #6c757d;
            transition: transform 0.2s ease-in-out;
          }

          .custom-dropdown-toggle.active .custom-dropdown-arrow {
            transform: rotate(180deg);
          }

          .custom-dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            z-index: 1000;
            background-color: #fff;
            border-radius: 4px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            margin-top: 5px;
            overflow: hidden;
          }

          .custom-dropdown-item {
            padding: 10px 15px;
            cursor: pointer;
            font-family: "Product Sans, sans-serif";
            font-weight: 400;
            font-size: 16px;
            color: #212529;
          }

          .custom-dropdown-item:hover {
            background-color: #f1f1f1;
          }
        `}</style>
      </div>
    </>
  );
}