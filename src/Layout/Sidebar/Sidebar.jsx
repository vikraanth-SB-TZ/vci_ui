import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Sidebar({ collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeGroup = {
    product: ["batch", "category", "productTest", "sold"],
    metadata: ["state", "district", "countries"],
    components: ["spareparts", "purchaseSpareparts", "return"],
  };

  const isActive = (link) =>
    location.pathname.includes(link) ||
    activeGroup[link]?.some((child) => location.pathname.includes(child));

  const [productOpen, setProductOpen] = useState(isActive("product"));
  const [metadataOpen, setMetadataOpen] = useState(isActive("metadata"));
  const [componentsOpen, setComponentsOpen] = useState(isActive("components"));

  useEffect(() => {
    setProductOpen(isActive("product"));
    setMetadataOpen(isActive("metadata"));
    setComponentsOpen(isActive("components"));
  }, [location.pathname]);

  const handleLinkClick = (link) => navigate(`/${link}`);

  const linkClass = (link) =>
    `sidebar-link d-flex align-items-center gap-2  text-decoration-none rounded ${isActive(link) ? "active-parent" : ""
    }`;

  const subLinkClass = (link) =>
    `sidebar-sublink d-block  text-decoration-none ps-4 ${location.pathname.includes(link) ? "active" : ""
    }`;

  return (
    <aside
      className="d-flex flex-column sidebar-container"
      style={{
        width: collapsed ? "80px" : "317px",
        height: "100vh",
        backgroundColor: "#2E3A59",
        fontFamily: "Product Sans, sans-serif",
        overflow: "hidden",
        transition: "width 0.3s"
      }}
    >
      {/* Logo */}
      <div className="d-flex justify-content-center pt-3 pb-4 mb-1" style={{ flexShrink: 0 }}>
        <img
          src={collapsed ? "/TZ_Logo.png" : "/logo.png"}
          alt="Tamilzorous Logo"
          className="img-fluid"
          style={{ width: collapsed ? "40px" : "210px", transition: "width 0.3s" }}
        />

      </div>

      {/* Scrollable content */}
      <nav
        className="small px-4"
        style={{
          flexGrow: 1,
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >

        {/* Home */}
        <div
          className="mb-1 sidebar-link-titles"
        >
          {!collapsed && "Home"}
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
            {!collapsed && "Overview"}
          </a>
        </div>

        {/* Basics */}
        <div
          className="sidebar-link-titles"
        >
          {!collapsed && "Basics"}
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
              {!collapsed && "Metadata"}
              {!collapsed && (
                <span className="ms-auto text-white me-4">
                  {metadataOpen ? "▾" : "▸"}
                </span>
              )}
            </div>
          </button>
          {!collapsed && metadataOpen && (
            <div className="ms-2">
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("state"); }} className={subLinkClass("state")}>- State</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("district"); }} className={subLinkClass("district")}>- District</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("countries"); }} className={subLinkClass("countries")}>- Countries</a>
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
              <img
                src="/Componets.png"
                alt="Components"
                style={{ width: "18px", filter: "brightness(0) invert(1)" }}
              />
              {!collapsed && "Components"}
              {!collapsed && (
                <span className="ms-auto text-white me-4">
                  {componentsOpen ? "▾" : "▸"}
                </span>
              )}
            </div>
          </button>
          {!collapsed && componentsOpen && (
            <div className="ms-2">
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("SparepartsPage"); }} className={subLinkClass("SparepartsPage")}>- Spare Parts</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("PurchaseSparepartsPage"); }} className={subLinkClass("PurchaseSparepartsPage")}>- Purchase Spare Parts</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("ReturnSpareParts"); }} className={subLinkClass("ReturnSpareParts")}>- Return</a>
            </div>
          )}
        </div>

        {/* Product Dropdown */}
        <div className="mb-2">
          <button
            onClick={() => setProductOpen(!productOpen)}
            className="bg-transparent border-0 w-100 text-start p-0"
          >
            <div className={linkClass("product")}>
              <img
                src="/Product.png"
                alt="Product"
                style={{ width: "18px", filter: "brightness(0) invert(1)" }}
              />
              {!collapsed && "Product"}
              {!collapsed && (
                <span className="ms-auto text-white me-4">
                  {productOpen ? "▾" : "▸"}
                </span>
              )}
            </div>
          </button>
          {!collapsed && productOpen && (
            <div className="ms-2">
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("batch"); }} className={subLinkClass("batch")}>- Batch</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("category"); }} className={subLinkClass("category")}>- Category</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("productTest"); }} className={subLinkClass("productTest")}>- Product Test</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("sold"); }} className={subLinkClass("sold")}>- Sold</a>
            </div>
          )}
        </div>

        {/* Purchase */}
        <div
          className="sidebar-link-titles"
        >
          {!collapsed && "Purchase"}
        </div>

        <div className="mb-1">
          <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("Vendors"); }} className={linkClass("Vendors")}>
  <img src="/Vendor.png" alt="Vendor" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
  {!collapsed && "Vendor"}
</a>

          <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("purchaseOrder"); }} className={linkClass("purchaseOrder")}>
            <img src="/Purchase Order 1.png" alt="Purchase Order" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
            {!collapsed && "Purchase Order"}
          </a>
        </div>

        {/* Sales */}
        <div
          className="sidebar-link-titles"
        >
          {!collapsed && "Sales"}
        </div>

        <div className="mb-1">
          <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("Customers"); }} className={linkClass("Customers")}>
            <img src="/Customer.png" alt="Customer" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
            {!collapsed && "Customer"}
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("salesOrder"); }} className={linkClass("salesOrder")}>
            <img src="/Sale 1.png" alt="Sales Order" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
            {!collapsed && "Sales Order"}
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("salesReturn"); }} className={linkClass("salesReturn")}>
            <img src="/Sale.png" alt="Sales Return" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
            {!collapsed && "Sales Return"}
          </a>
        </div>

        {/* Service */}
        <div
          className="sidebar-link-titles"
        >
          {!collapsed && "Service"}
        </div>

        <div className="mb-1">
          <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick("serviceProduct"); }} className={linkClass("serviceProduct")}>
            <img src="/Service VCI.png" alt="Service Product" style={{ width: "18px", filter: "brightness(0) invert(1)" }} />
            {!collapsed && "Service Product"}
          </a>
        </div>
      </nav>

      {/* Active style */}
      <style>{`
        .active-parent {
          background-color: #278C582E !important;
          border-radius: 4px;
        }
      `}</style>
    </aside>
  );
}
