
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminClientCreatePage from './pages/admin/AdminClientCreatePage';
import AdminClientEditPage from './pages/admin/AdminClientEditPage';
import ChatInterfacePage from './pages/ChatInterfacePage';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import PaymentPage from './pages/PaymentPage';
import WebhookSimulatorPage from './pages/admin/WebhookSimulatorPage';
import ConversasPage from './pages/admin/ConversasPage';
import BrandingPage from './pages/admin/BrandingPage'; // New Import

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} /> 
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="conversas" element={<ConversasPage />} />
          <Route path="personalizar" element={<BrandingPage />} /> {/* New Route */}
          <Route path="clients/new" element={<AdminClientCreatePage />} />
          <Route path="clients/edit/:agentId" element={<AdminClientEditPage />} />
          <Route path="webhook-simulator" element={<WebhookSimulatorPage />} /> 
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