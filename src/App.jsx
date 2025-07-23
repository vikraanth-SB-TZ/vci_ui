import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import SalesList from './Pages/SalesList';
import LoginPage from './LoginPage';
import AppLayout from './Layout/AppLayout'; // Layout with Sidebar + DashboardLayout
import BatchPage from './Pages/BatchPages'; // Default dynamic content
import StatePage from './Pages/StatePage';
import DistrictPage from './Pages/DistrictPage';  // ✅ Import the new stateful page
import AddNewSalePage from './Pages/AddNewSalePage';
import EditSalePage from './Pages/EditSalePage';
import ViewSalePage from './Pages/ViewSalePage';
import SaleReturnPage from './Pages/SaleReturnPage';
import SaleInvoice from './Pages/SaleInvoice';
import PcbPurchaseList from './Pages/PcbPurchaseList';


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout onLogout={() => setIsLoggedIn(false)} />}>
          <Route index element={<BatchPage />} />                {/* default route */}
          <Route path="state" element={<StatePage />} />
          <Route path="district" element={<DistrictPage />} />  
    
          <Route path="salesOrder" element={<SalesList/>} />   // ✅ Add this inside your main route
          <Route path="/sales/add" element={<AddNewSalePage />} />
          <Route path="/sales/edit/:id" element={<EditSalePage />} /> 
      

          <Route path="/sales/view/:id" element={<ViewSalePage />} />
          <Route path="salesReturn" element={<SaleReturnPage />} />
          <Route path="pdf" element={<SaleInvoice />} />

             <Route path="purchaseOrder" element={<PcbPurchaseList />} />

 
          
                {/* new StatePage route */}
          {/* You can add more routes like <Route path="users" element={<UsersPage />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}
