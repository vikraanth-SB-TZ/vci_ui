import React, { useState } from 'react';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SpareParts from "./Pages/SpareParts"; // ✅ Updated path after renaming

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return isLoggedIn ? (
    <DashboardPage onLogout={() => setIsLoggedIn(false)} />
  ) : (
    <LoginPage onLogin={() => setIsLoggedIn(true)} />
  );
}