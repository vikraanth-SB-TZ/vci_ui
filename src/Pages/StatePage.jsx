import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

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

  useEffect(() => {
    fetchCountries();
    fetchStates();
  }, []);

  useEffect(() => {
    if (!loading && states.length > 0 && !$.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable({
        ordering: true,
        paging: true,
        searching: true,
        lengthChange: true,
        columnDefs: [{ targets: 0, className: "text-center" }],
      });
    }
  }, [states, loading]);

  const fetchCountries = async () => {
    try {
      const res = await axios.get(`${apiBase}/countries`);
      setCountries(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Failed to fetch countries!");
    }
  };

  const fetchStates = async () => {
    setLoading(true);
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      const res = await axios.get(`${apiBase}/states`);
      setStates(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Failed to fetch states!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    setEditingStateId(null);
    setNewStateName("");
    setCountryId("");
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setNewStateName("");
    setCountryId("");
    setEditingStateId(null);
  };

  const handleEdit = (state) => {
    setEditingStateId(state.id);
    setNewStateName(state.state);
    setCountryId(state.country_id || state.country?.id || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!newStateName.trim()) {
      toast.warning("State name is required!");
      return;
    }
    if (!countryId) {
      toast.warning("Country is required!");
      return;
    }

    // --- Client-side duplicate check ---
    const duplicate = states.some(
      (s) =>
        s.state.toLowerCase() === newStateName.trim().toLowerCase() &&
        s.country_id === parseInt(countryId) &&
        s.id !== editingStateId
    );
    if (duplicate) {
      toast.error("State already exists in this country!");
      return;
    }

    const payload = { state: newStateName.trim(), country_id: parseInt(countryId) };

    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      if (editingStateId) {
        await axios.put(`${apiBase}/states/${editingStateId}`, payload);
        toast.success("State updated successfully!");
      } else {
        await axios.post(`${apiBase}/states`, payload);
        toast.success("State added successfully!");
      }
      await fetchStates();
      handleModalClose();
    } catch (error) {
      if (error.response?.status === 422) {
        if (error.response.data.message) {
          toast.error(error.response.data.message);
        } else if (error.response.data.errors) {
          const errors = error.response.data.errors;
          Object.values(errors).forEach((msg) => toast.error(msg[0]));
        } else {
          toast.error("Validation failed!");
        }
      } else {
        toast.error("Failed to save state!");
      }
    }
  };


  const MySwal = withReactContent(Swal);

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this state?',
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

      await axios.delete(`${apiBase}/states/${id}`);
      toast.success('State deleted!');
      await fetchStates();
    } catch (error) {
      toast.error('Failed to delete state!');
    }
  };


  return (
    <div className="p-4">

      <div className="d-flex justify-content-between mb-3">
        <h5 className="fw-bold">States ({states.length.toString().padStart(2, "0")})</h5>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={fetchStates}>
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
              <th>Country</th>
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
            ) : states.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted">
                  No states found.
                </td>
              </tr>
            ) : (
              states.map((state, index) => (
                <tr key={state.id}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{state.state}</td>
                  <td>{state.country?.country || "—"}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-1"
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
            <h5 className="fw-semibold mb-0">
              {editingStateId ? "Edit State" : "Add New State"}
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
            <Form.Label className="fw-medium">Select Country</Form.Label>
            <Form.Select value={countryId} onChange={(e) => setCountryId(e.target.value)}>
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.country}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">State Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter State Name"
              value={newStateName}
              onChange={(e) => setNewStateName(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="light" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleSave}
              disabled={!newStateName.trim() || !countryId}
            >
              {editingStateId ? "Update" : "Save"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
