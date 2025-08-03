import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Row, Col, Spinner, Form } from "react-bootstrap";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function OverviewPage() {
  const [stats, setStats] = useState({
    customers: 10,
    vendors: "05",
    productSales: 2,
  });
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState("Month"); // NEW

  const apiBase = "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchOverviewData();
  }, [duration]); // refetch when duration changes

  const fetchOverviewData = async () => {
    try {
      const res = await axios.get(`${apiBase}/dashboard-overview`, {
        params: { duration: duration.toLowerCase() }, // Send "month" or "year"
      });

      setStats(res.data.stats ?? { customers: 0, vendors: 0, productSales: 0 });
      setGraphData(res.data.graphData ?? []);
    } catch {
      // Fallback data if API fails
      if (duration === "Year") {
        setGraphData([
          { month: "2021", value: 25000 },
          { month: "2022", value: 40000 },
          { month: "2023", value: 55000 },
          { month: "2024", value: 62000 },
          { month: "2025", value: 72000 },
        ]);
      } else {
        setGraphData([
          { month: "Jan", value: 0 },
          { month: "Feb", value: 4000 },
          { month: "Mar", value: 10000 },
          { month: "Apr", value: 8000 },
          { month: "May", value: 13000 },
          { month: "Jun", value: 11000 },
          { month: "Jul", value: 9000 },
          { month: "Aug", value: 18000 },
          { month: "Sep", value: 25000 },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: graphData.map((item) => item.month),
    datasets: [
      {
        label: "VCI's",
        data: graphData.map((item) => item.value),
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          callback: (val) => `${val / 1000}k`,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <>
      <Row className="mb-4 g-3">
        <Col xs={12} sm={6} md={4}>
          <Card className="border-0 shadow-sm h-100" style={{ backgroundColor: "#E3F5FF" }}>
            <Card.Body>
              <h6 className="fw-semibold">Customer</h6>
              <h2>{stats.customers}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card className="border-0 shadow-sm h-100" style={{ backgroundColor: "#E5ECF6" }}>
            <Card.Body>
              <h6 className="fw-semibold">Vendor</h6>
              <h2>{stats.vendors}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Card className="border-0 shadow-sm h-100" style={{ backgroundColor: "#E5ECF6" }}>
            <Card.Body>
              <h6 className="fw-semibold">Product Sale</h6>
              <h2>{stats.productSales}K</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
            <h6 className="fw-semibold mb-2 mb-md-0">Product Sales</h6>
            <Form.Select
              className="form-select w-auto"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option>Month</option>
              <option>Year</option>
            </Form.Select>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <div style={{ height: "220px" }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
}
