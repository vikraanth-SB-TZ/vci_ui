import React, { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import axios from "axios";

export default function SparepartsPage() {
  const [spareparts, setSpareparts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState(null);

  useEffect(() => {
    fetchSpareparts();
  }, []);

  const fetchSpareparts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/spareparts");
      setSpareparts(response.data.data);
    } catch (error) {
      console.error("Error fetching spareparts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSpareparts();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const quantityPerVCI = parseInt(e.target.quantityPerVCI.value, 10);
    const notes = e.target.notes.value.trim();
    const openingQty = parseInt(e.target.openingQty.value, 10);

    if (!name || isNaN(quantityPerVCI) || isNaN(openingQty)) {
      alert("Please fill all required fields with valid values.");
      return;
    }

    try {
      if (editingPart) {
        await axios.put(`http://localhost:8000/api/spareparts/${editingPart.id}`, {
          name,
          quantityPerVCI,
          quantity: openingQty,
          notes,
        });
      } else {
        await axios.post("http://localhost:8000/api/spareparts", {
          name,
          quantityPerVCI,
          quantity: openingQty,
          notes,
        });
      }
      await fetchSpareparts();
      setShowForm(false);
      setEditingPart(null);
      e.target.reset();
    } catch (error) {
      console.error("Error saving sparepart:", error);
      alert("Failed to save spare part");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/spareparts/${id}`);
      setSpareparts(spareparts.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete spare part");
    }
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setShowForm(true);
  };

  const drawerClass = showForm ? "slide-in" : "slide-out";

  return (
    <div className="d-flex flex-column position-relative" style={{ height: "89vh", overflow: "hidden" }}>
      <section className="px-4 py-3 border-bottom bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">
          Spare parts{" "}
          <span className="text-muted fw-normal">({spareparts.length})</span>
        </h5>
        <div>
          <Button variant="light" className="me-2" onClick={handleRefresh}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <i className="bi bi-arrow-clockwise"></i>
            )}
          </Button>
          <Button variant="success" onClick={() => { setEditingPart(null); setShowForm(true); }}>
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
        <div style={{ flex: 2 }}>Qty Per VCI</div>
        <div style={{ flex: 2 }}>Action</div>
      </div>

      <div className="flex-grow-1 overflow-auto bg-white">
        {spareparts.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="text-center">
              <img src="/empty-box.png" alt="Empty" style={{ width: "160px" }} className="mb-2" />
            </div>
          </div>
        ) : (
          spareparts.map((part, index) => (
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
                backgroundColor: index % 2 === 0 ? "#FAFAFA" : "#fff",
              }}
            >
              <div style={{ width: "80px" }}>{index + 1}</div>
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

      <div className={drawerClass} style={{
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
          <button onClick={() => { setShowForm(false); setEditingPart(null); }} style={{
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
              <label className="form-label fw-semibold">Spare Part Name</label>
              <input type="text" name="name" defaultValue={editingPart?.name || ""} className="form-control" placeholder="Enter Name" required />
            </div>
            <div className="mb-3 col-6">
              <label className="form-label fw-semibold">Quantity per VCI</label>
              <input type="number" name="quantityPerVCI" defaultValue={editingPart?.quantityPerVCI || ""} className="form-control" placeholder="Enter quantity per VCI" required />
            </div>
            <div className="mb-3 col-12">
              <label className="form-label fw-semibold">Notes</label>
              <textarea name="notes" className="form-control" rows="4" placeholder="Enter any notes" defaultValue={editingPart?.notes || ""} />
            </div>
            <div className="mb-3 col-6">
              <label className="form-label fw-semibold">Opening Stock</label>
              <input type="number" name="openingQty" defaultValue={editingPart?.quantity || ""} className="form-control" placeholder="Enter Quantity" required />
            </div>
          </div>
          <div style={{ position: "absolute", bottom: "20px", right: "30px" }}>
            <button type="submit" className="btn btn-success" style={{ width: "179px", height: "50px", borderRadius: "6px" }}>Save</button>
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
      `}</style>
    </div>
  );
}
