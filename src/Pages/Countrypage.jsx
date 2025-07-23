import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form } from "react-bootstrap";

export default function CountryPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newCountryName, setNewCountryName] = useState("");
  const [editId, setEditId] = useState(null);

  const apiBase = "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/countries`);
      setCountries(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    setEditId(null);
    setNewCountryName("");
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setNewCountryName("");
    setEditId(null);
  };

  const handleSave = async () => {
    if (!newCountryName.trim()) return;

    const payload = { country: newCountryName.trim() };

    try {
      if (editId) {
        const res = await axios.put(`${apiBase}/countries/${editId}`, payload);
        setCountries(
          countries.map((c) => (c.id === editId ? res.data : c))
        );
      } else {
        const res = await axios.post(`${apiBase}/countries`, payload);
        setCountries([...countries, res.data]);
      }
      handleModalClose();
    } catch (error) {
      console.error("Error saving country:", error.response?.data || error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiBase}/countries/${id}`);
      setCountries(countries.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting country:", error);
    }
  };

  const handleEdit = (country) => {
    setEditId(country.id);
    setNewCountryName(country.country);
    setShowModal(true);
  };

  return (
    <div className="d-flex flex-column h-100">
      {/* Header */}
      <section className="px-4 py-3 border-bottom bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">
          Country{" "}
          <span className="text-muted fw-normal">
            ({String(countries.length).padStart(2, "0")})
          </span>
        </h5>
        <div>
          <Button variant="light" className="me-2" onClick={fetchCountries}>
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

      {/* Table Header */}
      <div className="px-4 py-2 border-bottom d-none d-md-flex text-muted bg-light small fw-semibold">
        <div style={{ width: "80px" }}>S.No</div>
        <div style={{ flex: 1 }}>Country</div>
        <div style={{ width: "150px" }}>Action</div>
      </div>

      {/* Table Body */}
      <div className="flex-grow-1 overflow-auto bg-light">
        {countries.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="text-center">
              <img
                src="/empty-box.png"
                alt="Empty"
                style={{ width: "160px" }}
                className="mb-2"
              />
              {/* <div className="text-muted">No countries found.</div> */}
            </div>
          </div>
        ) : (
          <div className="px-4 py-1">
            {countries.map((country, index) => (
              <div
                key={country.id}
                className="d-flex align-items-center py-3 border-bottom"
              >
                <div style={{ width: "80px" }}>
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div style={{ flex: 1 }}>{country.country}</div>
                <div style={{ width: "150px" }}>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(country)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(country.id)}
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
            <h5 className="fw-bold mb-0">{editId ? "Edit Country" : "Add New Country"}</h5>
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
            <Form.Label>Country Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Country Name"
              value={newCountryName}
              onChange={(e) => setNewCountryName(e.target.value)}
              className="border-0 border-bottom rounded-0 shadow-none"
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button
              variant="success"
              onClick={handleSave}
              disabled={!newCountryName.trim()}
              style={{ width: 120 }}
            >
              Save
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
