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

export default function DistrictPage() {
  const [countries, setCountries] = useState([]);
  const [modalStates, setModalStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalCountryId, setModalCountryId] = useState("");
  const [modalStateId, setModalStateId] = useState("");
  const [newDistrictName, setNewDistrictName] = useState("");
  const [editId, setEditId] = useState(null);

  const apiBase = "http://127.0.0.1:8000/api";
  const tableRef = useRef(null);

  useEffect(() => {
    fetchCountries();
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

  const fetchCountries = async () => {
    try {
      const res = await axios.get(`${apiBase}/countries`);
      setCountries(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Failed to fetch countries!");
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
      toast.error("Failed to fetch districts!");
    } finally {
      setLoading(false);
    }
  };

  const fetchModalStates = async (countryId) => {
    if (!countryId) {
      setModalStates([]);
      return;
    }
    try {
      const res = await axios.get(`${apiBase}/states/country/${countryId}`);
      setModalStates(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Failed to fetch states!");
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

  const handleEdit = (district) => {
    setEditId(district.id);
    setModalCountryId(district.state?.country?.id || "");
    setModalStateId(district.state?.id || "");
    setNewDistrictName(district.district);
    if (district.state?.country?.id) fetchModalStates(district.state.country.id);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalCountryId("");
    setModalStateId("");
    setModalStates([]);
    setNewDistrictName("");
    setEditId(null);
  };

  const handleSave = async () => {
    if (!modalCountryId) {
      toast.warning("Country is required!");
      return;
    }
    if (!modalStateId) {
      toast.warning("State is required!");
      return;
    }
    if (!newDistrictName.trim()) {
      toast.warning("District name is required!");
      return;
    }

    // --- Client-side duplicate check ---
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

    const payload = { district: newDistrictName.trim(), state_id: parseInt(modalStateId) };
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      if (editId) {
        await axios.put(`${apiBase}/districts/${editId}`, payload);
        toast.success("District updated successfully!");
      } else {
        await axios.post(`${apiBase}/districts`, payload);
        toast.success("District added successfully!");
      }
      await fetchDistricts();
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
        toast.error("Failed to save district!");
      }
    }
  };

  const MySwal = withReactContent(Swal);

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this district?',
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

      await axios.delete(`${apiBase}/districts/${id}`);
      toast.success('District deleted!');
      await fetchDistricts();
    } catch (error) {
      toast.error('Delete failed!');
    }
  };

  return (
    <div className="p-4">
      {/* <ToastContainer position="top-right" autoClose={2000} hideProgressBar /> */}

      <div className="d-flex justify-content-between mb-3">
        <h5 className="fw-bold">Districts ({districts.length.toString().padStart(2, "0")})</h5>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={fetchDistricts}>
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button variant="success" size="sm" onClick={handleAddNewClick}>
            + Add District
          </Button>
        </div>
      </div>

      <div className="table-responsive">
        <table ref={tableRef} className="table custom-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Country</th>
              <th>State</th>
              <th>District</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  <Spinner animation="border" />
                </td>
              </tr>
            ) : districts.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
                  No districts found.
                </td>
              </tr>
            ) : (
              districts.map((district, index) => (
                <tr key={district.id}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{district.state?.country?.country || "—"}</td>
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
            <Form.Label className="fw-medium">Country</Form.Label>
            <Form.Select
              value={modalCountryId}
              onChange={(e) => {
                const value = e.target.value;
                setModalCountryId(value);
                fetchModalStates(value);
                setModalStateId("");
              }}
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
            <Form.Label className="fw-medium">State</Form.Label>
            <Form.Select
              value={modalStateId}
              onChange={(e) => setModalStateId(e.target.value)}
              disabled={!modalCountryId}
            >
              <option value="">Select State</option>
              {modalStates.map((state) => (
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
              disabled={!modalCountryId || !modalStateId || !newDistrictName.trim()}
            >
              {editId ? "Update" : "Save"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
