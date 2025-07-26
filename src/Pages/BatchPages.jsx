import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form } from "react-bootstrap";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BatchPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [editingBatch, setEditingBatch] = useState(null);

  const apiBase = "http://127.0.0.1:8000/api";
  const tableRef = useRef(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (!loading && batches.length > 0 && !$.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable({
        ordering: true,
        paging: true,
        searching: true,
        lengthChange: true,
        columnDefs: [{ targets: 0, className: "text-center" }],
      });
    }
  }, [batches, loading]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      // Destroy table before refilling
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      const res = await axios.get(`${apiBase}/batches`);
      setBatches(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching batches:", error);
      toast.error("Failed to fetch batch list.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    setEditingBatch(null);
    setBatchName("");
    setShowModal(true);
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setBatchName(batch.batch);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setBatchName("");
    setEditingBatch(null);
  };

  const handleSave = async () => {
    if (!batchName.trim()) {
      toast.error("Batch name is required!");
      return;
    }
    const payload = { batch: batchName.trim() };
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      if (editingBatch) {
        const res = await axios.put(`${apiBase}/batches/${editingBatch.id}`, payload);
        setBatches((prev) => prev.map((b) => (b.id === editingBatch.id ? res.data : b)));
        toast.success("Batch updated successfully!");
      } else {
        const res = await axios.post(`${apiBase}/batches`, payload);
        setBatches((prev) => [...prev, res.data]);
        toast.success("Batch added successfully!");
      }
      handleModalClose();
    } catch (error) {
      const errMsg =
        error.response?.data?.errors?.batch?.[0] ||
        error.response?.data?.message ||
        "Failed to save batch.";
      toast.error(errMsg);
    }
  };

  const handleDelete = async (id) => {
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      await axios.delete(`${apiBase}/batches/${id}`);
      setBatches((prev) => prev.filter((b) => b.id !== id));
      toast.success("Batch deleted successfully.");
    } catch (error) {
      console.error("Error deleting batch:", error);
      toast.error("Failed to delete batch.");
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between mb-3">
        <h5 className="fw-bold">Batches ({batches.length.toString().padStart(2, "0")})</h5>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={fetchBatches}>
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button variant="success" size="sm" onClick={handleAddNewClick}>
            + Add New
          </Button>
        </div>
      </div>

      <div className="table-responsive">
        <table ref={tableRef} className="table custom-table">
          <thead>
            <tr>
              <th style={{ textAlign: "center", width: "70px" }}>S.No</th>
              <th>Batch</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  <Spinner animation="border" />
                </td>
              </tr>
            ) : batches.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-muted">
                  No batches found.
                </td>
              </tr>
            ) : (
              batches.map((batch, index) => (
                <tr key={batch.id}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{batch.batch}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-1"
                      onClick={() => handleEdit(batch)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(batch.id)}
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

      {/* Modal */}
      <Modal show={showModal} onHide={handleModalClose} centered backdrop="static">
        <Modal.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold mb-0">{editingBatch ? "Edit Batch" : "Add New Batch"}</h5>
            <Button
              variant="outline-secondary"
              onClick={handleModalClose}
              className="rounded-circle border-0 d-flex align-items-center justify-content-center"
              style={{ width: "32px", height: "32px" }}
            >
              <i className="bi bi-x-lg fs-6"></i>
            </Button>
          </div>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Batch Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Batch Name"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="light" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleSave} disabled={!batchName.trim()}>
              {editingBatch ? "Update" : "Save"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
