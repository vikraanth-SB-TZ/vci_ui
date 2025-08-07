import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// import SalesList from './Pages/SalesList';
import LoginPage from './LoginPage';
import AppLayout from './Layout/AppLayout';
import BatchPage from './Pages/BatchPages';
import StatePage from './Pages/StatePage';

import CategoryPage from './pages/CategoryPage';
import SoldPage from './pages/SoldPage';
import DistrictPage from './Pages/DistrictPage';  // ✅ Import the new stateful page
import AddNewSalePage from './Pages/AddNewSalePage';
import EditSalePage from './Pages/EditSalePage';
import ViewSalePage from './Pages/ViewSalePage';
import SaleReturnPage from './Pages/SaleReturnPage';
import SaleReturns from './Pages/SaleReturns';
import SaleInvoice from './Pages/SaleInvoice';
import PcbPurchaseList from './Pages/PcbPurchaseList';

import AddPurchasePage from './Pages/AddPurchasePage';
import EditPurchasePage from './Pages/EditPurchasePage';

import PcbPurchaseReturn from './Pages/PcbPurchaseReturn';

import PcbPurchaseReturnEdit from './Pages/PcbPurchaseReturnEdit';
import EditSaleReturnPage from './Pages/EditSaleReturnPage';

import AddPcbReturnPage from './Pages/AddPcbReturnPage';
import Overview from './Pages/Overview/Overview';
import SalesList from './Pages/SalesList';
import SparepartsPage from "./Pages/SpareParts";
import PurchaseSparepartsPage from './Pages/PurchaseSpareParts'; // ✅ Ensure correct casing
import VciCustomer from './Pages/VciCustomer';
import ReturnSparePartsPage from './Pages/ReturnSpareParts';
import Vendor from './Pages/vendor';
import CountryPage from './Pages/Countrypage';
import ProductPage from './Pages/ProductPage';



//  const BatchPage = () => <div style={{ padding: 20, color: '#333' }}>Welcome to Dashboard</div>;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('authToken'));
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    toast.success("Login successful!");
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        {/* If already logged in and visit /login manually, redirect to /batch */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/Overview" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        {/* Protected routes inside layout */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <AppLayout onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="batch" element={<BatchPage />} />
          <Route path="state" element={<StatePage />} />

          <Route path="district" element={<DistrictPage />} />
          <Route path="countries" element={<CountryPage />} />
          <Route path="category" element={<CategoryPage />} />
          <Route path="productTest" element={<ProductPage />} />
          <Route path="sold" element={<SoldPage />} />


          <Route path="salesOrder" element={<SalesList />} />   // ✅ Add this inside your main route
          <Route path="/sales/add" element={<AddNewSalePage />} />
          <Route path="/sales/edit/:id" element={<EditSalePage />} />
          <Route path="spareparts" element={<SparepartsPage />} />
          <Route path="PurchaseSpareParts" element={<PurchaseSparepartsPage />} />
          <Route path="ReturnSpareParts" element={<ReturnSparePartsPage />} />
          <Route path="Vendor" element={<Vendor />} />
          <Route path="VciCustomer" element={<VciCustomer />} />


          <Route path="/sales/view/:id" element={<ViewSalePage />} />
          <Route path="salesReturn" element={<SaleReturnPage />} />
          <Route path="/returns/add" element={<SaleReturns />} />
          <Route path="pdf" element={<SaleInvoice />} />
          <Route path="purchaseOrder" element={<PcbPurchaseList />} />
          <Route path="overview" element={<Overview />} />
          <Route path="/purchase/add" element={<AddPurchasePage />} />

          <Route path="/purchase/:id/edit" element={<EditPurchasePage />} />

          <Route path="purchaseReturn" element={<PcbPurchaseReturn />} />

          <Route path="/pcb-purchase-return/add" element={<AddPcbReturnPage />} />
          <Route path="pcb-purchase-return/edit/:id" element={<PcbPurchaseReturnEdit />} />
          <Route path="/returns/edit/:id" element={<EditSaleReturnPage />} />

          {/* new StatePage route */}
          {/* You can add more routes like <Route path="users" element={<UsersPage />} /> */}

        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to={isLoggedIn ? "/Overview" : "/login"} replace />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
  );
}