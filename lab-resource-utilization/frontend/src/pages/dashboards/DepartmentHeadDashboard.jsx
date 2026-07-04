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

  const dashboardItems = [
    { title: "Department equipment utilization heatmap", desc: "Visualize usage patterns across your department's resources.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { title: "Booking adoption and no-show rates", desc: "Track how effectively your lab's booking system is being used.", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { title: "Maintenance schedule overview", desc: "Keep track of upcoming maintenance and repairs for your equipment.", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", color: "text-amber-400", bg: "bg-amber-500/10" },
    { title: "High-demand equipment alerts", desc: "Get notified about heavily requested tools and potential bottlenecks.", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", color: "text-red-400", bg: "bg-red-500/10" },
    { title: "Sharing requests and approvals", desc: "Manage inbound and outbound equipment sharing requests.", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4", color: "text-purple-400", bg: "bg-purple-500/10" }
  ];

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white font-sans pb-16 relative">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none"></div>

      <main className="max-w-7xl mx-auto px-6 mt-8 relative z-10 animate-fadeIn">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Department Head Dashboard</h1>
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

export default DepartmentHeadDashboard;
