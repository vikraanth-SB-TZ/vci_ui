import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "datatables.net-dt/css/dataTables.dataTables.css";
import { Offcanvas } from "react-bootstrap";

import { API_BASE_URL } from "../api";
import Breadcrumb from "./Components/Breadcrumb";
import Pagination from "./Components/Pagination";
import Search from "./Components/Search";

export default function CountryPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [countryName, setCountryName] = useState("");
  const [editingCountryId, setEditingCountryId] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/countries`);
      if (Array.isArray(res.data)) {
        setCountries(res.data);
      } else {
        setCountries([]);
      }
    } catch (error) {
      const isServerError = error.response?.status >= 500 || !error.response;
      if (isServerError) toast.error("Failed to fetch countries!");
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    setEditingCountryId(null);
    setCountryName("");
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCountryName("");
    setEditingCountryId(null);
  };

  const handleEdit = (country) => {
    setEditingCountryId(country.id);
    setCountryName(country.country);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!countryName.trim()) {
      toast.warning("Country name is required!");
      return;
    }

    const duplicate = countries.some(
      (c) =>
        c.country.toLowerCase() === countryName.trim().toLowerCase() &&
        c.id !== editingCountryId
    );
    if (duplicate) {
      toast.error("Country already exists!");
      return;
    }

    const payload = { country: countryName.trim() };

    try {
      if (editingCountryId) {
        await axios.put(`${API_BASE_URL}/countries/${editingCountryId}`, payload);
        toast.success("Country updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/countries`, payload);
        toast.success("Country added successfully!");
      }
      await fetchCountries();
      handleModalClose();
    } catch {
      toast.error("Failed to save country!");
    }
  };

  const handleDelete = async (id) => {
    try {
      const confirmed = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this country?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (confirmed.isConfirmed) {
        await axios.delete(`${API_BASE_URL}/countries/${id}`);
        toast.success("Country deleted!");
        await fetchCountries();
      }
    } catch {
      toast.error("Failed to delete country!");
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

  const filteredCountries = countries.filter((c) =>
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  const sortedCountries = [...filteredCountries].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedCountries = sortedCountries.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="px-4" style={{ fontSize: "0.75rem" }}>
      <Breadcrumb title="Country" />

      <Card className="border-0 shadow-sm rounded-3 p-2 px-4 mt-2 bg-white">
        <div className="row mb-2">
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

          <div className="col-md-6 text-md-end" style={{ fontSize: "0.8rem" }}>
            <div className="mt-2 d-inline-block mb-2">
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-2"
                onClick={fetchCountries}

              >
                <i className="bi bi-arrow-clockwise"></i>
              </Button>
              <Button
                size="sm"
                onClick={handleAddNewClick}
                style={{
                  backgroundColor: "#2FA64F",
                  borderColor: "#2FA64F",
                  color: "#fff",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.8rem",
                  minWidth: "90px",
                  height: "28px",
                }}
              >
                + Add Country
              </Button>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
              <Search
                search={search}
                setSearch={setSearch}
                perPage={perPage}
                setPerPage={setPerPage}
                setPage={setPage}
                style={{ fontSize: "0.8rem" }}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0" style={{ fontSize: "0.85rem" }}>
            <thead
              style={{
                backgroundColor: "#2E3A59",
                color: "white",
                fontSize: "0.82rem",
                height: "40px",
                verticalAlign: "middle",
              }}
            >
              <tr>
                <th style={{ width: "70px", textAlign: "center", cursor: "pointer", backgroundColor: "#2E3A59", color: "white" }}>S.No</th>
                <th
                  onClick={() => handleSort("country")}
                  style={{ cursor: "pointer", backgroundColor: "#2E3A59", color: "white" }}
                >
                  Country {sortField === "country" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th style={{ width: "130px", textAlign: "center", backgroundColor: "#2E3A59", color: "white" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : paginatedCountries.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">
                    <img
                      src="/empty-box.png"
                      alt="No countries found"
                      style={{ width: "80px", height: "100px", opacity: 0.6 }}
                    />
                  </td>
                </tr>
              ) : (
                paginatedCountries.map((country, index) => (
                  <tr key={country.id}>
                    <td className="text-center">
                      {(page - 1) * perPage + index + 1}
                    </td>
                    <td>{country.country}</td>
                    <td className="text-center">
                      <Button
                        variant=""
                        size="sm"
                        className="me-1"
                        onClick={() => handleEdit(country)}
                        style={{
                          borderColor: "#2E3A59",
                          color: "#2E3A59",
                        }}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleDelete(country.id)}
                        style={{
                          borderColor: "#2E3A59",
                          color: "#2E3A59",
                          backgroundColor: "transparent",
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
          totalEntries={filteredCountries.length}
        />
      </Card>

      <Offcanvas
        show={showModal}
        onHide={handleModalClose}
        placement="end"
        backdrop="static"
        style={{ width: "400px" }}
         className="custom-offcanvas"
      >
        <Offcanvas.Header className="border-bottom">
          <Offcanvas.Title className="fw-semibold">
            {editingCountryId ? "Edit Country" : "Add New Country"}
          </Offcanvas.Title>
          <div className="ms-auto">
          <Button
            variant="outline-secondary"
            onClick={handleModalClose}
            className="rounded-circle border-0 d-flex align-items-center justify-content-center"
            style={{ width: "32px", height: "32px" }}
          >
            <i className="bi bi-x-lg fs-6"></i>
          </Button>
          </div>
        </Offcanvas.Header>

        <Offcanvas.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Country Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Country Name"
              value={countryName}
              onChange={(e) => setCountryName(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="light" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleSave}
              disabled={!countryName.trim()}
            >
              {editingCountryId ? "Update" : "Save"}
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
