import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button, Spinner, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { API_BASE_URL } from "../api";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);


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
      const res = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Failed to fetch categories!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    setEditingCategoryId(null);
    setCategoryName("");
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.category);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCategoryName("");
    setEditingCategoryId(null);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      toast.warning("Category name is required!");
      return;
    }

    // --- Client-side duplicate check ---
    const duplicate = categories.some(
      (c) => c.category.toLowerCase() === categoryName.trim().toLowerCase() && c.id !== editingCategoryId
    );
    if (duplicate) {
      toast.error("Category already exists!");
      return;
    }

    const payload = { category: categoryName.trim() };

    try {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      if (editingCategoryId) {
        await axios.put(`${API_BASE_URL}/categories/${editingCategoryId}`, payload);
        toast.success("Category updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/categories`, payload);
        toast.success("Category added successfully!");
      }

      await fetchCategories();
      handleModalClose();
    } catch (error) {
      if (error.response?.status === 422) {
        if (error.response.data.message) {
          toast.error(error.response.data.message); // backend custom duplicate msg
        } else if (error.response.data.errors) {
          const errors = error.response.data.errors;
          Object.values(errors).forEach((msg) => toast.error(msg[0]));
        } else {
          toast.error("Validation failed!");
        }
      } else {
        toast.error("Failed to save category!");
      }
    }
  };

  const MySwal = withReactContent(Swal);

const handleDelete = async (id) => {
  const result = await MySwal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to delete this category?',
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

    await axios.delete(`${API_BASE_URL}/categories/${id}`);
    toast.success('Category deleted!');
    await fetchCategories();
  } catch (error) {
    toast.error('Failed to delete category!');
  }
};


  return (
    <div className="p-4">

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

      <Modal show={showModal} onHide={handleModalClose} centered backdrop="static">
        <Modal.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold mb-0">
              {editingCategoryId ? "Edit Category" : "Add New Category"}
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
            <Button variant="success" onClick={handleSave} disabled={!categoryName.trim()}>
              {editingCategoryId ? "Update" : "Save"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
