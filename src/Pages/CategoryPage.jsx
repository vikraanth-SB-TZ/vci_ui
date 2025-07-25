import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';

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

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const apiBase = "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/categories`);
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    setEditingCategory(null);
    setCategoryName("");
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.category);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCategoryName("");
    setEditingCategory(null);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) return;
    const payload = { category: categoryName.trim() };

    try {
      if (editingCategory) {
        const res = await axios.put(`${apiBase}/categories/${editingCategory.id}`, payload);
        setCategories(categories.map(c => (c.id === editingCategory.id ? res.data : c)));
      } else {
        const res = await axios.post(`${apiBase}/categories`, payload);
        setCategories([...categories, res.data]);
      }
      handleModalClose();
    } catch (error) {
      console.error("Error saving category:", error.response?.data || error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiBase}/categories/${id}`);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedCategories = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="vh-100 d-flex flex-column bg-light position-relative">
      {/* Header */}
      <div
        className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white"
        style={{ position: "sticky", top: 0, zIndex: 10 }}
      >
        <h5 className="mb-0 fw-bold">Category List</h5>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={fetchCategories}>
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button variant="success" size="sm" onClick={handleAddNewClick}>
            + Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: "auto", minWidth: "800px" }}>
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
          <div style={{ flex: 2 }}>VCI Category</div>
          <div style={{ flex: 2 }}>Action</div>
        </div>

        {loading ? (
          <div className="text-center mt-4">
            <Spinner animation="border" />
          </div>
        ) : categories.length === 0 ? (
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ height: "calc(80vh - 160px)" }}
          >
            <img
              src="https://placehold.co/160x160/E0E0E0/333333?text=No+Data"
              alt="Empty"
              style={{ width: "160px" }}
            />
            <p className="mt-3 text-muted">No category data available</p>
          </div>
        ) : (
          paginatedCategories.map((cat, index) => (
            <div
              key={cat.id}
              className="px-4 py-2 border-bottom d-flex bg-white align-items-center small"
            >
              <div style={{ width: "80px" }}>{indexOfFirstItem + index + 1}</div>
              <div style={{ flex: 2 }}>{cat.category}</div>
              <div style={{ flex: 2 }}>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-1"
                  onClick={() => handleEdit(cat)}
                >
                  <i className="bi bi-pencil-square me-1"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(cat.id)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Pagination */}
      {categories.length > 0 && (
        <div
          className="d-flex justify-content-between align-items-center py-2 px-4 border-top bg-white"
          style={{ position: "sticky", bottom: 0 }}
        >
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
              {categories.length === 0
                ? "0-0"
                : `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, categories.length)}`}
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
      <Modal show={showModal} onHide={handleModalClose} centered backdrop="static" contentClassName="border-0 rounded-4 shadow-sm">
        <Modal.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold mb-0">
              {editingCategory ? "Edit Category" : "Add New Category"}
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
            <Form.Group>
              <Form.Label className="fw-medium">Category Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
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
              disabled={!categoryName.trim()}
              className="px-4"
            >
              Save
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
