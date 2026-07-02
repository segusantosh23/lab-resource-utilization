import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const SystemAdminDashboard = () => {
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
        <h1 className="text-3xl font-bold mb-8 tracking-tight">System Control Center</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-purple-500/30">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg inline-block mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Global System Settings</h3>
            <p className="text-gray-400 text-sm mb-4">Manage API limits, caching policies, and integrations.</p>
            <div className="h-20 flex items-center justify-center border border-dashed border-white/[0.1] rounded-lg text-gray-500 text-sm"></div>
          </div>

          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-purple-500/30">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg inline-block mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">All Users Directory</h3>
            <p className="text-gray-400 text-sm mb-4">Audit user accounts and manage top-level permissions.</p>
            <div className="h-20 flex items-center justify-center border border-dashed border-white/[0.1] rounded-lg text-gray-500 text-sm"></div>
          </div>

          <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-purple-500/30">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg inline-block mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">System Logs</h3>
            <p className="text-gray-400 text-sm mb-4">View real-time error reporting and authentication logs.</p>
            <div className="h-20 flex items-center justify-center border border-dashed border-white/[0.1] rounded-lg text-gray-500 text-sm"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemAdminDashboard;

