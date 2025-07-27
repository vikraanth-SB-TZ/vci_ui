import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form } from "react-bootstrap";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";

export default function StatePage() {
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newStateName, setNewStateName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [editingStateId, setEditingStateId] = useState(null);

  const apiBase = "http://127.0.0.1:8000/api";
  const tableRef = useRef(null);

  // ✅ Fetch data on mount
  useEffect(() => {
    fetchStates();
    fetchCountries();
  }, []);

  // ✅ Initialize / reload DataTable every time states changes
  useEffect(() => {
    if (!loading && states.length > 0) {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      $(tableRef.current).DataTable({
        ordering: true,
        paging: true,
        searching: true,
        lengthChange: true,
      });
    }
  }, [states, loading]);

  const fetchStates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/states`);
      setStates(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching states:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await axios.get(`${apiBase}/countries`);
      setCountries(res.data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const handleAddNewClick = () => {
    setEditingStateId(null);
    setNewStateName("");
    setCountryId("");
    setShowModal(true);
  };

  const handleEdit = (state) => {
    setEditingStateId(state.id);
    setNewStateName(state.state);
    setCountryId(state.country?.id);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setNewStateName("");
    setCountryId("");
    setEditingStateId(null);
  };

  const handleSave = async () => {
    if (!newStateName.trim() || !countryId) return;
    const payload = { state: newStateName.trim(), country_id: parseInt(countryId) };

    try {
      // destroy DataTable before change
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      const selectedCountry = countries.find(c => c.id === parseInt(countryId));

      if (editingStateId) {
        const res = await axios.put(`${apiBase}/states/${editingStateId}`, payload);

        setStates(prev =>
          prev.map(s =>
            s.id === editingStateId
              ? { ...res.data, country: selectedCountry }
              : s
          )
        );
      } else {
        const res = await axios.post(`${apiBase}/states`, payload);

        setStates(prev => [
          ...prev,
          { ...res.data, country: selectedCountry }
        ]);
      }

      handleModalClose();
    } catch (error) {
      console.error("Error saving state:", error.response?.data || error);
    }
  };


  const handleDelete = async (id) => {
    try {
      // ❗ Destroy DataTable before changing state
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      await axios.delete(`${apiBase}/states/${id}`);
      setStates((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting state:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3">
        <h5 className="fw-bold">
    States ({states.length.toString().padStart(2, '0')})
  </h5>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={fetchStates}>
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button variant="success" size="sm" onClick={handleAddNewClick}>
            + Add New
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <div className="table-responsive ">
          <table ref={tableRef} className="table custom-table">
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>S.No</th>
                <th>State</th>
                <th>Country</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {states.map((state, index) => (
                <tr key={state.id}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{state.state}</td>
                  <td>{state.country?.country || "—"}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(state)}>
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(state.id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={handleModalClose} centered backdrop="static">
        <Modal.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold mb-0">{editingStateId ? "Edit State" : "Add New State"}</h5>
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
            <Form.Label className="fw-medium">State Name</Form.Label>
            <Form.Control type="text" value={newStateName} onChange={(e) => setNewStateName(e.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label className="fw-medium">Select Country</Form.Label>
            <Form.Select value={countryId} onChange={(e) => setCountryId(e.target.value)}>
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.country}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="light" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleSave} disabled={!newStateName.trim() || !countryId}>
              {editingStateId ? "Update" : "Save"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
