import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export default function BatchPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [editingBatchId, setEditingBatchId] = useState(null);

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
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      const res = await axios.get(`${apiBase}/batches`);
      setBatches(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Failed to fetch batches!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    setEditingBatchId(null);
    setBatchName("");
    setShowModal(true);
  };

  const handleEdit = (batch) => {
    setEditingBatchId(batch.id);
    setBatchName(batch.batch);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setBatchName("");
    setEditingBatchId(null);
  };

  const handleSave = async () => {
    if (!batchName.trim()) {
      toast.warning("Batch name is required!");
      return;
    }

    // --- Client-side duplicate check ---
    const duplicate = batches.some(
      (b) => b.batch.toLowerCase() === batchName.trim().toLowerCase() && b.id !== editingBatchId
    );
    if (duplicate) {
      toast.error("Batch already exists!");
      return;
    }

    const payload = { batch: batchName.trim() };

    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      if (editingBatchId) {
        await axios.put(`${apiBase}/batches/${editingBatchId}`, payload);
        toast.success("Batch updated successfully!");
      } else {
        await axios.post(`${apiBase}/batches`, payload);
        toast.success("Batch added successfully!");
      }

      await fetchBatches();
      handleModalClose();
    } catch (error) {
      if (error.response?.status === 422) {
        if (error.response.data.message) {
          toast.error(error.response.data.message); // custom message from backend
        } else if (error.response.data.errors) {
          const errors = error.response.data.errors;
          Object.values(errors).forEach((msg) => toast.error(msg[0]));
        } else {
          toast.error("Validation failed!");
        }
      } else {
        toast.error("Failed to save batch!");
      }
    }
  };

const MySwal = withReactContent(Swal);

const handleDelete = async (id) => {
  const result = await MySwal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to delete this batch?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  });

  if (!result.isConfirmed) return;

  try {
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }

    await axios.delete(`${apiBase}/batches/${id}`);
    toast.success('Batch deleted!');
    await fetchBatches();
  } catch (error) {
    toast.error('Failed to delete batch!');
  }
};


  return (
    <div className="p-4">

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

      <Modal show={showModal} onHide={handleModalClose} centered backdrop="static">
        <Modal.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold mb-0">{editingBatchId ? "Edit Batch" : "Add New Batch"}</h5>
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
              {editingBatchId ? "Update" : "Save"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
