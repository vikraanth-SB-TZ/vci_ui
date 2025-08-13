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

export default function ServiceVciListPage() {
  const navigate = useNavigate();

  const [serviceData, setServiceData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

  const fetchServices = () => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/service-vci-list`)
      .then((res) => {
        const rows = Array.isArray(res.data.data) ? res.data.data : [];
        setServiceData(rows);
      })
      .catch((err) => {
        console.error("Error fetching service VCI list:", err);
        toast.error("Failed to fetch service VCI list.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEdit = (item) => {
    navigate(`/service-vci/${item.id}/edit`);
  };

  const handleDelete = (serviceId) => {
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
          .delete(`${API_BASE_URL}/service-vci/${serviceId}`)
          .then((res) => {
            toast.success(res.data.message || "Record deleted successfully");
            fetchServices();
          })
          .catch((err) => {
            toast.error(err.response?.data?.message || "Failed to delete");
          });
      }
    });
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredData = serviceData
    .filter((item) => {
      const keyword = search.toLowerCase();
      return (
        item.category_name?.toLowerCase().includes(keyword) ||
        item.challan_no?.toLowerCase().includes(keyword) ||
        String(item.quantity || "").includes(keyword) ||
        (item.status || "").toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
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
      <Breadcrumb title="Service VCI List" />

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
                onClick={fetchServices}
              >
                <i className="bi bi-arrow-clockwise"></i>
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/service-vci/add")}
                style={{ backgroundColor: "#2FA64F", borderColor: "#2FA64F", color: "#fff" }}
              >
                <i className="bi bi-plus-lg me-1"></i> Add Service VCI
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
                <th     style={{
                    width: "60px",
                    textAlign: "center",
                    backgroundColor: "#2E3A59",
                    color: "white",
                  }}>S.No</th>
                {renderHeader("Category", "category_name")}
                {renderHeader("Challan No", "challan_no")}
                {renderHeader("Challan Date", "challan_date")}
                {renderHeader("Quantity", "quantity")}
                {renderHeader("Status", "status")}
                <th        style={{
                    width: "140px",
                    backgroundColor: "#2E3A59",
                    color: "white",
                  }}>Actions</th>
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
                    <td>{item.category_name}</td>
                    <td>{item.challan_no}</td>
                    <td>{item.challan_date}</td>
                    <td>{item.quantity}</td>
                    <td>{item.status}</td>
                    <td className="text-center" style={{ width: "130px" }}>
                      <div className="d-flex justify-content-center gap-1">
                        <ActionButtons
                          onPdf={() => window.open(`${API_BASE_URL}/service-vci-invoice/${item.id}`, "_blank")}
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
