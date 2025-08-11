import React, { useState } from "react";
import AddPurchasePage from "./AddPurchasePage";
import AddSpareParts from "./AddSpareParts";
import { Form } from "react-bootstrap";

const AddProduct = () => {
    const [selectedProduct, setSelectedProduct] = useState("");

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1050,
                    background: "#fff",
                    padding: "15px 20px",
                    borderBottom: "1px solid #dee2e6",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}
            >
                <Form.Group controlId="productSelect" style={{ maxWidth: "400px" }}>
                    <Form.Label
                        style={{
                            fontWeight: "600",
                            fontSize: "16px",
                            marginBottom: "8px",
                            color: "#393C3AE5",
                        }}
                    >
                        Select Product to Add <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        style={{
                            borderRadius: "6px",
                            padding: "10px",
                            fontSize: "15px",
                            borderColor: "#ccc",
                            boxShadow: "none",
                            cursor: "pointer",
                        }}
                    >
                        <option value="">-- Select --</option>
                        <option value="pcb">PCB Board</option>
                        <option value="spare">Spare Parts</option>
                    </Form.Select>
                </Form.Group>
            </div>

            {/* Render form based on selection */}
            <div style={{ padding: "20px" }}>
                {selectedProduct === "pcb" && <AddPurchasePage />}
                {selectedProduct === "spare" && <AddSpareParts />}
            </div>
        </div>
    );
};

export default AddProduct;
