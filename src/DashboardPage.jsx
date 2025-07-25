import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./Layout/DashboardLayout";
import BatchPages from "./pages/BatchPages"; // ✅ Make sure this matches your file name
 import Home from "./pages/Home"; // ✅ Add this line if you have a Home.jsx

export default function DashboardPage({ onLogout }) {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<DashboardLayout onLogout={onLogout} />}>
          {/* <Route index element={<Home />} /> */}
          <Route path="batch" element={<BatchPages />} /> {/* ✅ Corrected name */}
          {/* <Route path="sales" element={<SalesPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
