import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Spinner, Form, Modal } from "react-bootstrap";

const CustomArrow = ({ direction = "down", size = 12, color = "#5a5a5a" }) => {
  let rotate = 0;
  if (direction === "left") rotate = 90;
  if (direction === "right") rotate = -90;
  if (direction === "up") rotate = 180;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ transform: `rotate(${rotate}deg)` }}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 16L6 8h12l-6 8z" />
    </svg>
  );
};

export default function DistrictPage() {
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [editId, setEditId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const apiBase = "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchDistricts();
    fetchStates();
  }, []);

  const fetchDistricts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/districts`);
      setDistricts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const res = await axios.get(`${apiBase}/states`);
      setStates(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const handleAddNewClick = () => {
    setEditId(null);
    setNewDistrictName("");
    setSelectedStateId("");
    setShowModal(true);
  };

  const handleEdit = (district) => {
    setEditId(district.id);
    setNewDistrictName(district.district || "");
    setSelectedStateId(district.state_id || district.state?.id || "");
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setNewDistrictName("");
    setSelectedStateId("");
    setEditId(null);
  };

  const handleSave = async () => {
    if (!newDistrictName.trim() || !selectedStateId) return;

    const payload = {
      district: newDistrictName.trim(),
      state_id: parseInt(selectedStateId),
    };

    try {
      if (editId) {
        const res = await axios.put(`${apiBase}/districts/${editId}`, payload);
        setDistricts(districts.map((d) => (d.id === editId ? res.data : d)));
      } else {
        const res = await axios.post(`${apiBase}/districts`, payload);
        setDistricts([...districts, res.data]);
      }
      handleModalClose();
    } catch (error) {
      console.error("Error saving district:", error.response?.data || error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiBase}/districts/${id}`);
      setDistricts(districts.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Error deleting district:", error);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedDistricts = districts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(districts.length / itemsPerPage);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="vh-100 d-flex flex-column bg-light position-relative">
      {/* Fixed Top Header */}
      <div
        className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white"
        style={{ position: "sticky", top: 0, zIndex: 10 }}
      >
        <h5 className="mb-0 fw-bold">Districts</h5>
        <div>
          <Button
            variant="outline-secondary"
            size="sm"
            className="me-2"
            onClick={fetchDistricts}
          >
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button variant="success" size="sm" onClick={handleAddNewClick}>
            + Add New
          </Button>
        </div>
      </div>

      {/* Table Body with scroll */}
      <div style={{ flex: 1, overflowY: "auto", minWidth: "1200px" }}>
        <div
          className="d-flex align-items-center px-4 border-bottom small fw-semibold"
          style={{
            backgroundColor: "#E9ECEF",
            fontSize: "16px",
            height: "60px",
            color: "#0e0f0eff",
            fontFamily: "Product Sans, sans-serif",
            flex: "0 0 auto",
          }}
        >
          <div style={{ width: "80px" }}>S.No</div>
          <div style={{ flex: 2 }}>State</div>
          <div style={{ flex: 2 }}>District</div>
          <div style={{ flex: 2 }}>Action</div>
        </div>

        {loading ? (
          <div className="text-center mt-4">
            <Spinner animation="border" />
          </div>
        ) : districts.length === 0 ? (
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ height: "calc(80vh - 160px)" }}
          >
            <img
              src="https://placehold.co/160x160/E0E0E0/333333?text=No+Data"
              alt="Empty"
              style={{ width: "160px" }}
            />
            <p className="mt-3 text-muted">No districts found.</p>
          </div>
        ) : (
          paginatedDistricts.map((district, index) => (
            <div
              key={district.id}
              className="px-4 py-2 border-bottom d-flex bg-white align-items-center small"
            >
              <div style={{ width: "80px" }}>
                {indexOfFirstItem + index + 1}
              </div>
              <div style={{ flex: 2 }}>{district.state?.state || "—"}</div>
              <div style={{ flex: 2 }}>{district.district}</div>
              <div style={{ flex: 2 }}>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-1"
                  onClick={() => handleEdit(district)}
                >
                  <i className="bi bi-pencil-square me-1"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(district.id)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fixed Bottom Pagination */}
      {districts.length > 0 && (
        <div
          className="d-flex justify-content-between align-items-center py-2 px-4 border-top bg-white"
          style={{ position: "sticky", bottom: 0 }}
        >
          {/* Per page dropdown */}
          <div
            className="position-relative px-2 py-1 rounded"
            style={{ backgroundColor: "#f1f3f5", width: "140px" }}
          >
            <select
              className="form-select form-select-sm border-0 bg-transparent pe-4"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              style={{
                boxShadow: "none",
                background: "transparent",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                cursor: "pointer",
              }}
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
            <span
              className="position-absolute"
              style={{
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <CustomArrow direction="down" size={12} />
            </span>
          </div>

          {/* Range & navigation */}
          <div
            className="d-flex align-items-center justify-content-between px-3 py-1 rounded"
            style={{
              backgroundColor: "#fff",
              border: "1px solid #dee2e6",
              minWidth: "100px",
            }}
          >
            <Button
              variant="link"
              size="sm"
              className="p-0 me-2"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              <CustomArrow direction="left" />
            </Button>
            <span className="small">
              {districts.length === 0
                ? "0-0"
                : `${indexOfFirstItem + 1}-${Math.min(
                    indexOfLastItem,
                    districts.length
                  )}`}
            </span>
            <Button
              variant="link"
              size="sm"
              className="p-0 ms-2"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              <CustomArrow direction="right" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={handleModalClose}
        centered
        backdrop="static"
        contentClassName="border-0 rounded-4 shadow-sm"
      >
        <Modal.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold mb-0">
              {editId ? "Edit District" : "Add New District"}
            </h5>
            <Button
              variant="outline-secondary"
              onClick={handleModalClose}
              className="rounded-circle d-flex align-items-center justify-content-center border-0"
              style={{ width: "32px", height: "32px" }}
            >
              <i className="bi bi-x-lg fs-6"></i>
            </Button>
          </div>
          <div className="p-3 rounded-3 border-1 mb-3">
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">State</Form.Label>
              <Form.Select
                value={selectedStateId}
                onChange={(e) => setSelectedStateId(e.target.value)}
                className="shadow-none"
              >
                <option value="">Select State</option>
                {states.map((state) => (
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
                className="shadow-none"
              />
            </Form.Group>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="light" onClick={handleModalClose} className="px-4">
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleSave}
              disabled={!newDistrictName.trim() || !selectedStateId}
              className="px-4"
            >
              {editId ? "Update" : "Save"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
