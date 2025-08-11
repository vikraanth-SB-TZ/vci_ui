import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Spinner } from "react-bootstrap";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import "../../assets/css/TotalProduct.css";
import { API_BASE_URL } from "../../api";

export default function TotalProductPage() {
  const [stockData, setStockData] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products/category/count`);
      if (res.data && res.data.success) {
        const mappedData = res.data.data.map((item) => ({
          series: item.series,
          label: "Tech_pro",
          change: item.product_count,
        }));
        setStockData(mappedData);
        setTotalProducts(res.data.total_count || 0);
      }
    } catch (err) {
      console.error("Failed to load stock data", err);
    } finally {
      setLoading(false);
    }
  };

  const fallbackData = [
    { series: "7 Series", label: "Tech_pro", change: 0 },
    { series: "8 Series", label: "Tech_pro", change: 0 },
    { series: "9 Series", label: "Tech_pro", change: 0 },
    { series: "0 Series", label: "Tech_pro", change: 0 },
  ];

  const displayData = stockData.length > 0 ? stockData : fallbackData;

  return (
    <div className="">
      <Card className="border-0 shadow-sm h-100">
        <Card.Body>
          <h6 className="fw-semibold text-dark">Total Product</h6>
          <h2 className="fw-bold mb-2">
            {totalProducts}
            <span className="text-muted fs-5 ms-2">VCI's</span>
          </h2>

          <h6 className="mt-4 mb-3 fw-semibold">Current Product Stock</h6>

          {loading ? (
            <Spinner animation="border" />
          ) : (
            <div
              style={{
                maxHeight: "278px", 
                overflowY: displayData.length > 4 ? "auto" : "visible",
                paddingRight: "5px",
              }}
            >
              {displayData.map((item, idx) => {
                const isUp = item.change >= 0;
                const barWidth = Math.min(Math.abs(item.change) / 5, 100);

                return (
                  <div key={idx} className="mb-4">
                    <div className="d-flex align-items-center ms-5">
                      <div style={{ minWidth: "100px" }}>
                        <div className="fw-semibold">{item.series}</div>
                      </div>
                      <div className="flex-grow-1 mx-3">
                        <div
                          className="progress"
                          style={{ height: "6px", backgroundColor: "#e9ecef" }}
                        >
                          <div
                            className={`progress-bar ${
                              isUp ? "bg-success" : "bg-danger"
                            }`}
                            style={{
                              width: `${barWidth}%`,
                              transition: "width 0.6s ease",
                            }}
                          ></div>
                        </div>
                      </div>
                      <div
                        className={`d-flex align-items-center gap-1 me-5 ${
                          isUp ? "text-success" : "text-danger"
                        }`}
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          minWidth: "60px",
                          justifyContent: "flex-end",
                        }}
                      >
                        {isUp ? (
                          <FaChevronUp size={12} />
                        ) : (
                          <FaChevronDown size={12} />
                        )}
                        <span>{Math.abs(item.change)}</span>
                      </div>
                    </div>
                    <div
                      className="text-muted ms-5"
                      style={{
                        fontSize: "13px",
                        marginLeft: "0px",
                        marginTop: "2px",
                        paddingLeft: "2px",
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
