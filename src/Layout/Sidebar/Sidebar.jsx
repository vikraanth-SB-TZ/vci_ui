import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
// Add hover and active styles here

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [productOpen, setProductOpen] = useState(true);
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [componentsOpen, setComponentsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  const handleLinkClick = (link) => {
    navigate(`/${link}`);
  };

  const isActive = (link) => location.pathname.includes(link);

  const linkClass = (link) =>
    `sidebar-link d-flex align-items-center gap-2 mb-2 text-decoration-none ${
      isActive(link) ? "active" : ""
    }`;

  const subLinkClass = (link) =>
    `sidebar-sublink d-block mb-2 text-decoration-none ps-4 ${
      isActive(link) ? "active" : ""
    }`;

  return (
    <aside
      className="d-flex flex-column sidebar-container"
      style={{
        width: "317px",
        height: "100vh",
        backgroundColor: "#26314F",
        fontFamily: "Product Sans, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div className="p-3 ps-4 mb-3" style={{ flexShrink: 0 }}>
        <img
          src="/logo.png"
          alt="Tamilzorous Logo"
          className="img-fluid"
          style={{ width: "200px" }}
        />
      </div>

      {/* Scrollable content */}
      <nav
        className="small px-4"
        style={{
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        {/* Home */}
        <div className="mb-1" style={{ color: "#91A59B" }}>
          Home
        </div>
        <div className="mb-1">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick("overview");
            }}
            className={linkClass("overview")}
          >
            <img
              src="/squares.png"
              alt="Overview"
              style={{ width: "18px", filter: "brightness(0) invert(1)" }}
            />
            Overview
          </a>
        </div>

        {/* Basics */}
        <div className="mb-2" style={{ color: "#91A59B" }}>
          Basics
        </div>

        {/* Metadata Dropdown */}
        <div>
          <button
            onClick={() => setMetadataOpen(!metadataOpen)}
            className="bg-transparent border-0 w-100 text-start p-0"
          >
            <div className={linkClass("metadata")}>
              <img
                src="/Metadata.png"
                alt="Metadata"
                style={{ width: "18px", filter: "brightness(0) invert(1)" }}
              />
              Metadata
              <span className="ms-auto text-white me-4">
                {metadataOpen ? "▾" : "▸"}
              </span>
            </div>
          </button>
          {metadataOpen && (
            <div>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("state"); }} className={subLinkClass("state")}>State</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("district"); }} className={subLinkClass("district")}>District</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("countries"); }} className={subLinkClass("countries")}>Countries</a>
            </div>
          )}
        </div>

        {/* Components Dropdown */}
        <div className="mb-1">
          <button
            onClick={() => setComponentsOpen(!componentsOpen)}
            className="bg-transparent border-0 w-100 text-start p-0"
          >
            <div className={linkClass("components")}>
              <img src="/Componets.png" alt="Components" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
              Components
              <span className="ms-auto text-white me-4">
                {componentsOpen ? "▾" : "▸"}
              </span>
            </div>
          </button>
          {componentsOpen && (
            <div>
              <a href="#" onClick={() => handleLinkClick("spareparts")} className={subLinkClass("spareparts")}>Spare Parts</a>
              <a href="#" onClick={() => handleLinkClick("purchaseSpareparts")} className={subLinkClass("purchaseSpareparts")}>Purchase Spare Parts</a>
              <a href="#" onClick={() => handleLinkClick("return")} className={subLinkClass("return")}>Return</a>
            </div>
          )}
        </div>

        {/* Product Dropdown */}
        <div className="mb-1">
          <button
            onClick={() => setProductOpen(!productOpen)}
            className="bg-transparent border-0 w-100 text-start p-0"
          >
            <div className={linkClass("product")}>
              <img src="/Product.png" alt="Product" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
              Product
              <span className="ms-auto text-white me-4">
                {productOpen ? "▾" : "▸"}
              </span>
            </div>
          </button>
          {productOpen && (
            <div>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("batch"); }} className={subLinkClass("batch")}>Batch</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("category"); }} className={subLinkClass("category")}>Category</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("productTest"); }} className={subLinkClass("productTest")}>Product Test</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("sold"); }} className={subLinkClass("sold")}>Sold</a>
            </div>
          )}
        </div>

        {/* Purchase */}
        <div className="mb-1" style={{ color: "#91A59B" }}>Purchase</div>
        <div>
          <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("vendor"); }} className={linkClass("vendor")}>
            <img src="/Vendor.png" alt="Vendor" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
            Vendor
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("purchaseOrder"); }} className={linkClass("purchaseOrder")}>
            <img src="/Purchase Order 1.png" alt="Purchase Order" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
            Purchase Order
          </a>
        </div>

        {/* Sales */}
        <div className="mb-1" style={{ color: "#91A59B" }}>Sales</div>
        <div className="mb-1">
          <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("customer"); }} className={linkClass("customer")}>
            <img src="/Customer.png" alt="Customer" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
            Customer
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("salesOrder"); }} className={linkClass("salesOrder")}>
            <img src="/Sale 1.png" alt="Sales Order" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
            Sales Order
          </a>
     <a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    handleLinkClick('salesReturn');
  }}
  className={linkClass('salesReturn')}
>
  <img src="/Sale.png" alt="Sales Return" style={{ width: '18px', filter: 'brightness(0) invert(1)' }} />
  Sales Return
</a>

        </div>

        {/* Service */}
        <div className="mb-2" style={{ color: "#91A59B" }}>Service</div>
        <div className="mb-1">
          <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("serviceProduct"); }} className={linkClass("serviceProduct")}>
            <img src="/Service VCI.png" alt="Service Product" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
            Service Product
          </a>
        </div>
      </nav>
    </aside>
  );
}
