import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './LoginPage';
import AppLayout from './Layout/AppLayout';
import BatchPage from './Pages/BatchPages';
import StatePage from './Pages/StatePage';
import DistrictPage from './Pages/DistrictPage';
import CountryPage from './pages/CountryPage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import SoldPage from './pages/SoldPage';

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
              <Navigate to="/batch" replace />
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
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to={isLoggedIn ? "/batch" : "/login"} replace />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
  );
}
