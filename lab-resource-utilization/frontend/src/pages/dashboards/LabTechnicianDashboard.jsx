import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const LabTechnicianDashboard = () => {
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
        <h1 className="text-3xl font-bold mb-8 tracking-tight">Technician Dashboard</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-purple-500/30">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg inline-block mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Equipment Status</h3>
            <p className="text-gray-400 text-sm mb-4">Quickly toggle availability or mark items out-of-service.</p>
            <div className="h-20 flex items-center justify-center border border-dashed border-white/[0.1] rounded-lg text-gray-500 text-sm"></div>
          </div>

          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-purple-500/30">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg inline-block mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Maintenance Tasks</h3>
            <p className="text-gray-400 text-sm mb-4">View your assigned preventive maintenance work orders.</p>
            <div className="h-20 flex items-center justify-center border border-dashed border-white/[0.1] rounded-lg text-gray-500 text-sm"></div>
          </div>

          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-purple-500/30">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg inline-block mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Calibration Schedule</h3>
            <p className="text-gray-400 text-sm mb-4">Track upcoming equipment calibrations and certifications.</p>
            <div className="h-20 flex items-center justify-center border border-dashed border-white/[0.1] rounded-lg text-gray-500 text-sm"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LabTechnicianDashboard;

