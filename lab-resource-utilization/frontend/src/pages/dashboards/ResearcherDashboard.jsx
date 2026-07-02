import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ResearcherDashboard = () => {
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
        <h1 className="text-3xl font-bold mb-8 tracking-tight">Researcher Portal</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-purple-500/30">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg inline-block mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">My Bookings</h3>
            <p className="text-gray-400 text-sm mb-4">View and manage your upcoming reservations.</p>
            <div className="h-20 flex items-center justify-center border border-dashed border-white/[0.1] rounded-lg text-gray-500 text-sm">Under development</div>
          </div>

          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-purple-500/30">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg inline-block mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Equipment Availability</h3>
            <p className="text-gray-400 text-sm mb-4">Search the catalog and check real-time status.</p>
            <div className="h-20 flex items-center justify-center border border-dashed border-white/[0.1] rounded-lg text-gray-500 text-sm">Under development</div>
          </div>

          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-purple-500/30">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg inline-block mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Booking History</h3>
            <p className="text-gray-400 text-sm mb-4">Analyze your past equipment usage patterns.</p>
            <div className="h-20 flex items-center justify-center border border-dashed border-white/[0.1] rounded-lg text-gray-500 text-sm">Under development</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResearcherDashboard;

