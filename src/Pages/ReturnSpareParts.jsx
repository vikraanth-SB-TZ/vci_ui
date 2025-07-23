import React, { useState, useRef, useEffect } from "react";
import { Button, Spinner, Form } from "react-bootstrap";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/material_green.css";
import "./SparepartsPage.css";

export default function ReturnSpareParts() {
  const [spareparts, setSpareparts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [spareParts, setSpareParts] = useState([{ name: "", quantity: "" }]);
  const [invoiceDate, setInvoiceDate] = useState(null);
  const datePickerRef = useRef();

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setSpareparts([]);
      setLoading(false);
    }, 1000);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowForm(false);
  };

  const handleAddRow = () => {
    setSpareParts([...spareParts, { name: "", quantity: "" }]);
  };

  const handleRemoveRow = (index) => {
    const updated = spareParts.filter((_, i) => i !== index);
    setSpareParts(updated);
  };

  const handleIconClick = () => {
    if (datePickerRef.current) {
      datePickerRef.current._flatpickr.open();
    }
  };

  useEffect(() => {
    if (datePickerRef.current) {
      flatpickr(datePickerRef.current, {
        defaultDate: "2025-06-16",
        dateFormat: "d/m/Y",
        onChange: ([date]) => setInvoiceDate(date),
        disableMobile: true,
        locale: { firstDayOfWeek: 1 },
      });
    }
  }, []);

  const customSelectStyle = {
    backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='gray' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    backgroundSize: "16px 16px",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  };

  return (
    <div className="d-flex flex-column h-100" style={{ height: "100vh" }}>
      <section className="px-4 py-3 border-bottom bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">
          Spare parts <span className="text-muted fw-normal">({spareparts.length})</span>
        </h5>
        <div>
          <Button variant="light" className="me-2" onClick={handleRefresh}>
            {loading ? <Spinner animation="border" size="sm" /> : <i className="bi bi-arrow-clockwise"></i>}
          </Button>
          <Button variant="success" onClick={() => setShowForm(true)}>
            <i className="bi bi-plus-lg me-1"></i> Add New
          </Button>
        </div>
      </section>

      <div className="d-flex align-items-center px-4 border-bottom small fw-semibold" style={{ backgroundColor: "#DBDBDB73", fontSize: "16px", width: "1203px", height: "60px", minWidth: "100%", fontWeight: "1000", color: "#0e0f0eff" }}>
        <div style={{ width: "80px" }}>S.No</div>
        <div style={{ flex: 2 }}>Vendor</div>
        <div style={{ flex: 2 }}>Invoice Date</div>
        <div style={{ flex: 2 }}>Invoice No</div>
        <div style={{ flex: 2 }}>Purchase No</div>
        <div style={{ flex: 2 }}>Action</div>
      </div>

      <div className="flex-grow-1 overflow-auto bg-light">
        {spareparts.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="text-center">
              <img src="/empty-box.png" alt="Empty" style={{ width: "160px" }} className="mb-2" />
            </div>
          </div>
        ) : (
          <div className="px-4 py-3">
            {spareparts.map((part, index) => (
              <div key={part.id} className="d-flex align-items-center border-bottom py-2 bg-white">
                <div style={{ width: "80px" }}>{index + 1}</div>
                <div style={{ flex: 2 }}>{part.name}</div>
                <div style={{ flex: 2 }}>{part.quantity}</div>
                <div style={{ flex: 2 }}>
                  <Button variant="outline-danger" size="sm" onClick={() => setSpareparts(spareparts.filter((p) => p.id !== part.id))}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: "fixed", top: "78px", right: showForm ? "0" : "-600px", width: "100%", maxWidth: "600px", height: "100%", backgroundColor: "#fff", boxShadow: "-2px 0 10px rgba(0,0,0,0.1)", zIndex: 1050, padding: "30px", overflowY: "auto", borderLeft: "1px solid #dee2e6", transition: "right 0.4s ease-in-out" }}>
        <div className="d-flex justify-content-between align-items-start mb-4">
          <h5 className="fw-bold mb-0">Add New Purchase Spare parts</h5>
          <button onClick={() => setShowForm(false)} style={{ width: "40px", height: "40px", backgroundColor: "#DBDBDB73", border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold", cursor: "pointer", lineHeight: "1", padding: 0 }}>&times;</button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="row mb-3">
            <div className="col-6">
              <label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>Vendor</label>
              <select className="form-select" name="vendor" required style={customSelectStyle}>
                <option value="">Select Vendor</option>
              </select>
            </div>
            <div className="col-6">
              <label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>Batch</label>
              <select className="form-select" name="batch" required style={customSelectStyle}>
                <option value="">Select Batch</option>
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-6">
              <label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>Invoice No.</label>
              <input type="text" className="form-control" name="invoiceNo" placeholder="Enter Invoice No." required />
            </div>
            <div className="col-6">
              <Form.Group>
                <Form.Label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>Invoice Date</Form.Label>
                <div style={{ position: "relative" }}>
                  <input ref={datePickerRef} className="form-control" placeholder="DD/MM/YY" required />
                  <img src="/calendar-icon.png" alt="calendar" onClick={handleIconClick} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", width: "22px", height: "27px", cursor: "pointer", filter: "invert(47%) sepia(9%) saturate(295%) hue-rotate(102deg) brightness(92%) contrast(91%)" }} />
                </div>
              </Form.Group>
            </div>
          </div>

          <div className="mb-3">
            <label className="fw-semibold mb-1" style={{ color: "#393C3AE5" }}>Notes</label>
            <textarea className="form-control" name="notes" placeholder="Enter any notes" rows="3"></textarea>
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-semibold mb-0">Add Spare parts</h6>
              <button type="button" onClick={handleAddRow} style={{ backgroundColor: "#278C580F", color: "#278C58", border: "1px solid #D5E8D4", fontSize: "14px", padding: "6px 12px", borderRadius: "4px", boxShadow: "none", cursor: "pointer" }}>
                + Add Row
              </button>
            </div>

            <div style={{ position: "relative", width: "530px" }}>
              <div className="table-responsive">
                <table className="table align-middle mb-0" style={{ width: "100%", border: "1px solid #D3DBD5", tableLayout: "fixed" }}>
<thead>
  <tr style={{ backgroundColor: "#E9ECEF", height: "40px", color: "#393C3A" }}>
    <th style={{ width: "50%", border: "1px solid #D3DBD5" }}>Sparepart Name</th>
    <th style={{ width: "50%", border: "1px solid #D3DBD5" }}>Quantity</th>
  </tr>
</thead>
<tbody>
  {spareParts.map((_, index) => (
    <tr key={index} style={{ height: "52px" }}>
      <td style={{ border: "1px solid #D3DBD5", padding: "0 8px" }}>
        <select
          className="form-select border-0 shadow-none"
          name={`sparepart-${index}`}
          required
          style={{
            height: "38px",
            backgroundColor: "transparent",
            paddingLeft: "0",
            ...customSelectStyle,
          }}
        >
          <option value="">Select Spare part</option>
        </select>
      </td>
      <td style={{ border: "1px solid #D3DBD5", padding: "0 8px" }}>
        <input
          type="number"
          className="form-control border-0 shadow-none"
          name={`quantity-${index}`}
          placeholder="Enter Quantity"
          required
          style={{
            height: "38px",
            backgroundColor: "transparent",
            paddingLeft: "0",
          }}
        />
      </td>
    </tr>
  ))}
</tbody>
                </table>
              </div>

              {spareParts.map((_, index) => (
                <div key={index} style={{ position: "absolute", top: 40 + index * 52 + 6 + "px", right: "-40px" }}>
                  <button type="button" className="btn p-0 border-0" onClick={() => handleRemoveRow(index)} style={{ backgroundColor: "#FFEBEBC9", color: "#DF5555", borderRadius: "50%", width: "32px", height: "32px", fontSize: "20px", lineHeight: "1", textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    &minus;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* <div className="text-end mt-4">
            <button type="submit" className="btn btn-success" style={{ width: "179px", height: "50px", borderRadius: "6px" , bottom: "20px",
}}>
              Save
            </button>
          </div> */}
                {showForm && (
            <div
              style={{
                position: "absolute",
                bottom: "80px",
                right: "30px",
                zIndex: 1000,
              }}
            >
              <button
                type="submit"
                className="btn btn-success"
                style={{
                  width: "179px",
                  height: "50px",
                  borderRadius: "6px",
                }}
              >
                Save
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
