import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";

import { API_BASE_URL } from "../api";
import Breadcrumb from "./Components/Breadcrumb";
import Pagination from "./Components/Pagination";
import Search from "./Components/Search";

export default function StatePage() {
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newStateName, setNewStateName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [editingStateId, setEditingStateId] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    fetchCountries();
    fetchStates();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/countries`);
      setCountries(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to fetch countries!");
    }
  };

  const fetchStates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/states`);
      setStates(Array.isArray(res.data) ? res.data : []);
    } catch {
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
      if (editingStateId) {
        await axios.put(`${API_BASE_URL}/states/${editingStateId}`, payload);
        toast.success("State updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/states`, payload);
        toast.success("State added successfully!");
      }
      await fetchStates();
      handleModalClose();
    } catch (error) {
      toast.error("Failed to save state!");
    }
  };

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this state?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/states/${id}`);
      toast.success("State deleted!");
      await fetchStates();
    } catch {
      toast.error("Failed to delete state!");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredStates = states.filter((s) =>
    s.state.toLowerCase().includes(search.toLowerCase()) ||
    s.country?.country.toLowerCase().includes(search.toLowerCase())
  );

  const sortedStates = [...filteredStates].sort((a, b) => {
    if (!sortField) return 0;
    const valA = sortField === "country" ? (a.country?.country || "") : a[sortField];
    const valB = sortField === "country" ? (b.country?.country || "") : b[sortField];
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedStates = sortedStates.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="px-4 py-2">
      <Breadcrumb title="State" />

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
                onClick={fetchStates}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </Button>
              <Button
                size="sm"
                onClick={handleAddNewClick}
                style={{ backgroundColor: '#2FA64F', borderColor: '#2FA64F', color: '#fff' }}
                className="btn-success text-white"
              >
                + Add State
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
          <table className="table  align-middle mb-0 ">
            <thead style={{ backgroundColor: "#2E3A59", color: "white" }}>
              <tr>
                <th style={{
                  width: "70px", textAlign: "center", backgroundColor: "#2E3A59",
                  color: "white",
                }}>S.No</th>
                <th
                  onClick={() => handleSort("state")}
                  style={{
                    backgroundColor: "#2E3A59",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  State {sortField === "state" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("country")}
                  style={{
                    backgroundColor: "#2E3A59",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  Country {sortField === "country" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th style={{
                  width: "130px", backgroundColor: "#2E3A59",
                  color: "white",
                }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : paginatedStates.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    <img
                      src="/empty-box.png"
                      alt="No states found"
                      style={{ width: "80px", height: "100px", opacity: 0.6 }}
                    />
                  
                  </td>
                </tr>
              ) : (
                paginatedStates.map((state, index) => (
                  <tr key={state.id}>
                    <td className="text-center">
                      {(page - 1) * perPage + index + 1}
                    </td>
                    <td>{state.state}</td>
                    <td>{state.country?.country || "—"}</td>
                    <td>
                      <Button
                        variant=""
                        size="sm"
                        className="me-1"
                        onClick={() => handleEdit(state)}
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
                        onClick={() => handleDelete(state.id)}
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

        <div className="">
          <Pagination
            page={page}
            setPage={setPage}
            perPage={perPage}
            totalEntries={filteredStates.length}
          />
        </div>
      </Card>

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
            <Form.Select
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
            >
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
