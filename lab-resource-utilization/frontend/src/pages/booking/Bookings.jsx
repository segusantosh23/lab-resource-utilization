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

// Equipment statuses that mean the equipment cannot be booked
const UNAVAILABLE_STATUSES = ['BOOKED', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED'];

const Bookings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'my';
  const initialStatus = searchParams.get('status') || '';
  const initialAdd = searchParams.get('add') === 'true';
  const initialDate = searchParams.get('date');

  const [bookings,      setBookings]      = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  const isResearcher = user?.role === 'RESEARCHER';

  /* view tabs: 'my' | 'all' */
  const [viewTab, setViewTab] = useState(isResearcher ? 'my' : 'all');

  /* filters for the list */
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [roleFilter, setRoleFilter] = useState('');

  /* add-reservation modal */
  const [isAddOpen,   setIsAddOpen]   = useState(initialAdd);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isConflict,  setIsConflict]  = useState(false);

  /* reject modal */
  const [rejectModal,     setRejectModal]     = useState({ open: false, bookingId: null });
  const [rejectReason,    setRejectReason]    = useState('');
  const [rejectSubmitting,setRejectSubmitting]= useState(false);

  /* waitlist state */
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState('');
  const [waitlistInfo, setWaitlistInfo] = useState('');

  /* form state — includes recurring fields */
  const [formData, setFormData] = useState({
    equipmentId:        '',
    quantity:           1,
    startTime:          initialDate ? `${initialDate}T09:00` : '',
    endTime:            initialDate ? `${initialDate}T10:00` : '',
    purpose:            '',
    isRecurring:        false,
    recurrencePattern:  '',
    recurrenceEndDate:  '',
  });

  const canViewAllBookings = user && [
    'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN', 'LAB_TECHNICIAN'
  ].includes(user.role);

  const isManagerOrAdmin = user && [
    'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN',
  ].includes(user.role);

  /* ── data fetching ─────────────────────────────────────────── */
  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = isResearcher ? '/bookings/my' : '/bookings';
      const res = await api.get(endpoint);
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(sorted);
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
    // Clear waitlist success when changing equipment
    if (name === 'equipmentId') {
      setWaitlistSuccess('');
      setWaitlistInfo('');
      setSubmitError('');
      setIsConflict(false);
    }
  };

  const resetForm = () => {
    setFormData({
      equipmentId: '', quantity: 1, startTime: '', endTime: '', purpose: '',
      isRecurring: false, recurrencePattern: '', recurrenceEndDate: '',
    });
    setSubmitError('');
    setIsConflict(false);
    setWaitlistSuccess('');
    setWaitlistInfo('');
  };

  /* ── join waitlist ─────────────────────────────────────────── */
  const handleJoinWaitlist = async () => {
    if (!formData.equipmentId) return;
    setJoiningWaitlist(true);
    setSubmitError('');
    setWaitlistSuccess('');
    setWaitlistInfo('');
    try {
      await api.post('/waitlist', {
        equipmentId: parseInt(formData.equipmentId),
        quantity: parseInt(formData.quantity) || 1,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose
      });
      setWaitlistSuccess('✅ You have been added to the waitlist! We will notify you when this equipment becomes available.');
      setSubmitError('');
      setIsConflict(false);
      setTimeout(() => {
        setIsAddOpen(false);
        resetForm();
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('already')) {
        setWaitlistInfo('You are already on the waitlist for this equipment.');
        setTimeout(() => {
          setIsAddOpen(false);
          resetForm();
        }, 2000);
      } else {
        setSubmitError('Failed to join waitlist. ' + (msg || 'Please try again.'));
      }
    } finally {
      setJoiningWaitlist(false);
    }
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
        quantity:          parseInt(formData.quantity) || 1,
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
      const msg = err.response?.data?.message || 'Error creating booking.';
      const msgLower = msg.toLowerCase();
      const isConflictErr = msgLower.includes('already booked') ||
                            msgLower.includes('conflict') ||
                            msgLower.includes('time slot') ||
                            msgLower.includes('not available') ||
                            msgLower.includes('insufficient');
      setIsConflict(isConflictErr);
      setSubmitError(msg);
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

  const handleReject = (bookingId) => {
    setRejectReason('');
    setRejectModal({ open: true, bookingId });
  };

  const submitReject = async () => {
    setRejectSubmitting(true);
    try {
      await api.put(`/bookings/${rejectModal.bookingId}/status`, null, {
        params: { status: 'REJECTED', ...(rejectReason ? { rejectionReason: rejectReason } : {}) }
      });
      setRejectModal({ open: false, bookingId: null });
      setRejectReason('');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject booking.');
    } finally {
      setRejectSubmitting(false);
    }
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

  /* ── visibility helpers ─────────────────────────────────────── */
  const showActionsColumn = true;

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
          
          {/* Tabs: 'My Bookings' strictly for Researchers, 'All Portal Bookings' for all other roles */}
          <div className="flex gap-4">
            {isResearcher ? (
              <span className="pb-2 px-1 text-sm font-semibold border-b-2 border-purple-500 text-purple-400">
                My Bookings
              </span>
            ) : (
              <span className="pb-2 px-1 text-sm font-semibold border-b-2 border-purple-500 text-purple-400">
                All Portal Bookings
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
               {canViewAllBookings && viewTab === 'all' && (
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
                    {showActionsColumn && (
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase text-right">Actions</th>
                    )}
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
                      <td className="px-6 py-4 text-sm text-gray-400" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
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
                      {showActionsColumn && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 flex-nowrap">

                            {/* Cancel — own pending/confirmed bookings, or managers cancelling confirmed */}
                            {( (item.userEmail === user?.email && ['PENDING_APPROVAL', 'CONFIRMED'].includes(item.status)) || 
                               (isManagerOrAdmin && item.status === 'CONFIRMED') ) && (
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
                      )}
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
                      {eq.name} — {eq.status.replace(/_/g, ' ')} (Qty: {eq.availableQuantity ?? eq.quantity})
                    </option>
                  ))}
                </select>

                {equipmentList.find(e => e.id == formData.equipmentId)?.status === 'UNDER_MAINTENANCE' && (
                  <div className="mt-3 p-3.5 rounded-xl text-sm border bg-amber-500/10 border-amber-500/30 text-amber-300 flex gap-3 items-start shadow-sm">
                    <svg className="w-5 h-5 mt-0.5 shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-amber-200">Equipment Under Maintenance</p>
                      <p className="text-xs mt-0.5 text-amber-300/90 leading-relaxed">
                        This equipment is currently undergoing maintenance and cannot be booked.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Quantity *</label>
                <input
                  required type="number" min="1"
                  disabled={!formData.equipmentId}
                  max={equipmentList.find(e => e.id == formData.equipmentId)?.availableQuantity ?? 1}
                  name="quantity" value={formData.equipmentId ? formData.quantity : ''}
                  onChange={handleInputChange}
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

            {submitError && (
              <div className={`mb-4 p-3 rounded-lg text-sm border flex gap-2 items-start
                ${isConflict
                  ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="w-full">
                  <p className="font-medium">{isConflict ? 'Time Slot Conflict' : 'Booking Error'}</p>
                  <p className="text-xs mt-0.5 opacity-90">{submitError}</p>
                  {isConflict && (
                    <div className="mt-3 space-y-3">
                      <p className="text-xs opacity-75">
                        Please choose a different time slot or check the{' '}
                        <Link to="/bookings/calendar" onClick={() => setIsAddOpen(false)}
                          className="underline hover:opacity-100">
                          availability calendar
                        </Link>.
                      </p>
                      <button
                        type="button"
                        onClick={handleJoinWaitlist}
                        disabled={joiningWaitlist || waitlistSuccess || !!waitlistInfo}
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
                        ) : waitlistInfo ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Already on Waitlist
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

            {waitlistSuccess && (
              <div className="mb-4 p-3 rounded-lg text-sm border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex gap-2 items-start">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p>{waitlistSuccess}</p>
              </div>
            )}

            {waitlistInfo && (
              <div className="mb-4 p-3 rounded-lg text-sm border bg-blue-500/10 border-blue-500/20 text-blue-400 flex gap-2 items-start">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{waitlistInfo}</p>
              </div>
            )}

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
                  {waitlistSuccess || waitlistInfo ? 'Close' : 'Cancel'}
                </button>
                {!waitlistSuccess && !waitlistInfo && (
                  <button
                    type="submit"
                    disabled={submitting || equipmentList.find(e => e.id == formData.equipmentId)?.status === 'UNDER_MAINTENANCE'}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-medium transition shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      'Book Equipment'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          REJECT MODAL
      ════════════════════════════════════════════════════════ */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#12131a] border border-red-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Reject Booking</h2>
                <p className="text-xs text-gray-400">Booking #{rejectModal.bookingId}</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm text-gray-400 mb-1.5">
                Reason for rejection <span className="text-gray-600">(optional)</span>
              </label>
              <textarea
                rows="3"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. Equipment unavailable due to maintenance, conflicting priority booking…"
                className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500/50 focus:outline-none text-white placeholder-gray-600 resize-none"
              />
              <p className="text-xs text-gray-600 mt-1">This reason will be visible to the requester.</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectModal({ open: false, bookingId: null })}
                disabled={rejectSubmitting}
                className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                disabled={rejectSubmitting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-medium transition flex items-center gap-2 disabled:opacity-60"
              >
                {rejectSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Bookings;

