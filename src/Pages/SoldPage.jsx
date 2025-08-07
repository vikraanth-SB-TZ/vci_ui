import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner, Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../api";
import Breadcrumb from "./Components/Breadcrumb";
import Search from "./Components/Search";
import Pagination from "./Components/Pagination";

export default function SoldPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    fetchSoldProducts();
  }, []);

  const fetchSoldProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/products`);
      const soldProducts = Array.isArray(res.data)
        ? res.data.filter(
          (product) => product.sale_status?.toLowerCase() === "sold"
        )
        : [];
      setProducts(soldProducts);
    } catch (error) {
      toast.error("Failed to fetch sold products!");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredProducts = products.filter((product) =>
    [
      product.category?.category,
      product.batch?.batch,
      product.serial_no,
      product.manufacture_no,
      product.firmware_version,
      product.hsn_code,
      product.test,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField] || "";
    const valB = b[sortField] || "";
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedProducts = sortedProducts.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="px-4 py-2">
      <Breadcrumb title="Sold Products" />

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
                onClick={fetchSoldProducts}
              >
                <i className="bi bi-arrow-clockwise"></i>
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
                <th style={{ width: "70px", textAlign: "center", backgroundColor: "#2E3A59",
                  color: "white", }}>S.No</th>
                <th
                  onClick={() => handleSort("category")}
                  style={{ cursor: "pointer" , backgroundColor: "#2E3A59",
                  color: "white",}}
                >
                  Category {sortField === "category" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("batch")}
                  style={{ cursor: "pointer", backgroundColor: "#2E3A59",
                  color: "white" }}
                >
                  Batch {sortField === "batch" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("serial_no")}
                  style={{ cursor: "pointer", backgroundColor: "#2E3A59",
                  color: "white" }}
                >
                  Serial No. {sortField === "serial_no" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("manufacture_no")}
                  style={{ cursor: "pointer", backgroundColor: "#2E3A59",
                  color: "white" }}
                >
                  Manufacture No. {sortField === "manufacture_no" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("firmware_version")}
                  style={{ cursor: "pointer", backgroundColor: "#2E3A59",
                  color: "white" }}
                >
                  Firmware Version {sortField === "firmware_version" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("hsn_code")}
                  style={{ cursor: "pointer", backgroundColor: "#2E3A59",
                  color: "white" }}
                >
                  HSN Code {sortField === "hsn_code" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("test")}
                  style={{ cursor: "pointer" , backgroundColor: "#2E3A59",
                  color: "white"}}
                >
                  Test {sortField === "test" && (sortDirection === "asc" ? "▲" : "▼")}
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
              ) : paginatedProducts.length === 0 ? (
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
                paginatedProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td className="text-center">
                      {(page - 1) * perPage + index + 1}
                    </td>
                    <td>{product.category?.category || "—"}</td>
                    <td>{product.batch?.batch || "—"}</td>
                    <td>{product.serial_no || "—"}</td>
                    <td>{product.manufacture_no || "—"}</td>
                    <td>{product.firmware_version || "—"}</td>
                    <td>{product.hsn_code || "—"}</td>
                    <td>{product.test || "—"}</td>
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
          totalEntries={filteredProducts.length}
        />
      </Card>
    </div>
  );
}
