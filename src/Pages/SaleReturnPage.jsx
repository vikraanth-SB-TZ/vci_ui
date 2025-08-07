import React, { useEffect, useState } from "react";
import { Button, Spinner, Card, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../api";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Breadcrumb from "./Components/Breadcrumb";
import Search from "./Components/Search";
import Pagination from "./Components/Pagination";

const MySwal = withReactContent(Swal);

export default function ReturnListPage() {
  const navigate = useNavigate();
  const [returnData, setReturnData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/saleReturns`);
      if (res.data.data) {
        setReturnData(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to fetch return data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleDeleteReturn = async (returnId) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this return?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/sale-returns-del/${returnId}`);
      toast.success("Return deleted successfully!");

      const newData = returnData.filter((item) => item.id !== returnId);
      setReturnData(newData);

      if ((page - 1) * perPage >= newData.length && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      toast.error("Failed to delete return.");
    }
  };

  const handleGenerateReturnInvoice = (id) => {
    const pdfWindow = window.open(`${API_BASE_URL}/sale-returns/${id}/invoice-pdf`, "_blank");
    if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed === "undefined") {
      toast.error("Popup blocked! Please allow popups to view invoice.");
    }
  };

  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);
  };

  const filteredData = returnData.filter((item) => {
    const values = Object.values(item).join(" ").toLowerCase();
    return values.includes(search.toLowerCase());
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;

    if (sortField === "sno") {
      const indexA = returnData.indexOf(a);
      const indexB = returnData.indexOf(b);
      return sortDirection === "asc" ? indexA - indexB : indexB - indexA;
    }

    const valA = a[sortField]?.toString().toLowerCase() || "";
    const valB = b[sortField]?.toString().toLowerCase() || "";
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedData = sortedData.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="px-4 py-2">
      <Breadcrumb title="Return List" />
      <Card className="border-0 shadow-sm rounded-3 p-3 mt-3 bg-white">
        <div className="row mb-3">
          <div className="col-12 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center">
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
                {[10, 25, 50, 100].map((val) => (
                  <option key={val} value={val}>
                    {val}
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
                  onClick={fetchReturns}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/returns/add")}
                  style={{
                    backgroundColor: "#2FA64F",
                    borderColor: "#2FA64F",
                    color: "#fff",
                  }}
                >
                  + Add Return
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
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th style={{ width: "70px", textAlign: "center",backgroundColor: "#2E3A59", color: "white" }}>S.No</th>
                {[
                  { label: "Invoice No", field: "invoice_no" },
                  { label: "Invoice Date", field: "invoice_date" },
                  { label: "Return Invoice No", field: "return_invoice_no" },
                  { label: "Return Date", field: "return_invoice_date" },
                  { label: "Qty", field: "quantity" },
                  { label: "Reason", field: "reason" },
                ].map(({ label, field }) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    style={{ backgroundColor: "#2E3A59", color: "white", cursor: "pointer" }}
                  >
                    {label} {sortField === field && (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                ))}
                <th style={{ backgroundColor: "#2E3A59", color: "white" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
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
                    <td>{(page - 1) * perPage + index + 1}</td>
                    <td>{item.invoice_no}</td>
                    <td>{item.invoice_date}</td>
                    <td>{item.return_invoice_no}</td>
                    <td>{item.return_invoice_date}</td>
                    <td>{item.quantity}</td>
                    <td>{item.reason}</td>
                    <td className="d-flex gap-2">
                      <Button
                        variant=""
                        size="sm"
                        onClick={() => handleGenerateReturnInvoice(item.id)}
                        style={{ borderColor: "#2E3A59", color: "#2E3A59" }}
                      >
                        <i className="bi bi-file-earmark-pdf"></i>
                      </Button>
                      <Button
                        variant=""
                        size="sm"
                        onClick={() => navigate(`/returns/edit/${item.id}`)}
                        style={{ borderColor: "#2E3A59", color: "#2E3A59" }}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </Button>
                      <Button
                        variant=""
                        size="sm"
                        onClick={() => handleDeleteReturn(item.id)}
                        style={{ borderColor: "#2E3A59", color: "#2E3A59" }}
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

        {!loading && sortedData.length > 0 && !isNaN(perPage) && !isNaN(page) && (
          <Pagination
            totalItems={sortedData.length}
            perPage={perPage}
            currentPage={page}
            setCurrentPage={setPage}
          />
        )}
      </Card>
    </div>
  );
}