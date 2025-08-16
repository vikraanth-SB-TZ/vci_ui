// src/pages/SerialStockCheckPage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Spinner,
  Row,
  Col
} from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../api";
import { FaBox, FaShoppingCart, FaTruck, FaUser, FaTools } from "react-icons/fa";

const SerialStockCheckPage = () => {
  const [serialNo, setSerialNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState("");
  const [expandedItems, setExpandedItems] = useState({});

  const handleCheckStock = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStockData(null);
    setError("");

    try {
      const res = await axios.get(
        `${API_BASE_URL}/products/validate-stock/${serialNo}`
      );
      const data = res.data;
      const categoryName =
        data?.category || data?.product?.category?.category || "N/A";

      setStockData({ ...data, category: categoryName });
      if (data?.status) toast.success("Stock details fetched successfully!");
    } catch (err) {
      const backendData = err.response?.data;
      if (backendData) {
        const categoryName =
          backendData?.category ||
          backendData?.product?.category?.category ||
          "N/A";
        setStockData({ ...backendData, category: categoryName });
      } else {
        setError("Error fetching data");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return isNaN(d) ? "N/A" : d.toLocaleDateString();
  };

  const toggleItem = (index) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const timelineItems = [
    {
      title: "Product Details",
      details: {
        Serial_Number: stockData?.product?.serial_no || serialNo,
        Product_Name: stockData?.product?.name || "N/A",
        Category: stockData?.category || "N/A",
        Sale_Status: stockData?.product?.sale_status || "N/A",
        Test_Status: stockData?.product?.test || "N/A",
      },
      icon: <FaBox />,
      noDataMessage: "No Product Details Found",
    },
    {
      title: "Purchase Details",
      details: {
        Invoice_No: stockData?.purchase?.invoice_no || "N/A",
        Invoice_Date: formatDate(stockData?.purchase?.invoice_date),
      },
      icon: <FaShoppingCart />,
      noDataMessage: "No Purchase Details Found",
    },
    {
      title: "Vendor Details",
      details: stockData?.vendor || {},
      icon: <FaUser />,
      noDataMessage: "No Vendor Details Found",
    },
    {
      title: "Sale Details",
      details: {
        Invoice_No: stockData?.sale?.invoice_no || "N/A",
        Invoice_Date: formatDate(stockData?.sale?.invoice_date),
        Category: stockData?.sale?.category_name || "N/A",
        Quantity: stockData?.sale?.quantity || "N/A",
        Shipment_Name: stockData?.sale?.shipment_name || "N/A",
        Shipment_Date: formatDate(stockData?.sale?.shipment_date),
        Delivery_Date: formatDate(stockData?.sale?.delivery_date),
        Tracking_No: stockData?.sale?.tracking_no || "N/A",
        Sold_Date: formatDate(stockData?.sale?.created_at),
      },
      icon: <FaTruck />,
      noDataMessage: "No Sale Details Found",
    },
    {
      title: "Customer Details",
      details: stockData?.customer || {},
      icon: <FaUser />,
      noDataMessage: "No Customer Details Found",
    },
    {
      title: "Sale Return Details",
      details: stockData?.sale_return || {},
      icon: <FaBox />,
      noDataMessage: "No Sale Return Details Found",
    },
    {
      title: "Service Details",
      details: stockData?.service || {},
      icon: <FaTools />,
      noDataMessage: "No Service Details Found",
    },
  ];

  // ✅ Scroll animation
  useEffect(() => {
    if (!stockData) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("hidden");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll(".content.hidden").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [stockData]);

  return (
    <>
      <Container className="mt-4">
        <h3 className="mb-4 text-center">Warp Timeline</h3>

        <Form onSubmit={handleCheckStock} className="mb-5">
          <Row className="g-2 justify-content-center">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Enter Serial Number"
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value)}
                required
              />
            </Col>
            <Col md="auto">
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : "Check Stock"}
              </Button>
            </Col>
          </Row>
        </Form>

        {error && <div className="alert alert-danger">{error}</div>}

        {stockData && (
          <section className="timeline__cover">
            <div className="timeline__title">
              <h2>Stock Timeline</h2>
              <p>Scroll down to explore stock details in timeline style</p>
            </div>

            <div className="timeline">
              <ul>
                {timelineItems.map((item, idx) => (
                  <li key={idx}>
                    <div
                      className={`content ${expandedItems[idx] ? "" : "hidden"}`}
                      onClick={() => toggleItem(idx)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="badge">{item.title}</div>
                      <h3>{item.icon} {item.title}</h3>

                      {item.details && Object.keys(item.details).length > 0 ? (
                        <ul className="list-unstyled">
                          {Object.entries(item.details).map(([key, value]) => (
                            <li key={key}>
                              <strong>{key.replace(/_/g, " ")}:</strong>{" "}
                              {value || "N/A"}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted">{item.noDataMessage}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </Container>

      {/* Footer */}
      
    </>
  );
};

export default SerialStockCheckPage;
