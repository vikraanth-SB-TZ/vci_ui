import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form } from "react-bootstrap";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  const apiBase = "http://127.0.0.1:8000/api";
  const tableRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!loading && categories.length > 0 && !$.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable({
        ordering: true,
        paging: true,
        searching: true,
        lengthChange: true,
        columnDefs: [{ targets: 0, className: "text-center" }],
      });
    }
  }, [categories, loading]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      const res = await axios.get(`${apiBase}/categories`);
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories.");
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
    if (!categoryName.trim()) {
      toast.error("Category name is required!");
      return;
    }
    const payload = { category: categoryName.trim() };
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      if (editingCategory) {
        const res = await axios.put(`${apiBase}/categories/${editingCategory.id}`, payload);
        setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? res.data : c)));
        toast.success("Category updated successfully!");
      } else {
        const res = await axios.post(`${apiBase}/categories`, payload);
        setCategories((prev) => [...prev, res.data]);
        toast.success("Category added successfully!");
      }
      handleModalClose();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category.");
    }
  };

  const handleDelete = async (id) => {
    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      await axios.delete(`${apiBase}/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted successfully.");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category.");
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between mb-3">
        <h5 className="fw-bold">Categories ({categories.length.toString().padStart(2, "0")})</h5>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={fetchCategories}>
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
              <th>Category</th>
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
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-muted">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category, index) => (
                <tr key={category.id}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>{category.category}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-1"
                      onClick={() => handleEdit(category)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
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

      {/* Modal */}
      <Modal show={showModal} onHide={handleModalClose} centered backdrop="static">
        <Modal.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold mb-0">
              {editingCategory ? "Edit Category" : "Add New Category"}
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
            <Form.Label className="fw-medium">Category Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="light" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleSave}
              disabled={!categoryName.trim()}
            >
              {editingCategory ? "Update" : "Save"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
