import React from "react";

const Breadcrumb = ({ title, subtitle }) => {
    return (
        <div className="app-hero-header d-flex align-items-center">
            <h4 style={{ margin: 0 }}>{title || "Healthcare Dashboard"}</h4>
            {/* Sales stats starts */}
            <div className="ms-auto d-lg-flex d-none flex-row">
                {/* Breadcrumb starts */}
                <ol className="breadcrumb">
                    <li className="breadcrumb-item mt-2">
                        <a href="#">
                           <i class="bi bi-house-door"  style={{ color: '#2E3A59' , fontSize: '1.25rem'}}></i>
                        </a>
                    </li>
                    <li
                        className="breadcrumb-item mt-2 "
                        aria-current="page"
                        style={{ color: "#2E3A59",fontSize: '1.25rem' }}
                    >
                        {title || "Healthcare Dashboard"}
                    </li>
                </ol>
                {/* Breadcrumb ends */}
            </div>
            {/* Sales stats ends */}
        </div>
    );
};

export default Breadcrumb;
