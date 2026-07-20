import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getAllEquipment } from '../../services/equipmentService';

const LabTechnicianDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [totalEquipment, setTotalEquipment] = useState(0);
  const [maintenanceCount, setMaintenanceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const equipmentData = await getAllEquipment();
        
        setTotalEquipment(equipmentData.length);
        const maintenanceData = await fetch(
          `http://localhost:8081/api/maintenance/technician/${user.name}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then(res => res.json());

        setMaintenanceCount(maintenanceData.length);

      } catch (error) {
        console.error("Failed to fetch technician dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const dashboardItems = [
    { 
      title: "Equipment Status", 
      desc: "Quickly toggle availability or mark items out-of-service.", 
      icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z", 
      color: "text-blue-400", bg: "bg-blue-500/10",
      value: totalEquipment,
      label: "Tracked Items"
    },
    { 
      title: "Maintenance Tasks", 
      desc: "View your assigned preventive maintenance work orders.", 
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", 
      color: "text-amber-400", bg: "bg-amber-500/10",
      value: maintenanceCount,
      label: "Items in Maintenance"
    },
    { 
      title: "Calibration Schedule", 
      desc: "Track upcoming equipment calibrations and certifications.", 
      icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", 
      color: "text-rose-400", bg: "bg-rose-500/10",
      isUnderDev: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white font-sans pb-16 relative">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none"></div>

      <main className="max-w-7xl mx-auto px-6 mt-8 relative z-10 animate-fadeIn">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Technician Dashboard</h1>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, idx) => (
            <div key={idx} className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-purple-500/30 flex flex-col h-full relative overflow-hidden group">
              {item.isUnderDev && (
                <div className="absolute top-0 right-0 p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-800 text-gray-300 border border-gray-700 uppercase tracking-wider">
                      Under Development
                  </span>
                </div>
              )}
              <div className={`p-3 ${item.bg} ${item.color} rounded-lg inline-block mb-4 w-12 h-12 flex items-center justify-center`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 pr-24">{item.title}</h3>
              <p className="text-gray-400 text-sm mb-4 flex-grow">{item.desc}</p>
              
              <div className="mt-auto h-24 flex items-center justify-center border border-dashed border-white/[0.1] rounded-lg text-gray-500 text-sm group-hover:border-purple-500/20 transition-all">
                 {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Loading...
                    </span>
                 ) : item.isUnderDev ? (
                    <span className="flex items-center gap-2 group-hover:bg-purple-500/5 px-4 py-2 rounded-lg">
                      <svg className="w-4 h-4 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Coming Soon
                    </span>
                 ) : (
                    <div className="text-center group-hover:scale-105 transition-transform">
                      <p className="text-3xl font-bold text-white mb-1">{item.value ?? 'N/A'}</p>
                      <p className="text-xs text-purple-400 uppercase tracking-wide font-semibold">{item.label}</p>
                    </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LabTechnicianDashboard;
