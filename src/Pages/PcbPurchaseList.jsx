import React, { useEffect, useState } from "react";
import { Button, Spinner, Card, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../api";
import Breadcrumb from "./Components/Breadcrumb";
import Pagination from "./Components/Pagination";
import Search from "./Components/Search";
import ActionButtons from "./Components/ActionButtons";

export default function PurchaseListPage() {
  const navigate = useNavigate();

  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const [sortColumn, setSortColumn] = useState("asc");
  const [sortDirection, setSortDirection] = useState("asc");

  const fetchPurchases = () => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/purchase`)
      .then((res) => {
        setPurchaseData(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Error fetching purchase list:", err);
        toast.error("Failed to fetch purchase list.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleEdit = (item) => {
    navigate(`/purchase/${item.id}/edit`);
  };

  const handleDelete = (purchaseId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${API_BASE_URL}/purchase/${purchaseId}`)
          .then((res) => {
            toast.success(res.data.message || "Purchase deleted successfully");
            fetchPurchases();
          })
          .catch((err) => {
            toast.error(err.response?.data?.message || "Failed to delete purchase");
          });
      }
    });
  };

  const handleGenerateInvoice = (purchaseId) => {
    const pdfWindow = window.open(`${API_BASE_URL}/pcb-purchase-invoice/${purchaseId}`, "_blank");
    if (pdfWindow) {
      toast.success("Invoice generated successfully!");
    } else {
      toast.error("Failed to generate invoice.");
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredData = purchaseData
    .filter((item) => {
      const keyword = search.toLowerCase();
      return (
        item.vendor?.toLowerCase().includes(keyword) ||
        item.invoice_no?.toLowerCase().includes(keyword) ||
        item.batch?.toLowerCase().includes(keyword) ||
        item.category?.toLowerCase().includes(keyword) ||
        item.branch?.toLowerCase().includes(keyword) ||
        item.invoice_date?.toLowerCase().includes(keyword) ||
        String(item.quantity).toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        return sortDirection === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }
    });

  const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage);

  const renderHeader = (label, columnKey) => (
    <th
      onClick={() => handleSort(columnKey)}
      style={{
        cursor: "pointer",
        userSelect: "none",
        backgroundColor: "#2E3A59",
        color: "white",
      }}
    >
      {label} {sortColumn === columnKey && (sortDirection === "asc" ? "▲" : "▼")}
    </th>
  );

  return (
    <div className="px-4 py-2">
      <Breadcrumb title="Purchase Order" />

      <Card className="border-0 shadow-sm rounded-3 p-3 mt-3 bg-white">
        <div className="row mb-3">
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

          <div className="col-md-6 text-md-end">
            <div className="mt-2 d-inline-block mb-2">
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-2"
                onClick={fetchPurchases}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/purchase/add")}
                style={{ backgroundColor: "#2FA64F", borderColor: "#2FA64F", color: "#fff" }}
              >
                <i className="bi bi-plus-lg me-1"></i> Add Purchase
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
          <table className="table align-middle mb-0">
            <thead style={{ backgroundColor: "#2E3A59", color: "white" }}>
              <tr>
                <th
                  style={{
                    width: "60px",
                    textAlign: "center",
                    backgroundColor: "#2E3A59",
                    color: "white",
                  }}
                >
                  S.No
                </th>
                {renderHeader("Vendor", "vendor")}
                {renderHeader("Invoice No", "invoice_no")}
                {renderHeader("Invoice Date", "invoice_date")}
                {renderHeader("Batch", "batch")}
                {renderHeader("Category", "category")}
                {renderHeader("Quantity", "quantity")}
                <th
                  style={{
                    width: "140px",
                    backgroundColor: "#2E3A59",
                    color: "white",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    <img
                      src="/empty-box.png"
                      alt="No data"
                      style={{ width: "80px", height: "100px", opacity: 0.6 }}
                    />
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-center">{(page - 1) * perPage + index + 1}</td>
                    <td>{item.vendor}</td>
                    <td>{item.invoice_no}</td>
                    <td>{item.invoice_date}</td>
                    <td>{item.batch}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td className="text-center" style={{ width: "130px" }}>
                      <div className="d-flex justify-content-center">
                        <ActionButtons
                          onPdf={() => handleGenerateInvoice(item.id)}
                          onEdit={() => handleEdit(item)}
                          onDelete={() => handleDelete(item.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          setPage={setPage}
          perPage={perPage}
          totalEntries={filteredData.length}
        />
      </Card>

      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} />
    </div>
  );
}