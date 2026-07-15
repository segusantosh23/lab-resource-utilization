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
const RECURRENCE_OPTIONS = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'];

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

  /* add-reservation modal state */
  const [isAddOpen,   setIsAddOpen]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isConflict,  setIsConflict]  = useState(false);
  const [formData, setFormData] = useState({
    equipmentId:        '',
    quantity:           1,
    startTime:          '',
    endTime:            '',
    purpose:            '',
    isRecurring:        false,
    recurrencePattern:  '',
    recurrenceEndDate:  '',
  });

  /* ── fetch bookings for the visible month ───────────────────── */
  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = '/bookings/my';
      const res = await api.get(endpoint);
      setBookings(res.data);
      // update selected day bookings if modal is open
      if (selectedDay) {
        // We will re-calculate bookingsOnDate inside render anyway, but we need to update dayBookings
        // Wait, dayBookings is a separate state. We should update it.
      }
    } catch {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [year, month]);

  // Update dayBookings when bookings or related state changes
  useEffect(() => {
    if (selectedDay) {
      setDayBookings(bookingsOnDate(selectedDay.getDate()));
    }
  }, [bookings, selectedDay, year, month, equipFilter]);

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

  /* ── form helpers ───────────────────────────────────────────── */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'isRecurring' && !checked
        ? { recurrencePattern: '', recurrenceEndDate: '' }
        : {}),
    }));
  };

  const resetForm = () => {
    setFormData({
      equipmentId: '', quantity: 1, startTime: '', endTime: '', purpose: '',
      isRecurring: false, recurrencePattern: '', recurrenceEndDate: '',
    });
    setSubmitError('');
    setIsConflict(false);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      const start = new Date(formData.startTime);
      const end   = new Date(formData.endTime);
      if (start < new Date()) {
        setSubmitError('Start time must be in the future.');
        setSubmitting(false); return;
      }
      if (end <= start) {
        setSubmitError('End time must be after start time.');
        setSubmitting(false); return;
      }
      if (formData.isRecurring && !formData.recurrencePattern) {
        setSubmitError('Please choose a recurrence pattern.');
        setSubmitting(false); return;
      }
      if (formData.isRecurring && formData.recurrenceEndDate && new Date(formData.recurrenceEndDate) <= start) {
        setSubmitError('Recurrence end date must be after the start time.');
        setSubmitting(false); return;
      }
      const payload = {
        equipmentId:       parseInt(formData.equipmentId),
        quantity:          parseInt(formData.quantity) || 1,
        startTime:         formData.startTime,
        endTime:           formData.endTime,
        purpose:           formData.purpose,
        isRecurring:       formData.isRecurring,
        recurrencePattern: formData.isRecurring ? formData.recurrencePattern : null,
        recurrenceEndDate: (formData.isRecurring && formData.recurrenceEndDate) ? formData.recurrenceEndDate : null,
      };
      await api.post('/bookings', payload);
      setIsAddOpen(false);
      resetForm();
      fetchBookings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error creating booking.';
      setIsConflict(msg.toLowerCase().includes('already booked') || msg.toLowerCase().includes('conflict') || msg.toLowerCase().includes('time slot'));
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
              onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(today); }}
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

        {/* Day detail modal */}
        {selectedDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-[#12131a] border border-white/[0.05] rounded-xl p-6 shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 sticky top-0 bg-[#12131a] z-10 pb-4 border-b border-white/[0.05] pt-2">
                <h2 className="text-xl font-bold">
                  {selectedDay.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      const isoDate = new Date(selectedDay.getTime() - (selectedDay.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                      setFormData(prev => ({
                        ...prev,
                        startTime: `${isoDate}T09:00`,
                        endTime: `${isoDate}T10:00`
                      }));
                      setIsAddOpen(true);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition shadow-lg shadow-purple-500/20 whitespace-nowrap"
                  >
                    + Add Book Equipment
                  </button>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-gray-500 hover:text-white transition w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.05]"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {dayBookings.length === 0 ? (
                <div className="py-12 text-center border border-white/[0.02] rounded-lg bg-white/[0.01]">
                  <p className="text-gray-500">No bookings on this day.</p>
                </div>
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
          </div>
        )}

      {/* ════════════════════════════════════════════════════════
          ADD RESERVATION MODAL
      ════════════════════════════════════════════════════════ */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#12131a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8 relative">
            <h2 className="text-xl font-bold mb-4">New Reservation</h2>

            {submitError && (
              <div className={`mb-4 p-3 rounded-lg text-sm border flex gap-2 items-start
                ${isConflict ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="w-full">
                  <p className="font-medium">{isConflict ? 'Time Slot Conflict' : 'Booking Error'}</p>
                  <p className="text-xs mt-0.5 opacity-90">{submitError}</p>
                  {isConflict && (
                    <div className="mt-3 space-y-3">
                      <button
                        type="button"
                        onClick={handleJoinWaitlist}
                        disabled={joiningWaitlist || waitlistSuccess}
                        className="w-full px-3 py-1.5 rounded bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 transition text-xs font-medium flex items-center justify-center gap-2 text-orange-400"
                      >
                        {joiningWaitlist ? (
                          <>
                            <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                            Joining Waitlist...
                          </>
                        ) : waitlistSuccess ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            On Waitlist
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Join Waitlist
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Equipment *</label>
                <select required name="equipmentId" value={formData.equipmentId} onChange={handleInputChange} className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none">
                  <option value="">Select equipment…</option>
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} — {eq.status.replace(/_/g, ' ')} (Qty: {eq.quantity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Quantity *</label>
                <input required type="number" min="1" disabled={!formData.equipmentId} max={equipmentList.find(e => e.id == formData.equipmentId)?.quantity || 1} name="quantity" value={formData.equipmentId ? formData.quantity : ''} onChange={handleInputChange} className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Start Time *</label>
                  <input required type="datetime-local" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">End Time *</label>
                  <input required type="datetime-local" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 text-white focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Purpose *</label>
                <textarea required rows="2" name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="State the usage purpose…" className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
              </div>

              <div className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.01]">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input type="checkbox" name="isRecurring" checked={formData.isRecurring} onChange={handleInputChange} className="sr-only peer" />
                    <div className="w-10 h-5 bg-white/10 rounded-full peer-checked:bg-purple-600 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">Recurring Booking</span>
                </label>

                {formData.isRecurring && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Pattern *</label>
                      <select name="recurrencePattern" required={formData.isRecurring} value={formData.recurrencePattern} onChange={handleInputChange} className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none">
                        <option value="">Select pattern…</option>
                        {RECURRENCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.charAt(0) + opt.slice(1).toLowerCase()}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Recurrence End Date</label>
                      <input type="date" name="recurrenceEndDate" value={formData.recurrenceEndDate} onChange={handleInputChange} className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 text-white focus:outline-none" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05] mt-2">
                <button type="button" disabled={submitting} onClick={() => { setIsAddOpen(false); resetForm(); }} className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-sm transition">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-medium transition shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-60">
                  {submitting ? 'Verifying…' : 'Book Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default AvailabilityCalendar;
