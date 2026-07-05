import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthContext } from './context/AuthContext';

// Researcher sub-pages (teammate's work)
import NewBooking from './pages/researcher/NewBooking';
import UpcomingBookings from './pages/researcher/UpcomingBookings';
import ActiveBookings from './pages/researcher/ActiveBookings';
import WaitlistBookings from './pages/researcher/WaitlistBookings';
import ResearcherEquipment from './pages/researcher/ResearcherEquipment';
import CompletedBookings from './pages/researcher/CompletedBookings';
import UsageSummary from './pages/researcher/UsageSummary';
import EquipmentAvailability from './pages/researcher/EquipmentAvailability';

// Role Dashboards
import {
  ResearcherDashboard,
  LabTechnicianDashboard,
  LabManagerDashboard,
  DepartmentHeadDashboard,
  InstitutionAdminDashboard,
  SystemAdminDashboard,
} from './pages/dashboards';

// Equipment
import EquipmentList from './pages/equipment/EquipmentList';
import EquipmentDetails from './pages/equipment/EquipmentDetails';

// Booking module
import Bookings from './pages/booking/Bookings';
import AvailabilityCalendar from './pages/booking/AvailabilityCalendar';
import BookingHistory from './pages/booking/BookingHistory';
import WaitlistManager from './pages/booking/WaitlistManager';

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

        {/* ── Role-Based Dashboards ── */}
        <Route path="/dashboard/researcher" element={<ProtectedRoute allowedRoles={['RESEARCHER']}><ResearcherDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/lab-technician" element={<ProtectedRoute allowedRoles={['LAB_TECHNICIAN']}><LabTechnicianDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/lab-manager" element={<ProtectedRoute allowedRoles={['LAB_MANAGER']}><LabManagerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/department-head" element={<ProtectedRoute allowedRoles={['DEPARTMENT_HEAD']}><DepartmentHeadDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/institution-admin" element={<ProtectedRoute allowedRoles={['INSTITUTION_ADMIN']}><InstitutionAdminDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/system-admin" element={<ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}><SystemAdminDashboard /></ProtectedRoute>} />

        {/* ── Equipment ── */}
        <Route path="/equipment" element={<ProtectedRoute><EquipmentList /></ProtectedRoute>} />
        <Route path="/equipment/:id" element={<ProtectedRoute><EquipmentDetails /></ProtectedRoute>} />

        {/* ── Booking & Scheduling Module ── */}
        <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="/bookings/calendar" element={<ProtectedRoute><AvailabilityCalendar /></ProtectedRoute>} />
        <Route path="/bookings/history" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
        <Route path="/bookings/waitlist" element={<ProtectedRoute><WaitlistManager /></ProtectedRoute>} />

        {/* ── Researcher sub-pages (teammate's work) ── */}
        <Route path="/researcher/bookings/new" element={<ProtectedRoute allowedRoles={['RESEARCHER']}><NewBooking /></ProtectedRoute>} />
        <Route path="/researcher/bookings/upcoming" element={<ProtectedRoute allowedRoles={['RESEARCHER']}><UpcomingBookings /></ProtectedRoute>} />
        <Route path="/researcher/bookings/active" element={<ProtectedRoute allowedRoles={['RESEARCHER']}><ActiveBookings /></ProtectedRoute>} />
        <Route path="/researcher/bookings/waitlist" element={<ProtectedRoute allowedRoles={['RESEARCHER']}><WaitlistBookings /></ProtectedRoute>} />
        <Route path="/researcher/bookings/history" element={<ProtectedRoute allowedRoles={['RESEARCHER']}><CompletedBookings /></ProtectedRoute>} />
        <Route path="/researcher/equipment-availability" element={<ProtectedRoute allowedRoles={['RESEARCHER']}><EquipmentAvailability /></ProtectedRoute>} />
        <Route path="/researcher/UsageSummary" element={<ProtectedRoute allowedRoles={['RESEARCHER']}><UsageSummary /></ProtectedRoute>} />
        <Route path="/researcher/equipment" element={<ProtectedRoute allowedRoles={['RESEARCHER']}><ResearcherEquipment /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
