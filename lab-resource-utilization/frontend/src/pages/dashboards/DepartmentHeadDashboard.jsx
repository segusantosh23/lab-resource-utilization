import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const DepartmentHeadDashboard = () => {
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
        <h1 className="text-3xl font-bold mb-8 tracking-tight">Department Intelligence</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-purple-500/30">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg inline-block mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Resource Utilization</h3>
            <p className="text-gray-400 text-sm mb-4">Analyze booking adoption rates and no-show metrics.</p>
            <div className="h-20 flex items-center justify-center border border-dashed border-white/[0.1] rounded-lg text-gray-500 text-sm"></div>
          </div>

          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-purple-500/30">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg inline-block mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Budget & Cost Analysis</h3>
            <p className="text-gray-400 text-sm mb-4">Review cost recovery and chargebacks for shared equipment.</p>
            <div className="h-20 flex items-center justify-center border border-dashed border-white/[0.1] rounded-lg text-gray-500 text-sm"></div>
          </div>

          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-purple-500/30">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg inline-block mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Department Reports</h3>
            <p className="text-gray-400 text-sm mb-4">Generate efficiency reports and procurement recommendations.</p>
            <div className="h-20 flex items-center justify-center border border-dashed border-white/[0.1] rounded-lg text-gray-500 text-sm"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DepartmentHeadDashboard;

