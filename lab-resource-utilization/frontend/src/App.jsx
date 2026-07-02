import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthContext } from './context/AuthContext';

// Import all Role Dashboards
import {
  ResearcherDashboard,
  LabTechnicianDashboard,
  LabManagerDashboard,
  DepartmentHeadDashboard,
  InstitutionAdminDashboard,
  SystemAdminDashboard,
} from './pages/dashboards';

import EquipmentList from './pages/equipment/EquipmentList';
import EquipmentDetails from './pages/equipment/EquipmentDetails';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0e12] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If user tries to access a dashboard they don't have permission for,
    // redirect them to their designated dashboard or home.
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Role-Based Dashboards */}
        <Route
          path="/dashboard/researcher"
          element={
            <ProtectedRoute allowedRoles={['RESEARCHER']}>
              <ResearcherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/lab-technician"
          element={
            <ProtectedRoute allowedRoles={['LAB_TECHNICIAN']}>
              <LabTechnicianDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/lab-manager"
          element={
            <ProtectedRoute allowedRoles={['LAB_MANAGER']}>
              <LabManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/department-head"
          element={
            <ProtectedRoute allowedRoles={['DEPARTMENT_HEAD']}>
              <DepartmentHeadDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/institution-admin"
          element={
            <ProtectedRoute allowedRoles={['INSTITUTION_ADMIN']}>
              <InstitutionAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/system-admin"
          element={
            <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
              <SystemAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Equipment Inventory Routes */}
        <Route
          path="/equipment"
          element={
            <ProtectedRoute>
              <EquipmentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment/:id"
          element={
            <ProtectedRoute>
              <EquipmentDetails />
            </ProtectedRoute>
          }
        />
        
        {/* Fallback routing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
