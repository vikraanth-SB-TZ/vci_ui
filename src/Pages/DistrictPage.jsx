import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form } from "react-bootstrap";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";

export default function DistrictPage() {
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [editId, setEditId] = useState(null);

  const apiBase = "http://127.0.0.1:8000/api";
  const tableRef = useRef(null);

  useEffect(() => {
    fetchStates();
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (!loading && districts.length > 0 && !$.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable({
        ordering: true,
        paging: true,
        searching: true,
        lengthChange: true,
        columnDefs: [{ targets: 0, className: "text-center" }],
      });
    }
  }, [districts, loading]);

  const fetchStates = async () => {
    try {
      const res = await axios.get(`${apiBase}/states`);
      setStates(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchDistricts = async () => {
    setLoading(true);
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      const res = await axios.get(`${apiBase}/districts`);
      setDistricts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    setEditId(null);
    setNewDistrictName("");
    setSelectedStateId("");
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setNewDistrictName("");
    setSelectedStateId("");
    setEditId(null);
  };

  const handleSave = async () => {
    if (!newDistrictName.trim() || !selectedStateId) return;

    const payload = { district: newDistrictName.trim(), state_id: parseInt(selectedStateId) };
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      if (editId) {
        await axios.put(`${apiBase}/districts/${editId}`, payload);
      } else {
        await axios.post(`${apiBase}/districts`, payload);
      }
      await fetchDistricts();
      handleModalClose();
    } catch (error) {
      console.error("Error saving district:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      await axios.delete(`${apiBase}/districts/${id}`);
      await fetchDistricts();
    } catch (error) {
      console.error("Error deleting district:", error);
    }
  };

  const handleEdit = (district) => {
    setEditId(district.id);
    setNewDistrictName(district.district);
    setSelectedStateId(district.state_id || district.state?.id || "");
    setShowModal(true);
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3">
        <h5 className="fw-bold">Districts ({districts.length.toString().padStart(2, "0")})</h5>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={fetchDistricts}>
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
              <th>State</th>
              <th>District</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  <Spinner animation="border" />
                </td>
              </tr>
            ) : districts.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted">
                  No districts found.
                </td>
              </tr>
            ) : (
              districts.map((district, index) => (
                <tr key={district.id}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{district.state?.state || "—"}</td>
                  <td>{district.district}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-1"
                      onClick={() => handleEdit(district)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(district.id)}
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
            <h5 className="fw-semibold mb-0">{editId ? "Edit District" : "Add New District"}</h5>
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
            <Form.Label className="fw-medium">State</Form.Label>
            <Form.Select
              value={selectedStateId}
              onChange={(e) => setSelectedStateId(e.target.value)}
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.state}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label className="fw-medium">District Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter District Name"
              value={newDistrictName}
              onChange={(e) => setNewDistrictName(e.target.value)}
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="light" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleSave}
              disabled={!newDistrictName.trim() || !selectedStateId}
            >
              {editId ? "Update" : "Save"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
