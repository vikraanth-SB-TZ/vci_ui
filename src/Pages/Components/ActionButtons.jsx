// src/components/ActionButtons.jsx
import React from "react";
import { Button } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function ActionButtons({ onPdf, onEdit, onDelete }) {
  return (
    <td className="d-flex gap-2">
      {onPdf && (
        <Button variant="outline-success" size="sm" onClick={onPdf}>
          <i className="bi bi-file-earmark-pdf"></i>
        </Button>
      )}
      {onEdit && (
        <Button variant="outline-info" size="sm" onClick={onEdit}>
          <i className="bi bi-pencil-square"></i>
        </Button>
      )}
      {onDelete && (
        <Button variant="outline-danger" size="sm" onClick={onDelete}>
          <i className="bi bi-trash"></i>
        </Button>
      )}
    </td>
  );
}
