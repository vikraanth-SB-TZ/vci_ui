import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form, Table } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function BatchPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [editingBatch, setEditingBatch] = useState(null);

  const apiBase = "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
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
      if (editingBatch) {
        const res = await axios.put(`${apiBase}/batches/${editingBatch.id}`, payload);
        setBatches(batches.map(b => (b.id === editingBatch.id ? res.data.batch : b)));
        toast.success("Batch updated successfully!");
      } else {
        const res = await axios.post(`${apiBase}/batches`, payload);
        setBatches([...batches, res.data.batch]);
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
      await axios.delete(`${apiBase}/batches/${id}`);
      setBatches(batches.filter((b) => b.id !== id));
      toast.success("Batch deleted successfully.");
    } catch (error) {
      console.error("Error deleting batch:", error);
      toast.error("Failed to delete batch.");
    }
  };

  return (
    <div className="w-100 py-4 bg-white" style={{ minHeight: '100vh', fontFamily: 'Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif', fontSize: '14px', fontWeight: '500' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 px-4">
        <h4 className="fw-semibold text-dark mb-0 fs-4">
          Batch List <span className="text-dark fw-semibold">({batches.length})</span>
        </h4>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary p-0" style={{ width: '38px', height: '38px' }} onClick={fetchBatches}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <i className="bi bi-arrow-clockwise fs-5 text-secondary"></i>
            )}
          </Button>
          <Button
            size="sm"
            variant="success d-flex align-items-center px-3"
            style={{ minWidth: '100px', fontSize: '0.9rem', fontWeight: '500' }}
            onClick={handleAddNewClick}
          >
            <i className="bi bi-plus me-1"></i> Add New
          </Button>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <img
              src="/empty-box.png"
              alt="No Data"
              style={{ width: "160px", opacity: 0.6 }}
              className="mb-3"
            />
            <div className="text-muted fs-6">No batch data available</div>
          </div>
        </div>
      ) : (
        <div className="shadow-sm overflow-hidden mx-4" style={{ borderRadius: '0.5rem' }}>
          <Table hover responsive size="sm" className="table-border mb-0">
            <thead>
              <tr className="border-bottom border-secondary-subtle">
                <th className="text-dark fw-semibold py-3 ps-4" style={{ backgroundColor: '#f3f7faff' }}>S.No</th>
                <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f6f7f8ff' }}>Batch</th>
                <th className="text-dark fw-medium py-3 pe-4" style={{ backgroundColor: '#f6f7f8ff' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch, index) => (
                <tr key={batch.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                  <td className="py-2 ps-4 text-dark">{String(index + 1).padStart(2, '0')}</td>
                  <td className="py-2 text-dark">{batch.batch}</td>
                  <td className="py-2 pe-4 d-flex gap-2">
                    <Button variant="outline-primary" size="sm" title="Edit" onClick={() => handleEdit(batch)}>
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" title="Delete" onClick={() => handleDelete(batch.id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={handleModalClose}
        centered
        backdrop="static"
        contentClassName="border-0 rounded-4 shadow-sm"
      >
        <Modal.Body className="p-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-semibold mb-0">
              {editingBatch ? "Edit Batch" : "Add New Batch"}
            </h5>
            <Button
              variant="outline-secondary"
              onClick={handleModalClose}
              className="rounded-circle d-flex align-items-center justify-content-center border-0"
              style={{ width: "32px", height: "32px" }}
            >
              <i className="bi bi-x-lg fs-6"></i>
            </Button>
          </div>

          {/* Input */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-medium">Batch Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter batch name"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="border-0 border-bottom rounded-0 shadow-none"
            />
          </Form.Group>

          {/* Footer Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <Button variant="light" onClick={handleModalClose} className="px-4">
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleSave}
              disabled={!batchName.trim()}
              className="px-4"
            >
              Save
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
