import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button, Spinner, Form } from "react-bootstrap";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import { BsDashLg } from "react-icons/bs";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import MiniCalendar from "./MiniCalendar";
import { API_BASE_URL } from "../api";


const getBlueBorderStyles = (value, isInvalid) => {
  if (isInvalid) {
    return { borderColor: "#dc3545" };
  }
  if (value) {
    return { borderColor: "none" };
  }
  return {};
};

const getTableInputStyles = (value, isInvalid) => {
  if (isInvalid) {
    return { borderColor: "#dc3545" };
  }
  if (value) {
    return { borderColor: "none" };
  }
  return {};
};

export default function ReturnSparePartsPage() {
  const [vendors, setVendors] = useState([]);
  const [batches, setBatches] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [availableSpareparts, setAvailableSpareparts] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const MySwal = withReactContent(Swal);
  const [sparePartsRows, setSparePartsRows] = useState([{ sparepart_id: "", quantity: "" }]);
  const [returnDate, setReturnDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  // const [returnDate, setReturnDate] = useState("");
  const [showReturnCalendar, setShowReturnCalendar] = useState(false);

  const dateInputRef = useRef();
  const [editingReturn, setEditingReturn] = useState(null);

  const [formData, setFormData] = useState({
    vendor_id: "",
    batch_id: "",
    invoiceNo: "",
    notes: ""
  });

  const [invoiceSpareparts, setInvoiceSpareparts] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const tableRef = useRef(null);
  const dataTableInstance = useRef(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [vendorsRes, batchesRes, purchasesRes, sparepartsRes, returnsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/vendors`, { headers: { Accept: "application/json" } }),
        axios.get(`${API_BASE_URL}/batches`, { headers: { Accept: "application/json" } }),
        axios.get(`${API_BASE_URL}/sparepart-purchases`, { headers: { Accept: "application/json" } }),
        axios.get(`${API_BASE_URL}/spareparts`, { headers: { Accept: "application/json" } }),
        axios.get(`${API_BASE_URL}/sparepart-returns`, { headers: { Accept: "application/json" } }),
      ]);

      setVendors(vendorsRes.data.data ?? vendorsRes.data ?? []);
      setBatches(batchesRes.data.batches ?? batchesRes.data.data ?? batchesRes.data ?? []);
      setPurchases(purchasesRes.data.data ?? purchasesRes.data ?? []);
      setAvailableSpareparts(sparepartsRes.data.data ?? sparepartsRes.data ?? []);
      setReturns(returnsRes.data.data ?? returnsRes.data ?? []);

    } catch (err) {
      console.error("Error loading initial data:", err);
      toast.error("Failed to load data. Please check the server connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (dataTableInstance.current) {
      dataTableInstance.current.destroy();
      dataTableInstance.current = null;
    }

    if (!loading && returns.length > 0 && tableRef.current) {
      dataTableInstance.current = $(tableRef.current).DataTable({
        ordering: true,
        paging: true,
        searching: true,
        lengthChange: true,
        columnDefs: [{ targets: 0, className: "text-center" }],
      });
    }
  }, [returns, loading]);

  useEffect(() => {
    if (formData.invoiceNo) {
      const selectedPurchase = purchases.find(p => String(p.invoice_no) === String(formData.invoiceNo));
      if (selectedPurchase && selectedPurchase.items) {
        const sparepartItems = selectedPurchase.items.map(item => availableSpareparts.find(sp => sp.id === item.sparepart_id));
        setInvoiceSpareparts(sparepartItems.filter(item => item !== undefined));
      } else {
        setInvoiceSpareparts([]);
      }
    } else {
      setInvoiceSpareparts([]);
    }
  }, [formData.invoiceNo, purchases, availableSpareparts]);

  const handleAddRow = () => {
    setSparePartsRows((rows) => [...rows, { sparepart_id: "", quantity: "" }]);
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
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });

    setFormErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[`${field}-${index}`];

      // If user is filling anything in rows, clear the general error too
      if (field === "sparepart_id" || field === "quantity") {
        delete newErrors.items;
      }

      return newErrors;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleReturnDateChange = (e) => {
    const { value } = e.target;
    setReturnDate(value);
    setFormErrors((prev) => ({ ...prev, return_date: "" }));
  };

  const validateForm = (payload, items) => {
    let errors = {};

    if (!payload.vendor_id) {
      errors.vendor_id = "Vendor is required.";
    }

    if (!payload.invoice_no) {
      errors.invoiceNo = "Invoice No. is required.";
    }

    if (!payload.return_date) {
      errors.return_date = "Return Date is required.";
    }
    
    if (!payload.batch_id) {
      errors.batch_id = "Batch is required.";
    }

    if (
      items.length === 0 ||
      items.every(item => !item.sparepart_id || !parseInt(item.quantity))
    ) {
      errors.items = "Please add at least one spare part with a quantity.";
    } else {
      const selectedInvoice = purchases.find(p => String(p.invoice_no) === String(payload.invoice_no));
      const purchasedSparepartIds = selectedInvoice ? selectedInvoice.items.map(item => String(item.sparepart_id)) : [];

      items.forEach((item, index) => {
        if (item.sparepart_id && !purchasedSparepartIds.includes(String(item.sparepart_id))) {
          errors[`sparepart-${index}`] = "This spare part was not included in the selected invoice.";
        }

        if (!item.quantity || parseInt(item.quantity, 10) < 1 || isNaN(parseInt(item.quantity, 10))) {
          errors[`quantity-${index}`] = "Quantity must be a positive number.";
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

    const items = sparePartsRows
      .map((row) => ({
        sparepart_id: row.sparepart_id,
        quantity: parseInt(row.quantity, 10),
      }))
      .filter((i) => i.sparepart_id && i.quantity > 0);

    const payload = {
      vendor_id: formData.vendor_id,
      invoice_no: formData.invoiceNo,
      return_date: returnDate,
      notes: formData.notes || null,
      items: items,
    };

    if (!validateForm(payload, sparePartsRows)) {
      return;
    }

    try {
      setLoading(true);
      let data;
      if (editingReturn) {
        const resp = await axios.put(
          `${API_BASE_URL}/sparepart-returns/${editingReturn.id}`,
          payload, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
        );
        data = resp.data;
        if (data?.message) {
          setReturns((prevReturns) =>
            prevReturns.map((item) =>
              String(item.id) === String(editingReturn.id) ? { ...item, ...payload, id: editingReturn.id } : item
            )
          );
          toast.success("Return updated successfully!");
        } else {
          toast.error(data?.message || "Failed to update return.");
        }
      } else {
        const resp = await axios.post(
          `${API_BASE_URL}/sparepart-returns`,
          payload, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
        );
        data = resp.data;
        if (data?.message) {
          setReturns((prevReturns) => [...prevReturns, { ...payload, id: data.id }]);
          toast.success("Return added successfully!");
        } else {
          toast.error(data?.message || "Failed to add return.");
        }
      }

      setShowForm(false);
      setEditingReturn(null);
      setSparePartsRows([{ sparepart_id: "", quantity: "" }]);
      setReturnDate(new Date().toISOString().split("T")[0]);
      setFormErrors({});
      setFormData({
        vendor_id: "",
        invoiceNo: "",
        notes: "",
      });

    } catch (error) {
      if (error.response) {
        console.error("Server responded with error:", error.response.status, error.response.data);
        toast.error(`Server error (${error.response.status}): ${error.response.data?.message ?? "Please check form data or server logs."}`);
        setFormErrors(error.response.data.errors || {});
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from server");
      } else {
        console.error("Request setup error:", error.message);
        toast.error("An error occurred before sending the request");
      }
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id) => {
    if (!id || isNaN(parseInt(id))) {
      toast.error("Invalid ID. Cannot delete.");
      return;
    }

    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this return?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });


  const result = await MySwal.fire({
    title: "Are you sure?",
    text: "Do you really want to delete this spare part return?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  });

  if (!result.isConfirmed) return;


      await axios.delete(`${API_BASE_URL}/sparepart-returns/${id}`);
      toast.success("Return deleted successfully!");

      const updatedReturns = returns.filter((r) => String(r.id) !== String(id));
      setReturns(updatedReturns);

      setTimeout(() => {
        if (updatedReturns.length > 0 && tableRef.current) {
          $(tableRef.current).DataTable({
            ordering: true,
            paging: true,
            searching: true,
            lengthChange: true,
            columnDefs: [{ targets: 0, className: "text-center" }],
          });
        }
      }, 0);
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(`Failed to delete return: ${error.response?.data?.message || "Server error"}`);
    }
  };


  const handleShowForm = (returnedItem = null) => {
    setEditingReturn(returnedItem);
    setFormErrors({});

    if (returnedItem) {
      // Find the corresponding purchase to get the correct spare parts list
      const purchase = purchases.find(p => String(p.invoice_no) === String(returnedItem.invoice_no));
      let sparepartOptions = [];
      if (purchase) {
        sparepartOptions = purchase.items.map(item => availableSpareparts.find(sp => sp.id === item.sparepart_id)).filter(Boolean);
      }
      setInvoiceSpareparts(sparepartOptions);

      setSparePartsRows(
        returnedItem.items && returnedItem.items.length > 0
          ? returnedItem.items.map((item) => ({
            sparepart_id: String(item.sparepart_id),
            quantity: String(item.quantity),
          }))
          : [{ sparepart_id: "", quantity: "" }]
      );
      setReturnDate(returnedItem.return_date);
      setFormData({
        vendor_id: String(returnedItem.vendor_id),
        invoiceNo: returnedItem.invoice_no,
        notes: returnedItem.notes || ""
      });
    } else {
      setSparePartsRows([{ sparepart_id: "", quantity: "" }]);
      setReturnDate(new Date().toISOString().split("T")[0]);
      setFormData({ vendor_id: "", invoiceNo: "", notes: "" });
      setInvoiceSpareparts([]); // Clear spare part options for a new form
    }
    setShowForm(true);
  };

  return (
    <div className="vh-80 d-flex flex-column position-relative bg-light">
      <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white">
        <h5 className="mb-0 fw-bold">Return Spare Parts ({returns.length})</h5>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={fetchAllData}>
            {loading ? <Spinner animation="border" size="sm" /> : <i className="bi bi-arrow-clockwise"></i>}
          </Button>
          <Button variant="success" size="sm" onClick={() => handleShowForm()}>
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
                <th>Vendor Name</th>
                <th>Return Date</th>
                <th>Invoice No</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && returns.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No returns found.
                  </td>
                </tr>
              ) : (
                returns.map((returned, index) => (
                  <tr key={returned.id}>
                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                    <td>
                      {(() => {
                        const vendor = vendors.find((v) => String(v.id) === String(returned.vendor_id));
                        return vendor
                          ? `${vendor.first_name ?? ""} ${vendor.last_name ?? ""}`.trim()
                          : `ID: ${returned.vendor_id}`;
                      })()}
                    </td>
                    <td>{new Date(returned.return_date).toLocaleDateString("en-GB")}</td>
                    <td>{returned.invoice_no}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => handleShowForm(returned)}
                      >
                        <i className="bi bi-pencil-square me-1"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(returned.id)}
                      >
                        <i className="bi bi-trash me-1"></i>
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
        className={`position-fixed bg-white shadow-lg purchase-form-slide`}
        style={{
          width: "600px",
          height: "calc(100vh - 58px)", // Adjust height to account for the header
          top: "58px",
          right: showForm ? "0" : "-800px",
          transition: "right 0.4s ease-in-out",
          overflowY: "auto", // Add overflowY to the main form container
          overflowX: "hidden",
          opacity: 1,
          fontFamily: "Product Sans, sans-serif",
          fontWeight: 400,
          zIndex: 1050,
          padding: "30px",
          borderLeft: "1px solid #dee2e6"
        }}
      >
        <div className="d-flex justify-content-between align-items-start mb-4">
          <h5 className="fw-bold mb-0">{editingReturn ? "Edit Spare part Return" : "Add New Spare part Return"}</h5>
          <button
            onClick={() => {
              setShowForm(false);
              setEditingReturn(null);
              setFormErrors({});
              setSparePartsRows([{ sparepart_id: "", quantity: "" }]);
              setReturnDate(new Date().toISOString().split("T")[0]);
              setFormData({ vendor_id: "", invoiceNo: "", notes: "" });
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
        <Form onSubmit={handleFormSubmit} noValidate>
          <div className="row mb-3">
            <div className="col-6">
              <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>Vendor <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="vendor_id"
                required
                style={{ ...getBlueBorderStyles(formData.vendor_id, !!formErrors.vendor_id) }}
                value={formData.vendor_id}
                onChange={handleInputChange}
                isInvalid={!!formErrors.vendor_id}
              >
                <option value="" disabled>Select Vendor</option>
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
              <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>Batch No. <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="batch_id"
                required
                style={getBlueBorderStyles(formData.batch_id, !!formErrors.batch_id)}
                value={formData.batch_id}
                onChange={handleInputChange}
                isInvalid={!!formErrors.batch_id}
              >
                <option value="" disabled>Select Batch</option>
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
              <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>Purchase Invoice No. <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="invoiceNo"
                required
                style={{ ...getBlueBorderStyles(formData.invoiceNo, !!formErrors.invoice_no) }}
                value={formData.invoiceNo}
                onChange={handleInputChange}
                isInvalid={!!formErrors.invoiceNo}
              >
                <option value="" disabled>Select Invoice</option>
                {purchases.map((purchase) => (
                  <option key={purchase.id} value={purchase.invoice_no}>
                    {purchase.invoice_no}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid" className="d-block">
                {formErrors.invoiceNo}
              </Form.Control.Feedback>
            </div>
            <div className="col-6 position-relative">
              <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>
                Return Date <span className="text-danger">*</span>
              </Form.Label>

              <div
                className="form-control d-flex align-items-center justify-content-between"
                style={{
                  position: "relative",
                  cursor: "pointer",
                  ...getBlueBorderStyles(returnDate, !!formErrors.return_date),
                  minHeight: "34px",
                }}
                onClick={() => setShowReturnCalendar(true)}
              >
                <span>
                  {returnDate
                    ? new Date(returnDate + "T00:00:00").toLocaleDateString("en-GB")
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

              {formErrors.return_date && (
                <div className="invalid-feedback d-block">
                  {formErrors.return_date}
                </div>
              )}

              {showReturnCalendar && (
                <div style={{ position: "absolute", zIndex: 10 }}>
                  <MiniCalendar
                    selectedDate={
                      returnDate ? new Date(returnDate + "T00:00:00") : null
                    }
                    onDateChange={(date) => {
                      const safeDate = new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                      );
                      const formatted = `${safeDate.getFullYear()}-${String(
                        safeDate.getMonth() + 1
                      ).padStart(2, "0")}-${String(safeDate.getDate()).padStart(2, "0")}`;
                      setReturnDate(formatted);
                      setShowReturnCalendar(false);
                    }}
                    onCancel={() => setShowReturnCalendar(false)}
                  // allowFuture={false}
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
                disabled={sparePartsRows.length >= invoiceSpareparts.length}
                style={{
                  border: "1px solid #C7E6D1",
                  backgroundColor: "#F1FCF6",
                  color: "#1F9254",
                  padding: "6px 12px",
                  fontSize: "14px",
                  borderRadius: "6px",
                  opacity: sparePartsRows.length >= invoiceSpareparts.length ? 0.6 : 1,
                  cursor: sparePartsRows.length >= invoiceSpareparts.length ? "not-allowed" : "pointer",
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
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                <table
                  className="custom-table"
                  style={{
                    width: "100%",
                    tableLayout: "fixed",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{
                        textAlign: "left",
                        padding: "12px",
                        backgroundColor: "#F3F4F6",
                        borderBottom: "1px solid #D3DBD5",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}>
                        Sparepart Name
                      </th>
                      <th style={{
                        textAlign: "left",
                        padding: "12px",
                        backgroundColor: "#F3F4F6",
                        borderBottom: "1px solid #D3DBD5",
                        fontWeight: 600,
                        fontSize: "14px",
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
                      sparePartsRows.map((row, index) => {
                        const selectedIds = sparePartsRows
                          .filter((_, i) => i !== index)
                          .map((r) => String(r.sparepart_id));

                        const availableOptions = invoiceSpareparts.filter(
                          (sp) =>
                            String(row.sparepart_id) === String(sp.id) || // keep current selection
                            !selectedIds.includes(String(sp.id)) // exclude others already selected
                        );

                        return (
                          <tr key={index}>
                            <td style={{ padding: "12px" }}>
                              <Form.Select
                                name={`sparepart-${index}`}
                                value={row.sparepart_id}
                                onChange={(e) => handleRowChange(index, "sparepart_id", e.target.value)}
                                isInvalid={!!formErrors[`sparepart-${index}`]}
                                disabled={!formData.invoiceNo}
                                className="shadow-none"
                                style={{
                                  border: "none",
                                  backgroundColor: "#fff",
                                  padding: "5px",
                                  fontSize: "14px",
                                  borderRadius: "6px",
                                  outline: "none",
                                  boxShadow: "none",
                                  appearance: "none",
                                  WebkitAppearance: "none",
                                  MozAppearance: "none",
                                }}
                              >
                                <option value="" disabled>
                                  {formData.invoiceNo ? "Select Spare Part" : "Select Invoice first"}
                                </option>
                                {availableOptions.map((sparepart) => (
                                  <option key={sparepart.id} value={sparepart.id}>
                                    {sparepart.name}
                                  </option>
                                ))}
                              </Form.Select>
                              <Form.Control.Feedback type="invalid" className="d-block mt-0">
                                {formErrors[`sparepart-${index}`]}
                              </Form.Control.Feedback>
                            </td>
                            <td style={{ padding: "12px" }}>
                              <Form.Control
                                type="number"
                                name={`quantity-${index}`}
                                placeholder="Enter Quantity"
                                min="1"
                                value={row.quantity}
                                onChange={(e) => handleRowChange(index, "quantity", e.target.value)}
                                isInvalid={!!formErrors[`quantity-${index}`]}
                                className="shadow-none"
                                style={{
                                  border: "none",
                                  backgroundColor: "#fff",
                                  borderRadius: "6px",
                                  outline: "none",
                                  boxShadow: "none",
                                }}
                              />
                              <Form.Control.Feedback type="invalid" className="d-block mt-0">
                                {formErrors[`quantity-${index}`]}
                              </Form.Control.Feedback>
                            </td>
                            <td className="text-center align-middle" style={{ padding: "5px" }}>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => handleRemoveRow(index)}
                                className="p-0"
                                style={{
                                  backgroundColor: "#FFEBEBC9",
                                  borderRadius: "50%",
                                  width: "28px",
                                  height: "28px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  outline: "none",
                                  boxShadow: "none",
                                }}
                              >
                                <BsDashLg style={{ color: "red", fontSize: "1rem" }} />
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center text-muted py-3">
                          No spare parts added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {!!formErrors.items && (
              <div className="invalid-feedback d-block mt-1">
                {formErrors.items}
              </div>
            )}
          </div>
          <div className="d-flex justify-content-end mt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setEditingReturn(null);
                setFormErrors({});
                setSparePartsRows([{ sparepart_id: "", quantity: "" }]);
                setReturnDate(new Date().toISOString().split("T")[0]);
                setFormData({ vendor_id: "", invoiceNo: "", notes: "" });
              }}
              className="me-2"
            >
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : editingReturn ? "Update Return" : "Submit Return"}
            </Button>
          </div>
        </Form>
      </div>

      <style>
        {`
        .add-row-btn {
  background-color: #278C580F;
  color: #278C58;
  font-size: 14px;
  padding: 6px 12px;
  box-shadow: none;
  cursor: pointer;
}
    `}
      </style>
    </div>
  );
}