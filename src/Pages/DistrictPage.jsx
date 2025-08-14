import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form, Card , Offcanvas  } from "react-bootstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { API_BASE_URL } from "../api";
import Breadcrumb from "./Components/Breadcrumb";
import Pagination from "./Components/Pagination";
import Search from "./Components/Search";

export default function DistrictPage() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalCountryId, setModalCountryId] = useState("");
  const [modalStateId, setModalStateId] = useState("");
  const [modalStates, setModalStates] = useState([]);
  const [newDistrictName, setNewDistrictName] = useState("");
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    fetchCountries();
    fetchDistricts();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/countries`);
      setCountries(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to fetch countries!");
    }
  };

  const fetchStatesByCountry = async (countryId) => {
    if (!countryId) {
      setModalStates([]);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/states/country/${countryId}`);
      setModalStates(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching states:", error);


      if (showModal) {
        toast.error("Failed to fetch states!");
      }
    }
  };


  const fetchDistricts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/districts`);
      if (Array.isArray(res.data)) {
        setDistricts(res.data);
      } else {
        setDistricts([]);
      }
    } catch (error) {
      const isServerError = error.response?.status >= 500 || !error.response;
      if (isServerError) toast.error("Failed to fetch Districts!");
      setDistricts([]);
    } finally {
      setLoading(false);
    }
  };


  const handleAddNewClick = () => {
    setEditId(null);
    setModalCountryId("");
    setModalStateId("");
    setNewDistrictName("");
    setModalStates([]);
    setShowModal(true);
  };

  const handleEdit = (d) => {
    setEditId(d.id);
    const countryId = d.state?.country?.id || "";
    const stateId = d.state?.id || "";
    setModalCountryId(countryId);
    setModalStateId(stateId);
    setNewDistrictName(d.district);
    fetchStatesByCountry(countryId);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditId(null);
    setModalCountryId("");
    setModalStateId("");
    setNewDistrictName("");
    setModalStates([]);
  };

  const handleSave = async () => {
    if (!modalCountryId || !modalStateId || !newDistrictName.trim()) {
      toast.warning("All fields are required!");
      return;
    }

    const duplicate = districts.some(
      (d) =>
        d.district.toLowerCase() === newDistrictName.trim().toLowerCase() &&
        d.state_id === parseInt(modalStateId) &&
        d.id !== editId
    );
    if (duplicate) {
      toast.error("District already exists in this state!");
      return;
    }

    const payload = {
      district: newDistrictName.trim(),
      state_id: parseInt(modalStateId),
    };

    try {
      if (editId) {
        await axios.put(`${API_BASE_URL}/districts/${editId}`, payload);


        const updatedState = modalStates.find((s) => s.id === parseInt(modalStateId));
        const updatedCountry = countries.find((c) => c.id === parseInt(modalCountryId));

        setDistricts((prev) =>
          prev.map((d) =>
            d.id === editId
              ? {
                ...d,
                ...payload,
                state: {
                  ...d.state,
                  id: updatedState?.id || d.state?.id,
                  state: updatedState?.state || d.state?.state,
                  country: {
                    ...d.state?.country,
                    id: updatedCountry?.id || d.state?.country?.id,
                    country: updatedCountry?.country || d.state?.country?.country,
                  },
                },
              }
              : d
          )
        );

        toast.success("District updated successfully!");
      } else {
        const res = await axios.post(`${API_BASE_URL}/districts`, payload);


        const newState = modalStates.find((s) => s.id === parseInt(modalStateId));
        const newCountry = countries.find((c) => c.id === parseInt(modalCountryId));

        const newDistrict = {
          ...res.data,
          state: {
            id: newState?.id,
            state: newState?.state,
            country: {
              id: newCountry?.id,
              country: newCountry?.country,
            },
          },
        };

        setDistricts((prev) => [...prev, newDistrict]);
        toast.success("District added successfully!");
      }

      handleModalClose();
    } catch (error) {
      toast.error("Failed to save district!");
    }
  };


  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this district?",
      icon: "warning",
      showCancelButton: true,
     confirmButtonColor: "#d33",
      cancelButtonColor: "#2FA64F",
      confirmButtonText: "Yes, delete it!",
       customClass: {
      popup: "custom-compact" 
    }
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/districts/${id}`);
      toast.success("District deleted!");
      await fetchDistricts();
    } catch {
      toast.error("Delete failed!");
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

  const filtered = districts.filter((d) =>
    d.district.toLowerCase().includes(search.toLowerCase()) ||
    d.state?.state.toLowerCase().includes(search.toLowerCase()) ||
    d.state?.country?.country.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const valA =
      sortField === "country"
        ? a.state?.country?.country
        : sortField === "state"
          ? a.state?.state
          : a[sortField];
    const valB =
      sortField === "country"
        ? b.state?.country?.country
        : sortField === "state"
          ? b.state?.state
          : b[sortField];
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="px-4 " style={{ fontSize: "0.75rem" }}>
      <Breadcrumb title="Districts" />

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

          <div className="col-md-6 text-md-end" style={{ fontSize: '0.8rem' }}>
            <div className="mt-2 d-inline-block mb-2" style={{ fontSize: '0.8rem' }}>
              <Button variant="outline-secondary" size="sm" className="me-2" onClick={fetchDistricts}>
                <i className="bi bi-arrow-clockwise"></i>
              </Button>
              <Button
                size="sm"
                onClick={handleAddNewClick}
                style={{
                  backgroundColor: '#2FA64F',
                  borderColor: '#2FA64F',
                  color: '#fff',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.8rem',
                  minWidth: '90px',
                  height: '28px',
                }}
              >
                + Add District
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
          <table className="table table-sm align-middle mb-0" style={{ fontSize: "0.85rem" }}>
            <thead style={{
              backgroundColor: "#2E3A59", color: "white", fontSize: "0.82rem", height: "40px",           // Increased height

              verticalAlign: "middle",
            }}>
              <tr>
                <th style={{ width: "70px", textAlign: "center", backgroundColor: "#2E3A59", color: "white" }}>S.No</th>
                <th onClick={() => handleSort("country")} style={{ cursor: "pointer", width: "70px", textAlign: "center", backgroundColor: "#2E3A59", color: "white" }}>
                  Country {sortField === "country" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("state")} style={{ cursor: "pointer", width: "70px", textAlign: "center", backgroundColor: "#2E3A59", color: "white" }}>
                  State {sortField === "state" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th onClick={() => handleSort("district")} style={{ cursor: "pointer", width: "70px", textAlign: "center", backgroundColor: "#2E3A59", color: "white" }}>
                  District {sortField === "district" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th style={{ width: "130px", textAlign: "center", backgroundColor: "#2E3A59", color: "white" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    <img src="/empty-box.png" alt="No data" style={{ width: 80, height: 100, opacity: 0.6 }} />
                  </td>
                </tr>
              ) : (
                paginated.map((d, i) => (
                  <tr key={d.id}>
                    <td className="text-center" style={{ width: "70px" }}>
                      {(page - 1) * perPage + i + 1}
                    </td>
                    <td style={{ width: "150px", textAlign: "center" }}>
                      {d.state?.country?.country || "—"}
                    </td>
                    <td style={{ width: "150px", textAlign: "center" }}>
                      {d.state?.state || "—"}
                    </td>
                    <td style={{ width: "150px", textAlign: "center" }}>
                      {d.district}
                    </td>
                    <td style={{ width: "130px", textAlign: "center" }}>
                      <Button
                        variant=""
                        size="sm"
                        className="me-1"
                        onClick={() => handleEdit(d)}
                        style={{ borderColor: "#2E3A59", color: "#2E3A59" }}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </Button>
                      <Button
                        variant=""
                        size="sm"
                        onClick={() => handleDelete(d.id)}
                        style={{ borderColor: "#2E3A59", color: "#2E3A59" }}
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

        <Pagination page={page} setPage={setPage} perPage={perPage} totalEntries={filtered.length} />
      </Card>

     <Offcanvas
  show={showModal}
  onHide={handleModalClose}
  placement="end"
  backdrop="static"
  className="custom-offcanvas"
  style={{ fontSize: "0.85rem", width: "420px" }}
>
  <Offcanvas.Header className="border-bottom">
    <Offcanvas.Title className="fw-semibold">
      {editId ? "Edit District" : "Add New District"}
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

  <Offcanvas.Body>
    <Form className="row g-3">
      <Form.Group className="col-12">
        <Form.Label>Country</Form.Label>
        <Form.Select
          value={modalCountryId}
          onChange={(e) => {
            const id = e.target.value;
            setModalCountryId(id);
            fetchStatesByCountry(id);
            setModalStateId("");
          }}
          size="sm"
        >
          <option value="">Select Country</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.country}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="col-12">
        <Form.Label>State</Form.Label>
        <Form.Select
          value={modalStateId}
          onChange={(e) => setModalStateId(e.target.value)}
          disabled={!modalCountryId}
          size="sm"
        >
          <option value="">Select State</option>
          {modalStates.map((s) => (
            <option key={s.id} value={s.id}>
              {s.state}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="col-12">
        <Form.Label>District Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter District Name"
          value={newDistrictName}
          onChange={(e) => setNewDistrictName(e.target.value)}
          size="sm"
        />
      </Form.Group>
    </Form>

    <div className="d-flex justify-content-end gap-2 mt-4">
      <Button variant="light" onClick={handleModalClose} size="sm">
        Cancel
      </Button>
      <Button
        variant="success"
        onClick={handleSave}
        disabled={!modalCountryId || !modalStateId || !newDistrictName.trim()}
        size="sm"
        style={{ minWidth: "120px" }}
      >
        {editId ? "Update" : "Save"}
      </Button>
    </div>
  </Offcanvas.Body>
</Offcanvas>

    </div>
  );
}
