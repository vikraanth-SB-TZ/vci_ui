import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form, Table } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

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

  return (
    <div className="w-100 py-4 bg-white" style={{ minHeight: '100vh', fontFamily: 'Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif', fontSize: '14px', fontWeight: '500' }}>
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 px-4">
        <h4 className="fw-semibold text-dark mb-0 fs-4">
          Category List <span className="text-dark fw-semibold">({categories.length})</span>
        </h4>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary p-0" style={{ width: '38px', height: '38px' }} onClick={fetchCategories}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <i className="bi bi-arrow-clockwise fs-5 text-secondary"></i>
            )}
          </Button>
          <Button
            size="sm"
            variant="success d-flex align-items-center px-3"
            style={{ minWidth: '100px', fontSize: '0.9rem', fontWeight: '500' }}
            onClick={handleAddNewClick}
          >
            <i className="bi bi-plus me-1"></i> Add New
          </Button>
        </div>
      </div>

      {/* Table or Empty State */}
      {categories.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <img
              src="/empty-box.png"
              alt="No Data"
              style={{ width: "160px", opacity: 0.6 }}
              className="mb-3"
            />
            <div className="text-muted fs-6">No category data available</div>
          </div>
        </div>
      ) : (
        <div className="shadow-sm overflow-hidden mx-4" style={{ borderRadius: '0.5rem' }}>
          <Table hover responsive size="sm" className="table-border mb-0">
            <thead>
              <tr className="border-bottom border-secondary-subtle">
                <th className="text-dark fw-semibold py-3 ps-4" style={{ backgroundColor: '#f3f7faff' }}>S.No</th>
                <th className="text-dark fw-medium py-3" style={{ backgroundColor: '#f6f7f8ff' }}>VCI Category</th>
                <th className="text-dark fw-medium py-3 pe-4" style={{ backgroundColor: '#f6f7f8ff' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr key={cat.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                  <td className="py-2 ps-4 text-dark">{String(index + 1).padStart(2, '0')}</td>
                  <td className="py-2 text-dark">{cat.category}</td>
                  <td className="py-2 pe-4 d-flex gap-2">
                    <Button variant="outline-primary" size="sm" title="Edit" onClick={() => handleEdit(cat)}>
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" title="Delete" onClick={() => handleDelete(cat.id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={handleModalClose} centered backdrop="static">
        <Modal.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h5 className="fw-bold mb-0">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h5>
            <Button
              variant="light"
              onClick={handleModalClose}
              className="rounded-circle p-1"
              style={{ width: 32, height: 32 }}
            >
              <i className="bi bi-x-lg"></i>
            </Button>
          </div>

          <Form.Group className="mb-4">
            <Form.Label>Category</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Category"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="border-0 border-bottom rounded-0 shadow-none"
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button
              variant="success"
              onClick={handleSave}
              disabled={!categoryName.trim()}
              style={{ width: 120 }}
            >
              Save
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
