import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { API_BASE_URL } from "../api";
import Breadcrumb from "./Components/Breadcrumb";
import Pagination from "./Components/Pagination";
import Search from "./Components/Search";

export default function BatchPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState("asc");
  const [sortDirection, setSortDirection] = useState("asc");

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/batches`);
      setBatches(Array.isArray(res.data) ? res.data : []);
    } catch {
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
  
    const duplicate = batches.some(
      (b) =>
        b.batch.toLowerCase() === batchName.trim().toLowerCase() &&
        b.id !== editingBatchId
    );
    if (duplicate) {
      toast.error("Batch already exists!");
      return;
    }
  
    const payload = { batch: batchName.trim() };
  
    try {
      if (editingBatchId) {
        await axios.put(`${API_BASE_URL}/batches/${editingBatchId}`, payload);
        toast.success("Batch updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/batches`, payload);
        toast.success("Batch added successfully!");
      }

      // ✅ Always re-fetch from server so list is correct immediately
      await fetchBatches();
      handleModalClose();

    } catch {
      toast.error("Failed to save batch!");
    }
  };
  

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this batch?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/batches/${id}`);
      toast.success("Batch deleted!");
      await fetchBatches();
    } catch {
      toast.error("Failed to delete batch!");
    }
  };

  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);
  };

  const filteredBatches = batches.filter((b) =>
    b.batch.toLowerCase().includes(search.toLowerCase())
  );

  const sortedBatches = [...filteredBatches].sort((a, b) => {
    const valA = a[sortField]?.toLowerCase?.() || "";
    const valB = b[sortField]?.toLowerCase?.() || "";
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedBatches = sortedBatches.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="px-4 py-2">
      <Breadcrumb title="Batches" />

      <Card className="border-0 shadow-sm rounded-3 p-3 mt-3 bg-white">
        <div className="row mb-3">
          <div className="col-md-6 d-flex align-items-center mb-2 mb-md-0">
            <label className="me-2 fw-semibold mb-0">Records Per Page:</label>
            <Form.Select
              size="sm"
              style={{ width: "100px" }}
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              {[5, 10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Form.Select>
          </div>

          <div className="col-md-6 text-md-end">
            <div className="mt-2 d-inline-block mb-2">
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-2"
                onClick={fetchBatches}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </Button>
              <Button
                size="sm"
                onClick={handleAddNewClick}
                style={{ backgroundColor: '#2FA64F', borderColor: '#2FA64F', color: '#fff' }}
              >
                + Add Batch
              </Button>
            </div>
            <Search
              search={search}
              setSearch={setSearch}
              perPage={perPage}
              setPerPage={setPerPage}
              setPage={setPage}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead style={{ backgroundColor: "#2E3A59", color: "white" }}>
              <tr>
                <th
                  style={{
                    width: "120px",
                    textAlign: "center",
                    verticalAlign: "middle",
                    backgroundColor: "#2E3A59",
                    color: "white"
                  }}
                  className="text-center"
                >
                  S.No
                </th>
                <th
                  onClick={() => handleSort("batch")}
                  style={{
                    width: "200px",
                    textAlign: "center",
                    verticalAlign: "middle",
                    cursor: "pointer",
                    backgroundColor: "#2E3A59",
                    color: "white"
                  }}
                  className="text-center"
                >
                  Batch {sortField === "batch" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  style={{
                    width: "160px",
                    textAlign: "center",
                    verticalAlign: "middle",
                    backgroundColor: "#2E3A59",
                    color: "white"
                  }}
                  className="text-center"
                >
                  Action
                </th>
              </tr>


            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : paginatedBatches.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">
                    <img
                      src="/empty-box.png"
                      alt="No batches found"
                      style={{ width: "80px", height: "100px", opacity: 0.6 }}
                    />
                  </td>
                </tr>
              ) : (
                paginatedBatches.map((batch, index) => (
               <tr key={batch.id}>
  <td style={{ width: "120px", textAlign: "center" }}>
    {(page - 1) * perPage + index + 1}
  </td>
  <td style={{ width: "160px", textAlign: "center" }}>
    {batch.batch}
  </td>
  <td style={{ width: "130px", textAlign: "center" }}>
    <Button
      variant=""
      size="sm"
      className="me-1"
      onClick={() => handleEdit(batch)}
      style={{
        borderColor: '#2E3A59',
        color: '#2E3A59'
      }}
    >
      <i className="bi bi-pencil-square"></i>
    </Button>
    <Button
      variant="outline-primary"
      size="sm"
      onClick={() => handleDelete(batch.id)}
      style={{
        borderColor: '#2E3A59',
        color: '#2E3A59',
        backgroundColor: 'transparent'
      }}
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

        <Pagination
          page={page}
          setPage={setPage}
          perPage={perPage}
          totalEntries={filteredBatches.length}
        />
      </Card>

      <Modal show={showModal} onHide={handleModalClose} centered backdrop="static">
        <Modal.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold mb-0">
              {editingBatchId ? "Edit Batch" : "Add New Batch"}
            </h5>
            <Button
              variant="outline-secondary"
              onClick={handleModalClose}
              className="rounded-circle border-0 d-flex align-items-center justify-content-center"
              style={{ width: "32px", height: "32px" }}
            >
              <i className="bi bi-x-lg fs-6"></i>
            </Button>
          </div>

          <Form.Group>
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
            <Button
              variant="success"
              onClick={handleSave}
              disabled={!batchName.trim()}
            >
              {editingBatchId ? "Update" : "Save"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
