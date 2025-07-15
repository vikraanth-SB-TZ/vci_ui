import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [productOpen, setProductOpen] = useState(true);
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [componentsOpen, setComponentsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");
const navigate = useNavigate();

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const linkClass = (link) =>
    `sidebar-link d-flex align-items-center gap-2 mb-2 text-decoration-none ${
      activeLink === link ? "active" : ""
    }`;

  const subLinkClass = (link) =>
    `sidebar-sublink d-block mb-2 text-decoration-none ps-4 ${
      activeLink === link ? "active" : ""
    }`;

  return (
    <aside
      className="d-flex flex-column sidebar-container"
      style={{
        width: "317px",
        minHeight: "100vh",
        backgroundColor: "#26314F",
        fontFamily: "Product Sans, sans-serif",
      }}
    >
      {/* Logo */}
      <div className="p-3 ps-4  mb-3">
        <img
          src="./public/logo.png"
          alt="Tamilzorous Logo"
          className="img-fluid"
          style={{ width: "170px" }}
        />
      </div>

      <nav className="flex-grow-1 small overflow-auto px-4">
        {/* Home */}
        <div className="text-uppercase mb-2 fw-bold" style={{ color: "#91A59B" }}>
          Home
        </div>
        <div className="mb-4">
          <a href="#" onClick={() => handleLinkClick("overview")} className={linkClass("overview")}>
            <img src="./public/squares.png" alt="Overview" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
            Overview
          </a>
        </div>

        {/* Basics */}
        <div className="text-uppercase mb-2 fw-bold" style={{ color: "#91A59B" }}>Basics</div>

        {/* Metadata Dropdown */}
        <div className="mb-3">
          <button
            onClick={() => setMetadataOpen(!metadataOpen)}
            className="bg-transparent border-0 w-100 text-start p-0"
          >
            <div className={linkClass("metadata")}>
              <img src="./public/Metadata.png" alt="Metadata" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
              Metadata
              <span
                className="ms-auto text-white"
                style={{ width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                {metadataOpen ? "▾" : "▸"}
              </span>

            </div>
          </button>
          {metadataOpen && (
            <div>
              <a href="#" onClick={() => handleLinkClick("state")} className={subLinkClass("state")}>State</a>
              <a href="#" onClick={() => handleLinkClick("district")} className={subLinkClass("district")}>District</a>
              <a href="#" onClick={() => handleLinkClick("countries")} className={subLinkClass("countries")}>Countries</a>
            </div>
          )}
        </div>

        {/* Components Dropdown */}
        <div className="mb-3">
          <button
            onClick={() => setComponentsOpen(!componentsOpen)}
            className="bg-transparent border-0 w-100 text-start p-0"
          >
            <div className={linkClass("components")}>
              <img src="./public/Vendor.png" alt="Components" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
              Components
              <span
                className="ms-auto text-white"
                style={{ width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                {metadataOpen ? "▾" : "▸"}
              </span>
            </div>
          </button>
          {componentsOpen && (
            <div>
<button onClick={() => navigate("/spare-parts")}>Go to Spare Parts</button>
              <a href="#" onClick={() => handleLinkClick("purchaseSpareparts")} className={subLinkClass("purchaseSpareparts")}>Purchase Spare Parts</a>
              <a href="#" onClick={() => handleLinkClick("return")} className={subLinkClass("return")}>Return</a>
            </div>
          )}
        </div>

        {/* Product Dropdown */}
        <div className="mb-3">
          <button
            onClick={() => setProductOpen(!productOpen)}
            className="bg-transparent border-0 w-100 text-start p-0"
          >
            <div className={linkClass("product")}>
              <img src="./public/Vendor.png" alt="Product" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
              Product
              <span
                className="ms-auto text-white"
                style={{ width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                {metadataOpen ? "▾" : "▸"}
              </span>
            </div>
          </button>
          {productOpen && (
            <div>
              <a href="#" onClick={() => handleLinkClick("batch")} className={subLinkClass("batch")}>Batch</a>
              <a href="#" onClick={() => handleLinkClick("category")} className={subLinkClass("category")}>Category</a>
              <a href="#" onClick={() => handleLinkClick("productTest")} className={subLinkClass("productTest")}>Product Test</a>
              <a href="#" onClick={() => handleLinkClick("sold")} className={subLinkClass("sold")}>Sold</a>
            </div>
          )}
        </div>

        {/* Purchase */}
        <div className="text-uppercase mb-2 fw-bold" style={{ color: "#91A59B" }}>Purchase</div>
        <div className="mb-3">
          <a href="#" onClick={() => handleLinkClick("vendor")} className={linkClass("vendor")}>
            <img src="./public/Vendor.png" alt="Vendor" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
            Vendor
          </a>
          <a href="#" onClick={() => handleLinkClick("purchaseOrder")} className={linkClass("purchaseOrder")}>
            <img src="./public/Purchase Order.png" alt="Purchase Order" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
            Purchase Order
          </a>
        </div>

        {/* Sales */}
        <div className="text-uppercase mb-2 fw-bold" style={{ color: "#91A59B" }}>Sales</div>
        <div className="mb-3">
          <a href="#" onClick={() => handleLinkClick("customer")} className={linkClass("customer")}>
            <img src="./public/Customer.png" alt="Customer" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
            Customer
          </a>
          <a href="#" onClick={() => handleLinkClick("salesOrder")} className={linkClass("salesOrder")}>
            <img src="./public/Sale 1.png" alt="Sales Order" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
            Sales Order
          </a>
        </div>

        {/* Service */}
        <div className="text-uppercase mb-2 fw-bold" style={{ color: "#91A59B" }}>Service</div>
        <div className="mb-3">
          <a href="#" onClick={() => handleLinkClick("serviceProduct")} className={linkClass("serviceProduct")}>
            <img src="./public/Service VCI.png" alt="Service Product" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
            Service Product
          </a>
        </div>
      </nav>
    </aside>
  );
}
