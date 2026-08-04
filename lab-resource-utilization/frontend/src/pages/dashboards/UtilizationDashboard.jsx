import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUtilizationAnalytics, getRealTimeTracking, getEquipmentUtilizationRates, getDepartmentUtilizationRates, getInstitutionUtilizationRates, getIdleEquipment, getUtilizationHeatmap, getUsagePatterns } from '../../services/analyticsService';

/* ── mini stat card ────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, color = 'purple', icon }) => {
  const colors = {
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber:  'bg-amber-500/10  text-amber-400  border-amber-500/20',
    blue:   'bg-blue-500/10   text-blue-400   border-blue-500/20',
    red:    'bg-red-500/10    text-red-400    border-red-500/20',
    gray:   'bg-gray-500/10   text-gray-400   border-gray-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  };
  return (
    <div className={`bg-[#12131a] border rounded-xl p-5 flex flex-col gap-2 ${colors[color].split(' ')[2]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[color]}`}>{icon}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
};

/* ── progress bar ──────────────────────────────────────────────── */
const Bar = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const barColors = {
    emerald: 'bg-emerald-500',
    amber:   'bg-amber-500',
    blue:    'bg-blue-500',
    red:     'bg-red-500',
    purple:  'bg-purple-500',
    gray:    'bg-gray-500',
  };
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-white/[0.05] rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-700 ${barColors[color] || 'bg-purple-500'}`}
          style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right shrink-0">{value}</span>
    </div>
  );
};

const UtilizationDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data,    setData]    = useState(null);
  const [realTimeData, setRealTimeData] = useState([]);
  const [ratesData, setRatesData] = useState([]);
  const [deptRates, setDeptRates] = useState([]);
  const [instRates, setInstRates] = useState([]);
  const [idleEquip, setIdleEquip] = useState([]);
  const [heatmap, setHeatmap] = useState(null);
  const [usagePatterns, setUsagePatterns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [res, rtd, rates, drates, irates, idle, hm, up] = await Promise.all([
    getUtilizationAnalytics(user.email),
    getRealTimeTracking(user.email),
    getEquipmentUtilizationRates(user.email),
    getDepartmentUtilizationRates(user.email),
    getInstitutionUtilizationRates(user.email),
    getIdleEquipment(user.email),
    getUtilizationHeatmap(user.email),
    getUsagePatterns(user.email)
]);
        setData(res);
        setRealTimeData(rtd);
        setRatesData(rates);
        setDeptRates(drates);
        setInstRates(irates);
        setIdleEquip(idle);
        setHeatmap(hm);
        setUsagePatterns(up);
      } catch {
        setError('Failed to load utilization data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Utilization Dashboard</h1>
            <p className="text-gray-400 mt-1">Real-time numbers computed from live booking data.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { 
                setLoading(true); 
                Promise.all([getUtilizationAnalytics(user.email), getRealTimeTracking(user.email), getEquipmentUtilizationRates(user.email), getDepartmentUtilizationRates(user.email), getInstitutionUtilizationRates(user.email), getIdleEquipment(user.email), getUtilizationHeatmap(user.email), getUsagePatterns(user.email)])
                  .then(([res, rtd, rates, drates, irates, idle, hm, up]) => { setData(res); setRealTimeData(rtd); setRatesData(rates); setDeptRates(drates); setInstRates(irates); setIdleEquip(idle); setHeatmap(hm); setUsagePatterns(up); })
                  .catch(() => setError('Refresh failed.'))
                  .finally(() => setLoading(false)); 
              }}
              className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition text-sm"
            >
              ← Back
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-gray-400">Loading utilization data…</div>
        ) : error ? (
          <div className="p-16 text-center text-red-400">{error}</div>
        ) : data && (
          <>
            {/* ── Equipment Overview ── */}
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Equipment Overview</h2>
            
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                label="Overall Utilization" 
                value={`${data.utilizationPercentage}%`}
                sub={data.historicalUtilizationPercentage > 0 
                      ? `${data.utilizationPercentage >= data.historicalUtilizationPercentage ? '↑' : '↓'} ${Math.abs(Math.round((data.utilizationPercentage - data.historicalUtilizationPercentage)*10)/10)}% vs Last Month`
                      : "No historical data"}
                color="indigo" 
                icon="📊"
              />
              <StatCard 
                label="Completion Rate" 
                value={`${data.completionRate}%`} 
                sub={`${data.completedBookings} completed bookings`}
                color="emerald"
                icon="✅"
              />
              <StatCard label="Total"            value={data.totalEquipment}            color="purple" icon="📦" />
              <StatCard label="Maintenance"      value={data.underMaintenanceEquipment} color="amber"  icon="🔧" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <StatCard label="Available"        value={data.availableEquipment}        color="emerald" icon="✅" />
              <StatCard label="Booked"           value={data.bookedEquipment}           color="blue"   icon="📅" />
              <StatCard label="Out of Service"   value={data.outOfServiceEquipment}     color="red"    icon="🚫" />
              <StatCard label="Retired"          value={data.retiredEquipment}          color="gray"   icon="🗃️" />
            </div>

            {/* ── Booking Status Breakdown ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-[#12131a] border border-white/20 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Booking Status Breakdown</h2>
                <div className="space-y-3">
                  <Bar label="Pending Approval" value={data.pendingBookings}   max={data.totalBookings} color="amber" />
                  <Bar label="Confirmed"         value={data.confirmedBookings} max={data.totalBookings} color="emerald" />
                  <Bar label="In Use"            value={data.inUseBookings}     max={data.totalBookings} color="blue" />
                  <Bar label="Completed"         value={data.completedBookings} max={data.totalBookings} color="purple" />
                  <Bar label="Cancelled"         value={data.cancelledBookings} max={data.totalBookings} color="red" />
                  <Bar label="Rejected"          value={data.rejectedBookings}  max={data.totalBookings} color="gray" />
                </div>
              </div>

              {/* Summary numbers */}
              <div className="bg-[#12131a] border border-white/20 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Summary Numbers</h2>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard label="Total Bookings" value={data.totalBookings}    color="purple" icon="📋" />
                  <StatCard label="Pending"        value={data.pendingBookings}  color="amber"  icon="⏳" />
                  <StatCard label="In Use Now"     value={data.inUseBookings}    color="blue"   icon="▶️" />
                  <StatCard label="On Waitlist"    value={data.waitlistCount}    color="indigo" icon="📝"
                    sub="Active waitlist entries" />
                </div>
              </div>
            </div>

            {/* ── Real-Time Tracking & Idle Equipment ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <div className="bg-[#12131a] border border-white/20 rounded-xl p-6 flex flex-col">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Real-Time Equipment Usage Tracking</h2>
                {realTimeData.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No equipment is currently in use.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                      <thead className="bg-white/[0.02] border-b border-white/20">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-gray-400">Equipment</th>
                          <th className="px-4 py-3 font-semibold text-gray-400">Category</th>
                          <th className="px-4 py-3 font-semibold text-gray-400">Status</th>
                          <th className="px-4 py-3 font-semibold text-gray-400">Current User</th>
                          <th className="px-4 py-3 font-semibold text-gray-400">End Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02]">
                        {realTimeData.map((item) => (
                          <tr key={item.equipmentId} className="hover:bg-white/[0.01] transition-colors">
                            <td className="px-4 py-3 font-medium text-white">{item.equipmentName}</td>
                            <td className="px-4 py-3 text-xs">{item.category}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 text-[10px] font-semibold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {item.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3">{item.currentUserName}</td>
                            <td className="px-4 py-3 text-xs text-gray-400">
                              {new Date(item.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Idle Equipment Alerts ── */}
              <div className="bg-[#12131a] border border-rose-500/[0.2] rounded-xl p-6 shadow-[0_0_15px_rgba(244,63,94,0.05)] flex flex-col">
                <h2 className="text-sm font-semibold text-rose-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Idle Equipment Alerts (&ge; 14 Days)
                </h2>
                {idleEquip.length === 0 ? (
                  <div className="text-center text-gray-400 py-8 bg-white/[0.01] rounded-lg">No equipment is currently sitting idle. Excellent!</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                      <thead className="bg-white/[0.02] border-b border-white/20">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-gray-400">Equipment</th>
                          <th className="px-4 py-3 font-semibold text-gray-400">Category</th>
                          <th className="px-4 py-3 font-semibold text-gray-400 text-right">Days Idle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02]">
                        {idleEquip.map((item) => (
                          <tr key={item.equipmentId} className="hover:bg-white/[0.01] transition-colors">
                            <td className="px-4 py-3 font-medium text-white">{item.equipmentName}</td>
                            <td className="px-4 py-3 text-xs">{item.category}</td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400">
                                {item.daysIdle >= 999 ? 'Never Used' : `${item.daysIdle} days`}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>



            {/* ── Utilization Heatmap ── */}
            {heatmap && (() => {
              const globalMax = Math.max(1, ...Object.values(heatmap).flatMap(dayObj => Object.values(dayObj || {})));
              
              return (
              <div className="bg-[#12131a] border border-white/20 rounded-xl p-6 mb-10 overflow-hidden">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Weekly Utilization Pattern (Last 30 Days)</h2>
                <div className="w-full">
                  <div className="flex text-xs text-gray-500 mb-2 pl-16">
                    {Array.from({ length: 24 }).map((_, h) => (
                      <div key={h} className="flex-1 text-center">{h}h</div>
                    ))}
                  </div>
                  {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => {
                    return (
                      <div key={day} className="flex items-center mb-1 gap-1">
                        <div className="w-16 text-xs text-gray-400 font-medium">{day.slice(0, 3)}</div>
                        {Array.from({ length: 24 }).map((_, hour) => {
                          const count = heatmap[day]?.[hour] || 0;
                          let bgClass = "bg-white/[0.02]";
                          if (count > 0) {
                            const intensity = count / globalMax;
                            if (intensity > 0.75) bgClass = "bg-[#7866ff]";
                            else if (intensity > 0.5) bgClass = "bg-[#5c4ce1]";
                            else if (intensity > 0.25) bgClass = "bg-[#44389e]";
                            else bgClass = "bg-[#2e2b5c]";
                          }
                          return (
                            <div 
                              key={`${day}-${hour}`} 
                              className={`flex-1 h-6 rounded-sm ${bgClass} group relative cursor-pointer hover:ring-1 hover:ring-white/50 transition-all`}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-white/[0.1] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                                {day.slice(0, 3)} {hour}:00 - {count} booking{count !== 1 ? 's' : ''}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-end gap-2 mt-6 text-xs text-gray-400 font-medium">
                  <span>Less</span>
                  <div className="w-3.5 h-3.5 rounded-sm bg-white/[0.02]"></div>
                  <div className="w-3.5 h-3.5 rounded-sm bg-[#2e2b5c]"></div>
                  <div className="w-3.5 h-3.5 rounded-sm bg-[#44389e]"></div>
                  <div className="w-3.5 h-3.5 rounded-sm bg-[#5c4ce1]"></div>
                  <div className="w-3.5 h-3.5 rounded-sm bg-[#7866ff]"></div>
                  <span>More</span>
                </div>
              </div>
              );
            })()}



            {/* ── Shared/Exclusive & Equipment Rates ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              
              {/* ── Shared vs Exclusive Usage Patterns ── */}
              {usagePatterns && (
                <div className="bg-[#12131a] border border-white/20 rounded-xl p-6">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Shared vs. Exclusive Usage Patterns</h2>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                        <span className="text-gray-300">Shared Usage (Cross-Department)</span>
                      </div>
                      <span className="font-semibold text-white">{usagePatterns.sharedBookingsCount} bookings</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                        <span className="text-gray-300">Exclusive Usage (Same Department)</span>
                      </div>
                      <span className="font-semibold text-white">{usagePatterns.exclusiveBookingsCount} bookings</span>
                    </div>
                    
                    {/* Visual Bar */}
                    <div className="w-full h-4 bg-white/[0.05] rounded-full overflow-hidden flex mt-2">
                      {usagePatterns.sharedBookingsCount + usagePatterns.exclusiveBookingsCount > 0 ? (
                        <>
                          <div 
                            className="h-full bg-cyan-400" 
                            style={{ width: `${(usagePatterns.sharedBookingsCount / (usagePatterns.sharedBookingsCount + usagePatterns.exclusiveBookingsCount)) * 100}%` }}
                          ></div>
                          <div 
                            className="h-full bg-indigo-500" 
                            style={{ width: `${(usagePatterns.exclusiveBookingsCount / (usagePatterns.sharedBookingsCount + usagePatterns.exclusiveBookingsCount)) * 100}%` }}
                          ></div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-700"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      * Shared usage implies an equipment was booked by a user outside of its assigned department.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Utilization Rate per Equipment ── */}
              <div className="bg-[#12131a] border border-white/20 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Utilization Rate per Equipment (Last 30 Days)</h2>
                {ratesData.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No equipment available.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                      <thead className="bg-white/[0.02] border-b border-white/20">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-gray-400">Equipment</th>
                          <th className="px-4 py-3 font-semibold text-gray-400">Utilization Rate</th>
                          <th className="px-4 py-3 font-semibold text-gray-400 text-right">Performance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02]">
                        {ratesData.map((eq) => (
                          <tr key={eq.equipmentId} className="hover:bg-white/[0.01] transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">{eq.equipmentName}</div>
                              <div className="text-xs text-gray-500">{eq.category}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="w-full bg-white/[0.05] rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${eq.utilizationRate > 80 ? 'bg-indigo-500' : 'bg-blue-400'}`} 
                                  style={{ width: `${eq.utilizationRate}%` }}
                                ></div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300 font-semibold text-right">
                              {eq.utilizationRate}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              {/* ── Utilization Rate per Department ── */}
              <div className="bg-[#12131a] border border-white/20 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Utilization Rate per Department (Last 30 Days)</h2>
                {deptRates.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No departments available.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                      <thead className="bg-white/[0.02]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider rounded-tl-lg">Department</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Utilization</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Target</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider rounded-tr-lg">Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {deptRates.map((grp, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{grp.groupName}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="w-full bg-white/[0.05] rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${grp.utilizationRate >= grp.targetRate ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${grp.utilizationRate}%` }}></div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 text-right">
                              {grp.targetRate}%
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300 font-semibold text-right">
                              <span className={grp.utilizationRate >= grp.targetRate ? 'text-emerald-400' : 'text-amber-400'}>
                                {grp.utilizationRate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Utilization Rate per Institution ── */}
              <div className="bg-[#12131a] border border-white/20 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Utilization Rate per Institution (Last 30 Days)</h2>
                {instRates.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No institutions available.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                      <thead className="bg-white/[0.02]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider rounded-tl-lg">Institution</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Utilization</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Target</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider rounded-tr-lg">Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {instRates.map((grp, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{grp.groupName}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="w-full bg-white/[0.05] rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${grp.utilizationRate >= grp.targetRate ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${grp.utilizationRate}%` }}></div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 text-right">
                              {grp.targetRate}%
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300 font-semibold text-right">
                              <span className={grp.utilizationRate >= grp.targetRate ? 'text-emerald-400' : 'text-amber-400'}>
                                {grp.utilizationRate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UtilizationDashboard;
