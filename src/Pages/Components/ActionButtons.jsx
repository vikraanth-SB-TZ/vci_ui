// src/components/ActionButtons.jsx
import React from "react";
import { Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ActionButtons({ onPdf, onEdit, onDelete ,onReturn }) {
  return (
    <>
      {onPdf && (
        <Button
          variant=""
          size="sm"
          className="me-1"
          onClick={onPdf}
          style={{
            borderColor: "#2E3A59",
            color: "#2E3A59",
            backgroundColor: "transparent",
            width: "32px",
            height: "32px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
          }}
        >
          <i className="bi bi-file-earmark-pdf"></i>
        </Button>
      )}

      {onEdit && (
        <Button
          variant=""
          size="sm"
          className="me-1"
          onClick={onEdit}
          style={{
            borderColor: "#2E3A59",
            color: "#2E3A59",
            backgroundColor: "transparent",
            width: "32px",
            height: "32px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
          }}
        >
          <i className="bi bi-pencil-square"></i>
        </Button>
      )}

      {onDelete && (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={onDelete}
          style={{
            borderColor: "#2E3A59",
            color: "#2E3A59",
            backgroundColor: "transparent",
            width: "32px",
            height: "32px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
          }}
        >
          <i className="bi bi-trash"></i>
        </Button>
      )}


         {onReturn && (
        <button
          className="btn btn-sm btn-outline-info"
          title="Return Purchase"
          onClick={onReturn}
        >
          <i className="bi bi-arrow-return-left"></i>
        </button>
      )}
    </>
  );
}
