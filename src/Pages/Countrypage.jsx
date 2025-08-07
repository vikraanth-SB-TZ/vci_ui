// CountryPage.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { API_BASE_URL } from "../api";

export default function CountryPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [countryName, setCountryName] = useState("");
  const [editingCountryId, setEditingCountryId] = useState(null);
  const [tableReady, setTableReady] = useState(false);

  const tableRef = useRef(null);
  const savedPage = useRef(0);
  const savedRowIndex = useRef(null);
  const hasShownNoDataToast = useRef(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!loading && countries.length > 0) {
        const $table = $(tableRef.current);
        if (!$.fn.DataTable.isDataTable(tableRef.current)) {
          const dt = $table.DataTable({
            ordering: true,
            paging: true,
            searching: true,
            lengthChange: true,
            columnDefs: [{ targets: 0, className: "text-center" }],
            pageLength: 10,
          });

          if (savedPage.current >= 0) {
            dt.page(savedPage.current).draw(false);
            savedPage.current = 0;
          }
        }
        setTableReady(true);
      } else {
        setTableReady(true);
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [countries, loading]);

  const fetchCountries = async (showErrorToast = true) => {
    setLoading(true);
    setTableReady(false);
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        const table = $(tableRef.current).DataTable();
        savedPage.current = table.page.info().page;
        table.destroy();
      }

      const res = await axios.get(`${API_BASE_URL}/countries`);
      const data = Array.isArray(res.data) ? res.data : [];

      if (editingCountryId && savedRowIndex.current !== null) {
        const edited = data.find((c) => c.id === editingCountryId);
        if (edited) {
          data.splice(data.indexOf(edited), 1);
          data.splice(savedRowIndex.current, 0, edited);
        }
      }

      setCountries(data);

      // Reset toast tracking if data found
      if (data.length > 0) {
        hasShownNoDataToast.current = false;
      }
    } catch (error) {
      if (showErrorToast && !hasShownNoDataToast.current) {
        toast.error("Failed to fetch countries!");
        hasShownNoDataToast.current = true;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    setEditingCountryId(null);
    setCountryName("");
    setShowModal(true);
  };

  const handleEdit = (country, index) => {
    setEditingCountryId(country.id);
    setCountryName(country.country);
    setShowModal(true);

    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      const table = $(tableRef.current).DataTable();
      savedPage.current = table.page.info().page;
      savedRowIndex.current = index;
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCountryName("");
    setEditingCountryId(null);
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
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        const table = $(tableRef.current).DataTable();
        savedPage.current = table.page.info().page;
        table.destroy();
      }

      if (editingCountryId) {
        await axios.put(`${API_BASE_URL}/countries/${editingCountryId}`, payload);
        toast.success("Country updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/countries`, payload);
        toast.success("Country added successfully!");
      }

      await fetchCountries(false);
      handleModalClose();
    } catch (error) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          Object.values(errors).forEach((msg) => toast.error(msg[0]));
        } else {
          toast.error(error.response.data.message || "Validation failed!");
        }
      } else {
        toast.error("Failed to save country!");
      }
    }
  };

  const MySwal = withReactContent(Swal);

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this country?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
  
    if (!result.isConfirmed) return;
  
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        const table = $(tableRef.current).DataTable();
        savedPage.current = table.page.info().page;
        table.destroy();
      }
  
      await axios.delete(`${API_BASE_URL}/countries/${id}`);
      toast.success("Country deleted!");
  
      setCountries([]);
  
      
      await fetchCountries(false);
    } catch (error) {
      toast.error("Failed to delete country!");
    }
  };
  

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3">
        <h5 className="fw-bold">
          Countries ({countries.length.toString().padStart(2, "0")})
        </h5>
        <div>
          <Button
            variant="outline-secondary"
            size="sm"
            className="me-2"
            onClick={() => fetchCountries()}
          >
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button
            size="sm"
            onClick={handleAddNewClick}
            style={{ backgroundColor: "#2FA64F", borderColor: "#2FA64F", color: "#fff" }}
          >
            + Add New
          </Button>
        </div>
      </div>

      <div className="table-responsive">
        {tableReady && (
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
                        onClick={() => handleEdit(country, index)}
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
        )}
      </div>

      <Modal show={showModal} onHide={handleModalClose} centered backdrop="static">
        <Modal.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold mb-0">
              {editingCountryId ? "Edit Country" : "Add New Country"}
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
            <Button variant="success" onClick={handleSave} disabled={!countryName.trim()}>
              {editingCountryId ? "Update" : "Save"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
