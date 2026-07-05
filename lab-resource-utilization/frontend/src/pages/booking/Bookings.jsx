import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

/* ── status helpers ─────────────────────────────────────────────── */
const STATUS_STYLES = {
  PENDING_APPROVAL: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CONFIRMED:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  IN_USE:           'bg-blue-500/10 text-blue-400 border-blue-500/20',
  COMPLETED:        'bg-purple-500/10 text-purple-400 border-purple-500/20',
  CANCELLED:        'bg-red-500/10 text-red-400 border-red-500/20',
  REJECTED:         'bg-red-500/10 text-red-400 border-red-500/20',
};

const RECURRENCE_OPTIONS = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'];

const Bookings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'my';
  const initialStatus = searchParams.get('status') || '';

  const [bookings,      setBookings]      = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  /* view tabs: 'my' | 'all' */
  const [viewTab, setViewTab] = useState(initialTab);

  /* filters for the list */
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [roleFilter, setRoleFilter] = useState('');

  /* add-reservation modal */
  const [isAddOpen,   setIsAddOpen]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');

  /* form state — includes recurring fields */
  const [formData, setFormData] = useState({
    equipmentId:        '',
    startTime:          '',
    endTime:            '',
    purpose:            '',
    isRecurring:        false,
    recurrencePattern:  '',
    recurrenceEndDate:  '',
  });

  const isManagerOrAdmin = user && [
    'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN',
  ].includes(user.role);

  /* ── data fetching ─────────────────────────────────────────── */
  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = (viewTab === 'all' && isManagerOrAdmin) ? '/bookings' : '/bookings/my';
      const res = await api.get(endpoint);
      setBookings(res.data);
    } catch {
      setError('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const res = await api.get('/equipment');
      setEquipmentList(res.data);
    } catch {
      console.error('Failed to load equipment list');
    }
  };

  useEffect(() => { fetchBookings(); }, [viewTab]);
  useEffect(() => { fetchEquipment(); }, []);

  /* ── form helpers ───────────────────────────────────────────── */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // reset recurrence fields when toggle turned off
      ...(name === 'isRecurring' && !checked
        ? { recurrencePattern: '', recurrenceEndDate: '' }
        : {}),
    }));
  };

  const resetForm = () => {
    setFormData({
      equipmentId: '', startTime: '', endTime: '', purpose: '',
      isRecurring: false, recurrencePattern: '', recurrenceEndDate: '',
    });
    setSubmitError('');
  };

  /* ── submit booking ─────────────────────────────────────────── */
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      const start = new Date(formData.startTime);
      const end   = new Date(formData.endTime);
      if (start < new Date()) {
        setSubmitError('Start time must be in the future.');
        setSubmitting(false);
        return;
      }
      if (end <= start) {
        setSubmitError('End time must be after start time.');
        setSubmitting(false);
        return;
      }
      if (formData.isRecurring && !formData.recurrencePattern) {
        setSubmitError('Please choose a recurrence pattern.');
        setSubmitting(false);
        return;
      }
      if (formData.isRecurring && formData.recurrenceEndDate &&
          new Date(formData.recurrenceEndDate) <= start) {
        setSubmitError('Recurrence end date must be after the start time.');
        setSubmitting(false);
        return;
      }

      const payload = {
        equipmentId:       parseInt(formData.equipmentId),
        startTime:         formData.startTime,
        endTime:           formData.endTime,
        purpose:           formData.purpose,
        isRecurring:       formData.isRecurring,
        recurrencePattern: formData.isRecurring ? formData.recurrencePattern : null,
        recurrenceEndDate: (formData.isRecurring && formData.recurrenceEndDate)
                             ? formData.recurrenceEndDate : null,
      };

      await api.post('/bookings', payload);
      setIsAddOpen(false);
      resetForm();
      fetchBookings();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Error creating booking. Check for time conflicts.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── status transitions ─────────────────────────────────────── */
  const handleStatusChange = async (bookingId, newStatus, reason = null) => {
    try {
      const params = { status: newStatus };
      if (reason) params.rejectionReason = reason;
      await api.put(`/bookings/${bookingId}/status`, null, { params });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  const handleReject = async (bookingId) => {
    const reason = window.prompt('Rejection reason (optional):');
    if (reason === null) return; // user cancelled the prompt
    await handleStatusChange(bookingId, 'REJECTED', reason || undefined);
  };

  /* ── filtered list ──────────────────────────────────────────── */
  const displayed = bookings.filter(b => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (roleFilter && b.userRole !== roleFilter) return false;
    return true;
  });

  /* ── summary counts ─────────────────────────────────────────── */
  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* ── Page header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
            <p className="text-gray-400 mt-1">Reserve equipment and monitor time slots.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick-nav links to sub-pages */}
            <Link
              to="/bookings/calendar"
              className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition font-medium text-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </Link>
            <Link
              to="/bookings/history"
              className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition font-medium text-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              History
            </Link>
            <Link
              to="/bookings/waitlist"
              className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition font-medium text-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Waitlist
            </Link>
            <button
              onClick={() => { resetForm(); setIsAddOpen(true); }}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-500/20 font-medium text-sm"
            >
              + Reserve Equipment
            </button>
          </div>
        </div>

        {/* ── Tabs and Filters Row ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/[0.05] mb-6 pb-2 gap-4">
          
          {/* Tabs for Admin/Manager vs regular users */}
          <div className="flex gap-4">
            {isManagerOrAdmin ? (
              [['my', 'My Bookings'], ['all', 'All Portal Bookings']].map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => { setViewTab(tab); setStatusFilter(''); setRoleFilter(''); }}
                  className={`pb-2 px-1 text-sm font-semibold border-b-2 transition
                    ${viewTab === tab
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                  {label}
                </button>
              ))
            ) : (
              <span className="pb-2 px-1 text-sm font-semibold border-b-2 border-purple-500 text-purple-400">
                My Bookings
              </span>
            )}
          </div>

          {/* Filters (only visible if bookings exist) */}
          {!loading && !error && bookings.length > 0 && (
            <div className="flex flex-wrap items-center gap-4">
               {/* Status Filter */}
               <div className="flex items-center gap-2">
                 <span className="text-xs text-gray-400 font-medium">Status:</span>
                 <select
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="bg-[#181922] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                 >
                   <option value="">All ({bookings.length})</option>
                   {Object.entries(counts).map(([status, count]) => (
                     <option key={status} value={status}>{status.replace(/_/g, ' ')} ({count})</option>
                   ))}
                 </select>
               </div>
               
               {/* Role Filter (only for managers looking at all bookings) */}
               {isManagerOrAdmin && viewTab === 'all' && (
                 <div className="flex items-center gap-2">
                   <span className="text-xs text-gray-400 font-medium">Role:</span>
                   <select
                     value={roleFilter}
                     onChange={(e) => setRoleFilter(e.target.value)}
                     className="bg-[#181922] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                   >
                     <option value="">All Roles</option>
                     {Array.from(new Set(bookings.map(b => b.userRole).filter(Boolean))).map(role => (
                       <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
                     ))}
                   </select>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* ── Bookings table ── */}
        <div className="bg-[#12131a] border border-white/[0.05] rounded-xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading bookings…</div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">{error}</div>
          ) : displayed.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {statusFilter
                ? `No bookings with status "${statusFilter.replace(/_/g, ' ')}".`
                : 'No reservations found. Click "Reserve Equipment" to start.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#161720] border-b border-white/[0.05]">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Equipment</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Reserved By</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Start Time</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">End Time</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Purpose</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Recurring</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {displayed.map(item => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition">
                      <td className="px-6 py-4 font-medium text-white">{item.equipmentName}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        <div>{item.userName}</div>
                        <div className="text-xs text-gray-600">{item.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(item.startTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(item.endTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 max-w-[180px] truncate" title={item.purpose}>
                        {item.purpose}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {item.isRecurring ? (
                          <span className="px-2 py-0.5 text-xs rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {item.recurrencePattern || 'Recurring'}
                          </span>
                        ) : (
                          <span className="text-gray-700">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border whitespace-nowrap inline-block ${STATUS_STYLES[item.status] || STATUS_STYLES.CANCELLED}`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* ── Action buttons per status ── */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 flex-nowrap">

                          {/* Cancel — own pending (for non-managers) or confirmed bookings */}
                          {((!isManagerOrAdmin && item.status === 'PENDING_APPROVAL') || item.status === 'CONFIRMED') && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'CANCELLED')}
                              className="text-red-400 hover:text-red-300 text-xs px-2.5 py-1.5 rounded bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition whitespace-nowrap"
                            >
                              Cancel
                            </button>
                          )}

                          {/* Approve / Reject — managers only, pending items */}
                          {isManagerOrAdmin && item.status === 'PENDING_APPROVAL' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(item.id, 'CONFIRMED')}
                                className="text-emerald-400 hover:text-emerald-300 text-xs px-2.5 py-1.5 rounded bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition whitespace-nowrap"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(item.id)}
                                className="text-red-400 hover:text-red-300 text-xs px-2.5 py-1.5 rounded bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition whitespace-nowrap"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* Check In — confirmed booking */}
                          {item.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'IN_USE')}
                              className="text-blue-400 hover:text-blue-300 text-xs px-2.5 py-1.5 rounded bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition"
                            >
                              Check In
                            </button>
                          )}

                          {/* Complete — in-use booking */}
                          {item.status === 'IN_USE' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'COMPLETED')}
                              className="text-purple-400 hover:text-purple-300 text-xs px-2.5 py-1.5 rounded bg-purple-500/5 border border-purple-500/10 hover:bg-purple-500/10 transition"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          ADD RESERVATION MODAL
      ════════════════════════════════════════════════════════ */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#12131a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
            <h2 className="text-xl font-bold mb-4">New Reservation</h2>

            {submitError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                {submitError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">

              {/* Equipment select */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Equipment *</label>
                <select
                  required
                  name="equipmentId"
                  value={formData.equipmentId}
                  onChange={handleInputChange}
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="">Select equipment…</option>
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} — {eq.status.replace(/_/g, ' ')} (Qty: {eq.quantity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Time range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Start Time *</label>
                  <input
                    required type="datetime-local"
                    name="startTime" value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">End Time *</label>
                  <input
                    required type="datetime-local"
                    name="endTime" value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Purpose *</label>
                <textarea
                  required rows="2"
                  name="purpose" value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="State the usage purpose…"
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* ── Recurring booking toggle ── */}
              <div className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.01]">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="isRecurring"
                      checked={formData.isRecurring}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-white/10 rounded-full peer-checked:bg-purple-600 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">Recurring Booking</span>
                </label>

                {formData.isRecurring && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Pattern *</label>
                      <select
                        name="recurrencePattern"
                        required={formData.isRecurring}
                        value={formData.recurrencePattern}
                        onChange={handleInputChange}
                        className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      >
                        <option value="">Select pattern…</option>
                        {RECURRENCE_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt.charAt(0) + opt.slice(1).toLowerCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Recurrence End Date</label>
                      <input
                        type="date"
                        name="recurrenceEndDate"
                        value={formData.recurrenceEndDate}
                        onChange={handleInputChange}
                        className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit row */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05] mt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => { setIsAddOpen(false); resetForm(); }}
                  className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-medium transition shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-60"
                >
                  {submitting ? 'Verifying…' : 'Book Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Bookings;
