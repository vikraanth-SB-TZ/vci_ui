import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form } from "react-bootstrap";

export default function StatePage() {
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newStateName, setNewStateName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [editingStateId, setEditingStateId] = useState(null);

  const apiBase = "http://localhost:8000/api";

  useEffect(() => {
    fetchStates();
    fetchCountries();
  }, []);

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
    setCountryId(state.country_id);
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

    const payload = {
      state: newStateName.trim(),
      country_id: parseInt(countryId),
    };

    try {
      if (editingStateId) {
        const res = await axios.put(`${apiBase}/states/${editingStateId}`, payload);
        setStates(states.map((s) => (s.id === editingStateId ? res.data : s)));
      } else {
        const res = await axios.post(`${apiBase}/states`, payload);
        setStates([...states, res.data]);
      }
      handleModalClose();
    } catch (error) {
      console.error("Error saving state:", error.response?.data || error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiBase}/states/${id}`);
      setStates(states.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting state:", error);
    }
  };

  return (
    <div className="d-flex flex-column h-100">
      <section className="px-4 py-3 border-bottom bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">
          State{" "}
          <span className="text-muted fw-normal">
            ({String(states.length).padStart(2, "0")})
          </span>
        </h5>
        <div>
          <Button variant="light" className="me-2" onClick={fetchStates}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <i className="bi bi-arrow-clockwise"></i>
            )}
          </Button>
          <Button variant="success" onClick={handleAddNewClick}>
            <i className="bi bi-plus-lg me-1"></i> Add New
          </Button>
        </div>
      </section>

      <div className="px-4 py-2 border-bottom d-none d-md-flex text-muted bg-light small fw-semibold">
        <div style={{ width: "80px" }}>S.No</div>
        <div style={{ flex: 1 }}>State</div>
        <div style={{ flex: 1 }}>Country</div>
        <div style={{ width: "940px" }}>Action</div>
      </div>

      <div className="flex-grow-1 overflow-auto bg-light">
        {states.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="text-center">
              <img
                src="/empty-box.png"
                alt="Empty"
                style={{ width: "160px" }}
                className="mb-2"
              />
              {/* <div className="text-muted">No states found.</div> */}
            </div>
          </div>
        ) : (
          <div className="px-4 py-1">
            {states.map((state, index) => (
              <div
                key={state.id}
                className="d-flex align-items-center py-3 border-bottom"
              >
                <div style={{ width: "80px" }}>
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div style={{ flex: 1 }}>{state.state}</div>
                <div style={{ flex: 1 }}>{state.country?.name || "—"}</div>
                <div style={{ width: "940px" }}>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(state)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(state.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={handleModalClose} centered backdrop="static">
        <Modal.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h5 className="fw-bold mb-0">
              {editingStateId ? "Edit State" : "Add New State"}
            </h5>
            <Button
              variant="light"
              onClick={handleModalClose}
              className="rounded-circle p-1"
              style={{ width: 32, height: 32 }}
            >
              <i className="bi bi-x-lg"></i>
            </Button>
          </div>

          <Form.Group className="mb-4">
            <Form.Label>State Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter State Name"
              value={newStateName}
              onChange={(e) => setNewStateName(e.target.value)}
              className="border-0 border-bottom rounded-0 shadow-none"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Select Country</Form.Label>
            <Form.Select
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
              className="border-0 border-bottom rounded-0 shadow-none"
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button
              variant="success"
              onClick={handleSave}
              disabled={!newStateName.trim() || !countryId}
              style={{ width: 120 }}
            >
              {editingStateId ? "Update" : "Save"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
