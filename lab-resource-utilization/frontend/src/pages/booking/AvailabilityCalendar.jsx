import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const STATUS_COLORS = {
  PENDING_APPROVAL: { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  CONFIRMED:        { dot: 'bg-emerald-400',  text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  IN_USE:           { dot: 'bg-blue-400',     text: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  COMPLETED:        { dot: 'bg-purple-400',   text: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
  CANCELLED:        { dot: 'bg-gray-500',     text: 'text-gray-400',    bg: 'bg-gray-500/10 border-gray-500/20' },
  REJECTED:         { dot: 'bg-red-400',      text: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const AvailabilityCalendar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed

  const [bookings,       setBookings]       = useState([]);
  const [equipmentList,  setEquipmentList]  = useState([]);
  const [equipFilter,    setEquipFilter]    = useState('');
  const [selectedDay,    setSelectedDay]    = useState(null); // Date object
  const [dayBookings,    setDayBookings]    = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');

  const isManagerOrAdmin = user && ['LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN'].includes(user.role);

  /* ── fetch bookings for the visible month ───────────────────── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const endpoint = isManagerOrAdmin ? '/bookings' : '/bookings/my';
        const res = await api.get(endpoint);
        setBookings(res.data);
      } catch {
        setError('Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [year, month]);

  useEffect(() => {
    api.get('/equipment').then(r => setEquipmentList(r.data)).catch(() => {});
  }, []);

  /* ── calendar grid helpers ───────────────────────────────────── */
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth     = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  /* bookings that fall on a specific calendar date */
  const bookingsOnDate = (day) => {
    const target = new Date(year, month, day);
    return bookings.filter(b => {
      if (equipFilter && b.equipmentId !== parseInt(equipFilter)) return false;
      const start = new Date(b.startTime);
      const end   = new Date(b.endTime);
      // booking overlaps this day
      const dayStart = new Date(year, month, day, 0, 0, 0);
      const dayEnd   = new Date(year, month, day, 23, 59, 59);
      return start <= dayEnd && end >= dayStart;
    });
  };

  const handleDayClick = (day) => {
    const d = new Date(year, month, day);
    setSelectedDay(d);
    setDayBookings(bookingsOnDate(day));
  };

  /* dominant status colour for a day cell */
  const dominantStatus = (items) => {
    const priority = ['IN_USE','CONFIRMED','PENDING_APPROVAL','COMPLETED','CANCELLED','REJECTED'];
    for (const s of priority) {
      if (items.some(b => b.status === s)) return s;
    }
    return null;
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  /* ── render ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Availability Calendar</h1>
            <p className="text-gray-400 mt-1">See equipment bookings at a glance.</p>
          </div>
          <button
            onClick={() => navigate('/bookings')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] transition font-medium text-sm shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Bookings
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center">
          {/* Month nav */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-lg font-semibold w-44 text-center">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(null); }}
              className="px-3 py-1.5 text-xs rounded-lg bg-purple-600 hover:bg-purple-500 transition font-medium"
            >
              Today
            </button>
          </div>

          {/* Equipment filter */}
          <select
            value={equipFilter}
            onChange={e => { setEquipFilter(e.target.value); setSelectedDay(null); }}
            className="bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none md:ml-auto"
          >
            <option value="">All Equipment</option>
            {equipmentList.map(eq => (
              <option key={eq.id} value={eq.id}>{eq.name}</option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-5 text-xs">
          {Object.entries(STATUS_COLORS).map(([status, c]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
              <span className="text-gray-400">{status.replace(/_/g,' ')}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading calendar…</div>
        ) : error ? (
          <div className="p-12 text-center text-red-400">{error}</div>
        ) : (
          <div className="bg-[#12131a] border border-white/[0.05] rounded-xl overflow-hidden shadow-xl">
            {/* Day-name header */}
            <div className="grid grid-cols-7 border-b border-white/[0.05]">
              {DAY_NAMES.map(d => (
                <div key={d} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {/* Leading empty cells */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`e-${i}`} className="min-h-[90px] border-b border-r border-white/[0.03] bg-[#0d0e12]/40" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day   = i + 1;
                const items = bookingsOnDate(day);
                const ds    = dominantStatus(items);
                const cellDate = new Date(year, month, day);
                const dayName  = DAY_NAMES[cellDate.getDay()];
                const isToday =
                  day === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear();
                const isSelected =
                  selectedDay &&
                  selectedDay.getDate() === day &&
                  selectedDay.getMonth() === month &&
                  selectedDay.getFullYear() === year;

                return (
                  <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`min-h-[110px] border-b border-r border-white/[0.03] p-2 cursor-pointer transition
                      ${isSelected ? 'bg-purple-500/10 ring-1 ring-inset ring-purple-500/40' : 'hover:bg-white/[0.02]'}`}
                  >
                    {/* Day name + date number stacked */}
                    <div className="flex flex-col items-center mb-1.5">
                      <span className="text-[9px] font-semibold text-gray-600 uppercase tracking-wider leading-none mb-0.5">
                        {dayName}
                      </span>
                      <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold
                        ${isToday ? 'bg-purple-600 text-white' : 'text-gray-300'}`}>
                        {day}
                      </div>
                    </div>

                    {/* Up to 2 booking pills */}
                    <div className="space-y-0.5">
                      {items.slice(0, 2).map(b => {
                        const c = STATUS_COLORS[b.status] || STATUS_COLORS.CANCELLED;
                        return (
                          <div
                            key={b.id}
                            className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${c.text} ${c.bg}`}
                            title={`${b.equipmentName} — ${b.status}`}
                          >
                            {b.equipmentName}
                          </div>
                        );
                      })}
                      {items.length > 2 && (
                        <div className="text-[10px] text-gray-500 pl-1">+{items.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Day detail panel */}
        {selectedDay && (
          <div className="mt-6 bg-[#12131a] border border-white/[0.05] rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {selectedDay.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h2>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gray-500 hover:text-white transition text-xl leading-none"
              >
                ×
              </button>
            </div>

            {dayBookings.length === 0 ? (
              <p className="text-gray-500 text-sm">No bookings on this day.</p>
            ) : (
              <div className="space-y-3">
                {dayBookings.map(b => {
                  const c = STATUS_COLORS[b.status] || STATUS_COLORS.CANCELLED;
                  return (
                    <div key={b.id} className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg border ${c.bg}`}>
                      <div>
                        <p className="font-semibold text-white text-sm">{b.equipmentName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatTime(b.startTime)} – {formatTime(b.endTime)}
                        </p>
                        {b.purpose && (
                          <p className="text-xs text-gray-500 mt-0.5 italic">"{b.purpose}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">{b.userName}</p>
                          <p className="text-[10px] text-gray-600">{b.userEmail}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${c.text} ${c.bg}`}>
                          {b.status.replace(/_/g,' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
