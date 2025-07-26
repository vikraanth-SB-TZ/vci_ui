import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form } from "react-bootstrap";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";

export default function CountryPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newCountryName, setNewCountryName] = useState("");
  const [editId, setEditId] = useState(null);

  const apiBase = "http://127.0.0.1:8000/api";
  const tableRef = useRef(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!loading && countries.length > 0 && !$.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable({
        ordering: true,
        paging: true,
        searching: true,
        lengthChange: true,
        columnDefs: [{ targets: 0, className: "text-center" }],
      });
    }
  }, [countries, loading]);

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
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      if (editId) {
        const res = await axios.put(`${apiBase}/countries/${editId}`, payload);
        setCountries((prev) => prev.map((c) => (c.id === editId ? res.data : c)));
      } else {
        const res = await axios.post(`${apiBase}/countries`, payload);
        setCountries((prev) => [...prev, res.data]);
      }
      handleModalClose();
    } catch (error) {
      console.error("Error saving country:", error.response?.data || error);
    }
  };

  const handleDelete = async (id) => {
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      await axios.delete(`${apiBase}/countries/${id}`);
      setCountries((prev) => prev.filter((c) => c.id !== id));
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
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3">
        <h5 className="fw-bold">Countries ({countries.length.toString().padStart(2, "0")})</h5>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={fetchCountries}>
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
              <th>Country</th>
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
            ) : countries.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-muted">
                  No countries found.
                </td>
              </tr>
            ) : (
              countries.map((country, index) => (
                <tr key={country.id}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{country.country}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-1"
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
            <h5 className="fw-semibold mb-0">{editId ? "Edit Country" : "Add New Country"}</h5>
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
            <Form.Label className="fw-medium">Country Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Country Name"
              value={newCountryName}
              onChange={(e) => setNewCountryName(e.target.value)}
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="light" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleSave} disabled={!newCountryName.trim()}>
              {editId ? "Update" : "Save"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
