import React, { useEffect, useState } from "react";
import { Button, Spinner, Form } from "react-bootstrap"; // Import Form for Form.Control and Form.Label
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import React-Toastify CSS

export default function App() { 
  const [spareparts, setSpareparts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [formData, setFormData] = useState(initialFormState()); // New state for form data
  const [errors, setErrors] = useState({}); // New state for validation errors

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default items per page

  // Initial form state function
  function initialFormState() {
    return {
      name: "",
      quantityPerVCI: "",
      notes: "",
      quantity: "", // Renamed from openingQty to quantity for clarity and consistent use
    };
  }

  useEffect(() => {
    fetchSpareparts();
  }, []);

  const fetchSpareparts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/spareparts");
      const fetchedData = response.data.data; // Capture the fetched data
      setSpareparts(fetchedData); // Update state
      setCurrentPage(1);
      return fetchedData; // <--- Crucial: Return the fetched data
    } catch (error) {
      console.error("Error fetching spareparts:", error);
      toast.error("Failed to fetch spare parts.");
      return []; // Return empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSpareparts();
  };

  // Generic handleChange for form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Client-side validation function
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Spare Part Name is required.";
    }
    if (!formData.quantityPerVCI || isNaN(formData.quantityPerVCI) || parseInt(formData.quantityPerVCI, 10) <= 0) {
      newErrors.quantityPerVCI = "Quantity per VCI must be a positive number.";
    }
    // Quantity is required for new parts and should be a non-negative number
    if (!formData.quantity || isNaN(formData.quantity) || parseInt(formData.quantity, 10) < 0) {
      newErrors.quantity = "Current Quantity must be a non-negative number.";
    }


    setErrors(newErrors);

    // Show toast messages for each client-side error
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach(errorMsg => {
        toast.error(errorMsg);
      });
      return false; // Indicate that there are errors
    }
    return true; // Indicate that there are no errors
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Run client-side validation
    if (!validateForm()) {
      return; // Stop if client-side validation fails
    }

    // Construct payload based on whether it's an edit or add
    const payload = {
      name: formData.name,
      quantityPerVCI: parseInt(formData.quantityPerVCI, 10),
      notes: formData.notes,

      quantity: parseInt(formData.quantity, 10),
    };


    try {
      if (editingPart) {
        // This PUT request should directly SET the quantity on the backend
        await axios.put(`http://localhost:8000/api/spareparts/${editingPart.id}`, payload);
      } else {
        await axios.post("http://localhost:8000/api/spareparts", payload);
      }

      await fetchSpareparts(); // Ensure fetch completes before closing form/showing success
      closeForm(); // Close form and reset states
      toast.success(`Spare part ${editingPart ? "updated" : "added"} successfully!`);
    } catch (error) {
      console.error("Error saving sparepart:", error);
      if (error.response && error.response.data) {
        const { message, errors: backendErrors } = error.response.data;

        let newErrors = {};
        if (backendErrors) {
          // Backend validation errors (e.g., Laravel's validation response)
          Object.keys(backendErrors).forEach(field => {
            const fieldErrors = backendErrors[field];
            if (Array.isArray(fieldErrors)) {
              newErrors[field] = fieldErrors[0]; // Set first error for UI feedback
              fieldErrors.forEach(msg => toast.error(msg)); // Show all as toasts
            } else {
              newErrors[field] = fieldErrors;
              toast.error(fieldErrors);
            }
          });
        } else if (message) {
          // General error message from the backend
          toast.error(`Failed to save spare part: ${message}`);
        } else {
          toast.error("Failed to save spare part. Please try again.");
        }
        setErrors(newErrors); // Set errors for red border on inputs
      } else {
        // Network error or no response from server
        toast.error("Failed to save spare part. Please check your network connection.");
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/spareparts/${id}`);
      setSpareparts(spareparts.filter((p) => p.id !== id));
      toast.success("Spare part deleted successfully!");
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
    // Populate form data for editing
    setFormData({
      name: part.name || "",
      quantityPerVCI: part.quantityPerVCI || "",
      notes: part.notes || "",
      quantity: part.quantity || "", // Now populating 'quantity' for edit mode
    });
    setShowForm(true);
    setErrors({}); // Clear errors when opening for edit
  };

  const openForm = () => {
    setEditingPart(null); // Ensure it's for adding new
    setFormData(initialFormState()); // Reset form data
    setShowForm(true);
    setErrors({}); // Clear errors
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPart(null);
    setFormData(initialFormState()); // Reset form data
    setErrors({}); // Clear errors
  };

  // --- Pagination Logic ---
  const totalSpareparts = spareparts.length;
  const totalPages = Math.ceil(totalSpareparts / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentSpareparts = spareparts.slice(startIndex, startIndex + pageSize);

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1); // Go to first page when page size changes
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

  // Styles for form inputs and error messages
  const errorStyle = {
    color: "#dc3545",
    fontSize: "13px",
    marginTop: "4px",
  };

  const getInputStyle = (fieldName) => ({
    width: "100%", // Adjusted to 100% for responsiveness within col-6
    height: "50px",
    fontFamily: "Product Sans, sans-serif",
    fontWeight: 400,
    fontSize: "16px",
    borderRadius: "4px",
    border: `1px solid ${errors[fieldName] ? "#dc3545" : "#D3DBD5"}`,
    backgroundColor: "#FFFFFF",
    color: "#212529",
  });

  const getTextAreaStyle = (fieldName) => ({
    width: "100%",
    minHeight: "100px", // Increased min-height for better usability
    fontFamily: "Product Sans, sans-serif",
    fontWeight: 400,
    fontSize: "16px",
    borderRadius: "4px",
    border: `1px solid ${errors[fieldName] ? "#dc3545" : "#D3DBD5"}`,
    backgroundColor: "#FFFFFF",
    color: "#212529",
    padding: "10px", // Add padding for text area
  });

  const handleQuantityPerVCIBlur = async (e) => {
    const quantityToDeduct = parseInt(e.target.value, 10);
    if (!editingPart) return;

    if (isNaN(quantityToDeduct) || quantityToDeduct <= 0) {
      toast.error("Please enter a valid positive number for Quantity per VCI to deduct stock.");
      return;
    }

    // Display a toast message informing about the action, instead of a blocking confirm
    toast.info(`Attempting to deduct ${quantityToDeduct} from "${editingPart.name}"...`, {
      autoClose: 2000,
      toastId: 'deductionInfo' // Use a unique ID to prevent duplicates if user blurs rapidly
    });

    try {
      const used_on = new Date().toISOString().split("T")[0];
      const res = await axios.post("http://localhost:8000/api/spareparts/use", {
        sparepart_id: editingPart.id,
        quantity_used: quantityToDeduct,
        used_on,
      });

      toast.success(res.data.message || "Stock updated successfully!");

      // Await the fetchSpareparts to ensure 'spareparts' state is fully updated
      const latestSpareparts = await fetchSpareparts();

      // Find the updated part from this fresh list
      const updatedPartInList = latestSpareparts.find(p => p.id === editingPart.id);

      if (updatedPartInList) {
        setFormData(prev => ({
          ...prev,
          quantity: updatedPartInList.quantity // Update form with the actual quantity from backend
        }));
        // Also update editingPart state so subsequent operations use latest quantity
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
    <div className="d-flex flex-column position-relative" style={{ height: "89vh", overflow: "hidden" }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <section className="px-4 py-3 border-bottom bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">
          Spare parts{" "}
          <span className="text-muted fw-normal">({totalSpareparts})</span>
        </h5>
        <div>
          <Button variant="light" className="me-2" onClick={handleRefresh}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <i className="bi bi-arrow-clockwise"></i>
            )}
          </Button>
          <Button variant="success" onClick={openForm}>
            <i className="bi bi-plus-lg me-1"></i> Add New
          </Button>
        </div>
      </section>

      <div
        className="d-flex px-4 align-items-center"
        style={{
          backgroundColor: "#f2f2f2",
          height: "60px",
          fontWeight: 700,
          color: "#393C3A",
          fontFamily: "Product Sans, sans-serif",
          borderBottom: "1px solid #ccc",
          fontSize: "18px",
        }}
      >
        <div style={{ width: "80px" }}>S.No</div>
        <div style={{ flex: 3 }}>Spare Part Name</div>
        <div style={{ flex: 2 }}>Current Qty</div> {/* Changed to Current Qty */}
        <div style={{ flex: 2 }}>Action</div>
      </div>

      <div className="flex-grow-1 overflow-auto bg-white">
        {loading ? (
          <div className="text-center mt-4">
            <Spinner animation="border" />
          </div>
        ) : currentSpareparts.length === 0 ? (
          <div className="d-flex flex-column justify-content-center align-items-center h-100">
            <img src="https://placehold.co/160x160/E0E0E0/333333?text=No+Data" alt="Empty" style={{ width: "160px" }} className="mb-2" />
            <p className="mt-3 text-muted">
              {spareparts.length === 0
                ? "No spare parts found."
                : "No spare parts found on this page."}
            </p>
          </div>
        ) : (
          currentSpareparts.map((part, index) => (
            <div
              key={part.id}
              className="d-flex px-4 align-items-center"
              style={{
                height: "65px",
                fontFamily: "Product Sans, sans-serif",
                fontWeight: 400,
                color: "#212529",
                fontSize: "18px",
                borderBottom: "1px solid #DEE2E6",
                backgroundColor: (startIndex + index) % 2 === 0 ? "#FAFAFA" : "#fff", // Alternating row colors
              }}
            >
              <div style={{ width: "80px" }}>{startIndex + index + 1}</div>
              <div style={{ flex: 3 }}>{part.name}</div>
              <div style={{ flex: 2 }}>{part.quantity}</div>
              <div style={{ flex: 2 }}>
                <i
                  className="bi bi-pencil-square text-primary me-3"
                  title="Edit"
                  role="button"
                  onClick={() => handleEdit(part)}
                  style={{ fontSize: "1.3rem", cursor: "pointer" }}
                ></i>
                <i
                  className="bi bi-trash text-danger"
                  title="Delete"
                  role="button"
                  onClick={() => handleDelete(part.id)}
                  style={{ fontSize: "1.3rem", cursor: "pointer" }}
                ></i>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls - Placed below the table, outside the scrollable area */}
      {!loading && spareparts.length > 0 && (
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
              {totalSpareparts === 0
                ? "0-0"
                : `${startIndex + 1}-${Math.min(
                    startIndex + pageSize,
                    totalSpareparts
                  )}`}
            </span>
            <Button
              variant="link"
              className="pagination-arrow-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalSpareparts === 0}
            >
              <i className="bi bi-chevron-right"></i>
            </Button>
          </div>
        </div>
      )}

      <div className={drawerClass} style={{
        position: "absolute", // Ensure it's positioned relative to its parent
        top: 0,
        width: "600px",
        height: "100%",
        backgroundColor: "#fff",
        boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
        zIndex: 1050,
        padding: "30px",
        overflowY: "auto",
        borderLeft: "1px solid #dee2e6"
      }}>
        <div className="d-flex justify-content-between align-items-start mb-4">
          <h5 className="fw-bold mb-0">{editingPart ? "Edit Spare Part" : "Add New Spare Part"}</h5>
          <button onClick={closeForm} style={{
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
          }}>
            &times;
          </button>
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
                onBlur={handleQuantityPerVCIBlur} // Keep onBlur for stock deduction
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
                isInvalid={!!errors.notes} // Added validation for notes if needed, though not in original
                style={getTextAreaStyle("notes")}
              />
              <Form.Control.Feedback type="invalid" style={errorStyle}>
                {errors.notes}
              </Form.Control.Feedback>
            </div>
            {/* Quantity field - now always visible, but readOnly if editing */}
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
                readOnly={editingPart ? true : false} // Make readOnly if editing
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

      {/* Styling */}
      <style>{`
        .slide-in {
          position: absolute;
          right: 0;
          transition: right 0.4s ease-in-out;
        }
        .slide-out {
          position: absolute;
          right: -600px;
          transition: right 0.4s ease-in-out;
        }

        /* Custom style to remove blue border/glow */
        .form-control:focus {
          border-color: #CED4DA !important;
          box-shadow: none !important;
        }

        .form-control:valid {
          border-color: #CED4DA !important;
          box-shadow: none !important;
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

        /* Hide Bootstrap's default invalid feedback icon */
        .form-control.is-invalid ~ .invalid-feedback {
          display: block; /* Ensure it's visible */
        }
      `}</style>
    </div>
  );
}
