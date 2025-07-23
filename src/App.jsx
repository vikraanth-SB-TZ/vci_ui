import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';


import SalesList from './Pages/SalesList';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';

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
          
                {/* new StatePage route */}
          {/* You can add more routes like <Route path="users" element={<UsersPage />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}
