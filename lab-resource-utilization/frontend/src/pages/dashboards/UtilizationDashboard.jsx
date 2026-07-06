import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUtilizationAnalytics } from '../../services/analyticsService';

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
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getUtilizationAnalytics();
        setData(res);
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
              onClick={() => { setLoading(true); getUtilizationAnalytics().then(setData).catch(() => setError('Refresh failed.')).finally(() => setLoading(false)); }}
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
              <StatCard label="Total"            value={data.totalEquipment}            color="purple" icon="📦" />
              <StatCard label="Available"        value={data.availableEquipment}        color="emerald" icon="✅" />
              <StatCard label="Booked"           value={data.bookedEquipment}           color="blue"   icon="📅" />
              <StatCard label="Maintenance"      value={data.underMaintenanceEquipment} color="amber"  icon="🔧" />
              <StatCard label="Out of Service"   value={data.outOfServiceEquipment}     color="red"    icon="🚫" />
              <StatCard label="Retired"          value={data.retiredEquipment}          color="gray"   icon="🗃️" />
            </div>

            {/* ── Utilization % ring + rates ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Utilization % */}
              <div className="bg-[#12131a] border border-white/[0.05] rounded-xl p-6 flex flex-col items-center justify-center gap-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilization Rate</p>
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke="#a855f7" strokeWidth="3"
                      strokeDasharray={`${data.utilizationPercentage} ${100 - data.utilizationPercentage}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{data.utilizationPercentage}%</span>
                    <span className="text-[10px] text-gray-500">utilization</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Equipment with active bookings vs total
                </p>
              </div>

              {/* Completion Rate */}
              <div className="bg-[#12131a] border border-white/[0.05] rounded-xl p-6 flex flex-col items-center justify-center gap-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completion Rate</p>
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke="#10b981" strokeWidth="3"
                      strokeDasharray={`${data.completionRate} ${100 - data.completionRate}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{data.completionRate}%</span>
                    <span className="text-[10px] text-gray-500">completion</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Completed vs total closed bookings
                </p>
              </div>

              {/* Approval Rate */}
              <div className="bg-[#12131a] border border-white/[0.05] rounded-xl p-6 flex flex-col items-center justify-center gap-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Approval Rate</p>
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke="#3b82f6" strokeWidth="3"
                      strokeDasharray={`${data.approvalRate} ${100 - data.approvalRate}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{data.approvalRate}%</span>
                    <span className="text-[10px] text-gray-500">approval</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Confirmed vs all decided bookings
                </p>
              </div>
            </div>

            {/* ── Booking Status Breakdown ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-[#12131a] border border-white/[0.05] rounded-xl p-6">
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
              <div className="bg-[#12131a] border border-white/[0.05] rounded-xl p-6">
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
          </>
        )}
      </div>
    </div>
  );
};

export default UtilizationDashboard;
