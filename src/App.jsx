import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

import LoginPage from './LoginPage';
import AppLayout from './Layout/AppLayout';
import BatchPage from './Pages/BatchPages';
import StatePage from './Pages/StatePage';
import DistrictPage from './Pages/DistrictPage';
import SpareParts from './Pages/SpareParts';
import SparepartsPage from './Pages/PurchaseSpartParts';
import ReturnSpareParts from './Pages/ReturnSpareParts';
import Customer from './Pages/customer'; // ✅ Fixed: Capitalized import
import Vendor from './Pages/vendor'; // ✅ Fixed: Capitalized import
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout onLogout={() => setIsLoggedIn(false)} />}>
          <Route index element={<BatchPage />} />
          <Route path="state" element={<StatePage />} />
          <Route path="district" element={<DistrictPage />} />
          <Route path="spareparts" element={<SpareParts />} />
          <Route path="PurchaseSpareParts" element={<SparepartsPage />} />
          <Route path="ReturnSpareParts" element={<ReturnSpareParts />} />
          <Route path="customer" element={<Customer />} /> {/* ✅ Fixed */}
          <Route path="vendor" element={<Vendor/>} /> {/* ✅ Fixed */}
        </Route>
      </Routes>
    </Router>
  );
}
