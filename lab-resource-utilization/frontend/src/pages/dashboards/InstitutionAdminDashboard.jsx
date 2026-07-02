import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const InstitutionAdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white font-sans pb-16 relative">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none"></div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 mt-8 relative z-10 animate-fadeIn">
        <h1 className="text-3xl font-bold mb-8 tracking-tight">Institution Overview</h1>
        
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-5 shadow-lg">
            <p className="text-gray-400 text-sm font-medium mb-1">Total Users</p>
            <p className="text-3xl font-bold">—</p>
          </div>
          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-5 shadow-lg">
            <p className="text-gray-400 text-sm font-medium mb-1">Departments</p>
            <p className="text-3xl font-bold text-indigo-400">—</p>
          </div>
          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-5 shadow-lg">
            <p className="text-gray-400 text-sm font-medium mb-1">Shared Assets</p>
            <p className="text-3xl font-bold text-purple-400">—</p>
          </div>
          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-5 shadow-lg">
            <p className="text-gray-400 text-sm font-medium mb-1">Total Value ROI</p>
            <p className="text-3xl font-bold text-emerald-400">—</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:border-purple-500/30">
            <h3 className="text-lg font-semibold mb-2">User Management</h3>
            <p className="text-gray-400 text-sm mb-4">Onboard new lab managers and technicians across the institution.</p>
            <div className="h-32 flex items-center justify-center border border-dashed border-white/[0.1] rounded-lg text-gray-500 text-sm"></div>
          </div>

          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:border-purple-500/30">
            <h3 className="text-lg font-semibold mb-2">Cross-Department Sharing</h3>
            <p className="text-gray-400 text-sm mb-4">Monitor and approve inter-institution resource sharing workflows.</p>
            <div className="h-32 flex items-center justify-center border border-dashed border-white/[0.1] rounded-lg text-gray-500 text-sm"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstitutionAdminDashboard;

