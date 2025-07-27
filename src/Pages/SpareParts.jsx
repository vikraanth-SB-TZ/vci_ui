import { useEffect, useState, useRef } from "react";
import { Button, Spinner, Form } from "react-bootstrap";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";

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
      quantityPerVCI: "",
      notes: "",
      quantity: "",
    };
  }

  useEffect(() => {
    fetchSpareparts();
  }, []);

  useEffect(() => {
    // Destroy DataTable before re-initializing
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }
    // Initialize DataTable only if data is loaded and available
    if (!loading && spareparts.length > 0) {
      $(tableRef.current).DataTable({
        ordering: true,
        paging: true,
        searching: true,
        lengthChange: true,
        columnDefs: [{ targets: 0, className: "text-center" }],
      });
    }
  }, [spareparts, loading]);

  const fetchSpareparts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/spareparts");
      const fetchedData = response.data.data;
      setSpareparts(fetchedData);
      return fetchedData;
    } catch (error) {
      console.error("Error fetching spareparts:", error);
      toast.error("Failed to fetch spare parts.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Refresh logic: disables button, shows spinner, reloads data
  const handleRefresh = async () => {
    setLoading(true);
    await fetchSpareparts();
    setLoading(false);
    toast.success("Spare parts list refreshed!");
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
    if (!formData.quantityPerVCI || isNaN(formData.quantityPerVCI) || parseInt(formData.quantityPerVCI, 10) <= 0) {
      newErrors.quantityPerVCI = "Quantity per VCI must be a positive number.";
    }
    if (!formData.quantity || isNaN(formData.quantity) || parseInt(formData.quantity, 10) < 0) {
      newErrors.quantity = "Current Quantity must be a non-negative number.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }
    const payload = {
      name: formData.name,
      quantityPerVCI: parseInt(formData.quantityPerVCI, 10),
      notes: formData.notes,
      quantity: parseInt(formData.quantity, 10),
    };
    try {
      if (editingPart) {
        await axios.put(`http://localhost:8000/api/spareparts/${editingPart.id}`, payload);
      } else {
        await axios.post("http://localhost:8000/api/spareparts", payload);
      }
      await fetchSpareparts();
      closeForm(); // Close the form after successful submission
      toast.success(`Spare part ${editingPart ? "updated" : "added"} successfully!`);
    } catch (error) {
      console.error("Error saving sparepart:", error);
      if (error.response && error.response.data) {
        const { message, errors: backendErrors } = error.response.data;
        let newErrors = {};
        if (backendErrors) {
          Object.keys(backendErrors).forEach(field => {
            const fieldErrors = backendErrors[field];
            if (Array.isArray(fieldErrors)) {
              newErrors[field] = fieldErrors[0];
              fieldErrors.forEach(msg => toast.error(msg));
            } else {
              newErrors[field] = fieldErrors;
              toast.error(fieldErrors);
            }
          });
        } else if (message) {
          toast.error(`Failed to save spare part: ${message}`);
        } else {
          toast.error("Failed to save spare part. Please try again.");
        }
        setErrors(newErrors);
      } else {
        toast.error("Failed to save spare part. Please check your network connection.");
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/spareparts/${id}`);
      setSpareparts(spareparts.filter((p) => p.id !== id));
      toast.success("Spare part deleted successfully!");
      // If the deleted part was being edited, close the form
      if (editingPart && editingPart.id === id) {
        closeForm();
      }
    } catch (error) {
      console.error("Error deleting:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Failed to delete spare part: ${error.response.data.message}`);
      } else {
        toast.error("Failed to delete spare part.");
      }
    }
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setFormData({
      name: part.name || "",
      quantityPerVCI: part.quantityPerVCI || "",
      notes: part.notes || "",
      quantity: part.quantity || "",
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

  const handleQuantityPerVCIBlur = async (e) => {
    const quantityToDeduct = parseInt(e.target.value, 10);
    if (!editingPart || isNaN(quantityToDeduct) || quantityToDeduct <= 0) return;
    if (editingPart.quantityPerVCI === quantityToDeduct && formData.quantityPerVCI === String(quantityToDeduct)) {
      return;
    }
    toast.info(`Attempting to deduct ${quantityToDeduct} from "${editingPart.name}"...`, {
      autoClose: 2000,
      toastId: 'deductionInfo'
    });
    try {
      const used_on = new Date().toISOString().split("T")[0];
      const res = await axios.post("http://localhost:8000/api/spareparts/use", {
        sparepart_id: editingPart.id,
        quantity_used: quantityToDeduct,
        used_on,
      });
      toast.success(res.data.message || "Stock updated successfully!");
      const latestSpareparts = await fetchSpareparts();
      const updatedPartInList = latestSpareparts.find(p => p.id === editingPart.id);
      if (updatedPartInList) {
        setFormData(prev => ({
          ...prev,
          quantity: updatedPartInList.quantity
        }));
        setEditingPart(updatedPartInList);
      } else {
        console.warn("Updated part not found in fetched list after deduction.");
      }
    } catch (err) {
      console.error("Error using sparepart:", err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Error using spare part.");
      }
    }
  };

  const drawerClass = showForm ? "slide-in" : "slide-out";

  return (
    <div className="vh-80 d-flex flex-column position-relative bg-light">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white">
        <h5 className="mb-0 fw-bold">Spare parts ({spareparts.length})</h5>
        <div>
          <Button
            variant="outline-secondary"
            size="sm"
            className="me-2"
            onClick={handleRefresh}
            disabled={loading}
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
        <div style={{ minWidth: "700px" }}>
          <table ref={tableRef} className="table custom-table" style={{ minWidth: "700px", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "center", width: "70px" }}>S.No</th>
                <th style={{ width: "auto" }}>Spare Part Name</th>
                <th style={{ width: "150px" }}>Current Qty</th>
                <th style={{ width: "120px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : spareparts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    No spare parts found.
                  </td>
                </tr>
              ) : (
                spareparts.map((part, index) => (
                  <tr key={part.id}>
                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                    <td style={{ wordBreak: "break-word" }}>{part.name}</td>
                    <td>{part.quantity}</td>
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
          top: 0,
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
                  name="quantityPerVCI"
                  value={formData.quantityPerVCI}
                  onChange={handleChange}
                  className="custom-placeholder"
                  placeholder="Enter quantity per VCI"
                  isInvalid={!!errors.quantityPerVCI}
                  style={getInputStyle("quantityPerVCI")}
                  onBlur={handleQuantityPerVCIBlur}
                />
                <Form.Control.Feedback type="invalid" style={errorStyle}>
                  {errors.quantityPerVCI}
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
              <div className="mb-3 col-6">
                <Form.Label className="mb-1" style={{ color: "#393C3AE5", fontFamily: "Product Sans, sans-serif", fontWeight: 400 }}>
                  {editingPart ? "Current Quantity" : "Opening Stock"}
                </Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="custom-placeholder"
                  placeholder={editingPart ? "Current Quantity" : "Enter Opening Quantity"}
                  isInvalid={!!errors.quantity}
                  style={getInputStyle("quantity")}
                  readOnly={editingPart ? true : false}
                />
                <Form.Control.Feedback type="invalid" style={errorStyle}>
                  {errors.quantity}
                </Form.Control.Feedback>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: "20px", right: "30px" }}>
              <Button
                type="submit"
                variant="success"
                style={{ width: "179px", height: "50px", borderRadius: "6px" }}
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
      `}</style>
    </div>
  );
}