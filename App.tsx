
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminClientCreatePage from './pages/admin/AdminClientCreatePage';
import AdminClientEditPage from './pages/admin/AdminClientEditPage';
import ChatInterfacePage from './pages/ChatInterfacePage';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import LandingPage from './pages/LandingPage'; // New Import
import SignupPage from './pages/SignupPage'; // New Import
import PaymentPage from './pages/PaymentPage'; // New Import

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} /> 
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/payment-simulation" element={<PaymentPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="clients/new" element={<AdminClientCreatePage />} />
          <Route path="clients/edit/:agentId" element={<AdminClientEditPage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
        
        <Route path="/chat/:identifier" element={<ChatInterfacePage />} />
        
        {/* Fallback to landing page if no other route matches */}
        <Route path="*" element={<Navigate to="/" replace />} /> 
      </Routes>
    </HashRouter>
  );
};

export default App;
