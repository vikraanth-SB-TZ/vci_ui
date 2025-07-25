import { useState, useRef, useEffect, useCallback } from "react";
import { Button, Spinner, Form } from "react-bootstrap";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/material_green.css";
import axios from "axios"; // <-- make sure axios is installed

const API_BASE = import.meta?.env?.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function PurchaseSparepartsPage() {
  /* ------------------------------------------------------------------ */
  /*  State                                                             */
  /* ------------------------------------------------------------------ */
  const [vendors, setVendors] = useState([]);              // [{id, first_name, last_name, ...}]
  const [batches, setBatches] = useState([]);              // [{id, batch}]
  const [availableSpareparts, setAvailableSpareparts] = useState([]); // [{id,name,...}]
  const [spareparts, setSpareparts] = useState([]);        // purchase list
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sparePartsRows, setSparePartsRows] = useState([{ sparepart_id: "", quantity: "" }]);
  const [invoiceDate, setInvoiceDate] = useState(null);
  const datePickerRef = useRef();
const [editingPurchase, setEditingPurchase] = useState(null);

  /* ------------------------------------------------------------------ */
  /*  Flatpickr init                                                     */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!datePickerRef.current) return;
    const fp = flatpickr(datePickerRef.current, {
      defaultDate: "2025-06-16",
      dateFormat: "d/m/Y",
      onChange: ([date]) => setInvoiceDate(date),
      disableMobile: true,
      locale: { firstDayOfWeek: 1 },
    });
    return () => fp?.destroy();
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Data fetch helpers                                                 */
  /* ------------------------------------------------------------------ */
  const fetchVendors = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/vendors`, { headers: { Accept: "application/json" } });
      // handle both {success,data:[...]} and raw array
      let rows = Array.isArray(data) ? data : data.data ?? [];
      setVendors(rows);
    } catch (err) {
      console.error("Error loading vendors:", err);
    }
  }, []);

  const fetchBatches = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/batches`, { headers: { Accept: "application/json" } });
      // handle {batches:[...]} OR {data:[...]} OR array
      let rows = Array.isArray(data) ? data : data.batches ?? data.data ?? [];
      setBatches(rows);
    } catch (err) {
      console.error("Error loading batches:", err);
    }
  }, []);

  const fetchAvailableSpareparts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/spareparts`, { headers: { Accept: "application/json" } });
      let rows = Array.isArray(data) ? data : data.data ?? [];
      setAvailableSpareparts(rows);
    } catch (err) {
      console.error("Error loading spareparts master list:", err);
    }
  }, []);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/sparepart-purchases`, { headers: { Accept: "application/json" } });
      let rows = Array.isArray(data) ? data : data.data ?? [];
      setSpareparts(rows);
    } catch (err) {
      console.error("Error loading purchases:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Initial load                                                       */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    fetchVendors();
    fetchBatches();
    fetchAvailableSpareparts();
    fetchPurchases();
  }, [fetchVendors, fetchBatches, fetchAvailableSpareparts, fetchPurchases]);

  /* ------------------------------------------------------------------ */
  /*  Form row management                                                */
  /* ------------------------------------------------------------------ */
  const handleAddRow = () => {
    setSparePartsRows((rows) => [...rows, { sparepart_id: "", quantity: "" }]);
  };

  const handleRemoveRow = (index) => {
    setSparePartsRows((rows) => rows.filter((_, i) => i !== index));
  };

  const handleRowChange = (index, field, value) => {
    setSparePartsRows((rows) => {
      const copy = [...rows];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  /* ------------------------------------------------------------------ */
  /*  Submit                                                             */
  /* ------------------------------------------------------------------ */
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const vendor_id = form.get("vendor_id");
    const batch_id = form.get("batch_id");
    const invoice_no = form.get("invoiceNo");
    const notes = form.get("notes") || null;

    // invoiceDate stored in state when user picks via flatpickr
    const invoice_date = invoiceDate ? invoiceDate.toISOString().split("T")[0] : null;

    // Build items from controlled state (safer than re-reading form)
    const items = sparePartsRows
      .map((row, idx) => {
        const sparepart_id = form.get(`sparepart-${idx}`) ?? row.sparepart_id;
        const q = form.get(`quantity-${idx}`) ?? row.quantity;
        const quantity = parseInt(q, 10) || 0;
        return { sparepart_id, quantity };
      })
      .filter((i) => i.sparepart_id && i.quantity > 0);

    if (!vendor_id) {
      alert("Please select a vendor.");
      return;
    }
    if (!batch_id) {
      alert("Please select a batch.");
      return;
    }
    if (!invoice_date) {
      alert("Please pick invoice date.");
      return;
    }
    if (!items.length) {
      alert("Please add at least one spare part row with quantity.");
      return;
    }

    const payload = { vendor_id, batch_id, invoice_no, invoice_date, notes, items };
    console.log("Sending payload:", payload);

    try {
const { data } = editingPurchase
  ? await axios.put(
`${API_BASE}/api/sparepart-purchases/${editingPurchase.id}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    )
  : await axios.post(
      `${API_BASE}/api/spareparts/return`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

      if (data?.success) {
        alert("Purchase added successfully!");
        setShowForm(false);
        // Refresh purchase list from server (safer than pushing partial)
        fetchPurchases();
        // reset form rows
        setSparePartsRows([{ sparepart_id: "", quantity: "" }]);
        // reset invoice date in UI
        if (datePickerRef.current?._flatpickr) {
          datePickerRef.current._flatpickr.clear(); 
        }
        setInvoiceDate(null);
      } else {
        alert(data?.message || "Failed to add purchase.");
      }
    } catch (error) {
      // Axios error diagnostics
      if (error.response) {
        console.error("Server responded with error:", error.response.status, error.response.data);
        alert(`Server error (${error.response.status}): ${error.response.data?.message ?? "See console"}`);
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("No response from server. Check network/API base URL.");
      } else {
        console.error("Request setup error:", error.message);
        alert("Error preparing request. See console.");
      }
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Delete purchase                                                    */
  /* ------------------------------------------------------------------ */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purchase?")) return;
    try {
      const { data } = await axios.delete(`${API_BASE}/api/sparepart-purchases/${id}`, {
        headers: { Accept: "application/json" },
      });
      if (data?.success) {
        setSpareparts((rows) => rows.filter((p) => p.id !== id));
      } else {
        alert(data?.message || "Failed to delete.");
      }
    } catch (err) {
      console.error("Error during delete request:", err);
      alert("Error deleting purchase. See console.");
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */
  const customSelectStyle = {
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    backgroundSize: "16px 16px",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  };

  const handleIconClick = () => {
    datePickerRef.current?._flatpickr?.open();
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="d-flex flex-column h-100" style={{ height: "100vh" }}>
{/* Header */}
<section className="px-4 py-3 border-bottom bg-white d-flex justify-content-between align-items-center">
  <h5 className="mb-0 fw-bold">
     Return Spare parts <span className="text-muted fw-normal">({spareparts.length})</span>
  </h5>
  <div>
    <Button variant="light" className="me-2" onClick={fetchPurchases}>
      {loading ? <Spinner animation="border" size="sm" /> : <i className="bi bi-arrow-clockwise"></i>}
    </Button>
    <Button variant="success" onClick={() => setShowForm(true)}>
      <i className="bi bi-plus-lg me-1"></i> Add New
    </Button>
  </div>
</section>

{/* Table Header */}
<div className="d-flex flex-column position-relative" style={{ height: "89vh", overflow: "hidden" }}>
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
    <div style={{ flex: 2 }}>Vendor Name</div>
    <div style={{ flex: 2 }}>Invoice Date</div>
    <div style={{ flex: 2 }}>Invoice No</div>
    <div style={{ flex: 2 }}>Purchase ID</div>
    <div style={{ flex: 2 }}>Action</div>
  </div>

  <div className="flex-grow-1 overflow-auto bg-light">
    {loading ? (
      <div className="text-center mt-4">
        <Spinner animation="border" />
      </div>
    ) : spareparts.length === 0 ? (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ height: "calc(80vh - 160px)", width: "100%" }}
      >
        <img src="/empty-box.png" alt="Empty" style={{ width: "160px" }} />
      </div>
    ) : (
      spareparts.map((purchase, index) => (
        <div
          key={purchase.id}
          className="px-4 py-2 border-bottom d-flex bg-white align-items-center small"
        >
          {/* Index */}
          <div style={{ width: "80px" }}>{index + 1}</div>

          {/* Vendor Name */}
          <div style={{ flex: 2 }}>
            {
              (() => {
                const vendor = vendors.find((v) => String(v.id) === String(purchase.vendor_id));
                return vendor
                  ? `${vendor.first_name ?? ""} ${vendor.last_name ?? ""}`.trim()
                  : purchase.vendor_id;
              })()
            }
          </div>

          {/* Invoice Date */}
          <div style={{ flex: 2 }}>
            {new Date(purchase.invoice_date).toLocaleDateString("en-GB")}
          </div>

          {/* Invoice No */}
          <div style={{ flex: 2 }}>{purchase.invoice_no}</div>

          {/* Purchase ID */}
          <div style={{ flex: 2 }}>{purchase.id}</div>

          {/* Action Buttons */}
          <div style={{ flex: 2 }}>
            <Button
              variant="outline-primary"
              size="sm"
              className="me-1"
              onClick={() => {
                setEditingPurchase(purchase);
                setShowForm(true);
                setInvoiceDate(new Date(purchase.invoice_date));
                setSparePartsRows(
                  purchase.items.map((item) => ({
                    invoice_no: item.invoice_no,
                    sparepart_id: item.sparepart_id,
                    quantity: item.quantity,
                  }))
                );
              }}
            >
              <i className="bi bi-pencil-square me-1"></i>
              Edit
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleDelete(purchase.id)}
            >
              <i className="bi bi-trash me-1"></i>
              Delete
            </Button>
          </div>
        </div>
      ))
    )}
  </div>
</div>
      {/* Slide Form */}
      <div
        style={{
          position: "fixed",
          top: "78px",
          right: showForm ? "0" : "-600px",
          width: "100%",
          maxWidth: "600px",
          height: "100%",
          backgroundColor: "#fff",
          boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
          zIndex: 1050,
          padding: "30px",
          overflowY: "auto",
          borderLeft: "1px solid #dee2e6",
          transition: "right 0.4s ease-in-out",
        }}
      >
        <div className="d-flex justify-content-between align-items-start mb-4">
<h5 className="mb-4 fw-semibold">
  {editingPurchase ? "Edit Spare Part Purchase" : "Add Spare Part Purchase"}
</h5>
          <button
            onClick={() => setShowForm(false)}
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

        <form onSubmit={handleFormSubmit}>
          <div className="row mb-3">
            <div className="col-6">
              <label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>
                Vendor
              </label>
              <select className="form-select" name="vendor_id" required style={customSelectStyle} defaultValue="">
                <option value="" disabled>
                  Select Vendor
                </option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.first_name} {vendor.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>
                Batch
              </label>
              <select className="form-select" name="batch_id" required style={customSelectStyle} defaultValue="">
                <option value="" disabled>
                  Select Batch
                </option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-6">
              <label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>
                Invoice No.
              </label>
              <input
                type="text"
                className="form-control"
                name="invoiceNo"
                placeholder="Enter Invoice No."
                required
              />
            </div>
            <div className="col-6">
              <Form.Group>
                <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>
                  Invoice Date
                </Form.Label>
                <div style={{ position: "relative" }}>
                  <input ref={datePickerRef} className="form-control" placeholder="DD/MM/YY" required />
                  <img
                    src="/calendar-icon.png"
                    alt="calendar"
                    onClick={handleIconClick}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "22px",
                      height: "27px",
                      cursor: "pointer",
                      filter:
                        "invert(47%) sepia(9%) saturate(295%) hue-rotate(102deg) brightness(92%) contrast(91%)",
                    }}
                  />
                </div>
              </Form.Group>
            </div>
          </div>

          <div className="mb-3">
            <label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>
              Notes
            </label>
            <textarea className="form-control" name="notes" placeholder="Enter any notes" rows="3"></textarea>
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-semibold mb-0">Add Spare parts</h6>
              <button
                type="button"
                onClick={handleAddRow}
                style={{
                  backgroundColor: "#278C580F",
                  color: "#278C58",
                  border: "1px solid #D5E8D4",
                  fontSize: "14px",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  boxShadow: "none",
                  cursor: "pointer",
                }}
              >
                + Add Row
              </button>
            </div>

            <div style={{ position: "relative", width: "530px" }}>
              <div className="table-responsive">
                <table
                  className="table align-middle mb-0"
                  style={{ width: "100%", border: "1px solid #D3DBD5", tableLayout: "fixed" }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#E9ECEF", height: "40px", color: "#393C3A" }}>
                      <th style={{ width: "50%", border: "1px solid #D3DBD5" }}>Sparepart Name</th>
                      <th style={{ width: "50%", border: "1px solid #D3DBD5" }}>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sparePartsRows.map((row, index) => (
                      <tr key={index} style={{ height: "52px" }}>
                        <td style={{ border: "1px solid #D3DBD5", padding: "0 8px" }}>
                          <select
                            className="form-select border-0 shadow-none"
                            name={`sparepart-${index}`}
                            required
                            style={{ height: "38px", backgroundColor: "transparent", paddingLeft: "0", ...customSelectStyle }}
                            value={row.sparepart_id}
                            onChange={(e) => handleRowChange(index, "sparepart_id", e.target.value)}
                          >
                            <option value="">Select Spare part</option>
                            {availableSpareparts.map((part) => (
                              <option key={part.id} value={part.id}>
                                {part.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ border: "1px solid #D3DBD5", padding: "0 8px" }}>
                          <input
                            type="number"
                            min="1"
                            className="form-control border-0 shadow-none"
                            name={`quantity-${index}`}
                            placeholder="Enter Quantity"
                            required
                            style={{ height: "38px", backgroundColor: "transparent", paddingLeft: "0" }}
                            value={row.quantity}
                            onChange={(e) => handleRowChange(index, "quantity", e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sparePartsRows.map((_, index) => (
                <div key={index} style={{ position: "absolute", top: 40 + index * 52 + 6 + "px", right: "-40px" }}>
                  <button
                    type="button"
                    className="btn p-0 border-0"
                    onClick={() => handleRemoveRow(index)}
                    style={{
                      backgroundColor: "#FFEBEBC9",
                      color: "#DF5555",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      fontSize: "20px",
                      lineHeight: "1",
                      textAlign: "center",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    &minus;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {showForm && (
            <div style={{ position: "absolute", bottom: "80px", right: "30px", zIndex: 1000 }}>
<Button type="submit" className="w-100 btn btn-success">
  {editingPurchase ? "Update Purchase" : "Save Purchase"}
</Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
