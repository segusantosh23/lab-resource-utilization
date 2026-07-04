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

  const dashboardItems = [
    { title: "Organization-wide equipment utilization intelligence", desc: "Gain insights into resource usage across all departments.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { title: "Cross-department resource sharing overview", desc: "Monitor and analyze equipment sharing between different departments.", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { title: "Procurement recommendations and cost analysis", desc: "Data-driven recommendations for new purchases and budget allocation.", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { title: "Equipment lifecycle and ROI metrics", desc: "Track the lifespan and return on investment for major assets.", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", color: "text-purple-400", bg: "bg-purple-500/10" },
    { title: "System monitoring and user management", desc: "Oversee platform health and manage user roles globally.", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "Reports management", desc: "Generate and export comprehensive organizational reports.", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "text-amber-400", bg: "bg-amber-500/10" }
  ];

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white font-sans pb-16 relative">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none"></div>

      <main className="max-w-7xl mx-auto px-6 mt-8 relative z-10 animate-fadeIn">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">System Administrator Dashboard</h1>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, idx) => (
            <div key={idx} className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-purple-500/30 flex flex-col h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-800 text-gray-300 border border-gray-700 uppercase tracking-wider">
                    Under Development
                 </span>
              </div>
              <div className={`p-3 ${item.bg} ${item.color} rounded-lg inline-block mb-4 w-12 h-12 flex items-center justify-center`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 pr-24">{item.title}</h3>
              <p className="text-gray-400 text-sm mb-4 flex-grow">{item.desc}</p>
              <div className="mt-auto h-24 flex items-center justify-center border border-dashed border-white/[0.1] rounded-lg text-gray-500 text-sm group-hover:border-purple-500/20 group-hover:bg-purple-500/5 transition-all">
                 <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Coming Soon
                 </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SystemAdminDashboard;
