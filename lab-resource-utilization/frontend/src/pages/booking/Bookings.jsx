import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const STATUS_STYLES = {
  PENDING_APPROVAL: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CONFIRMED:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  IN_USE:           'bg-blue-500/10 text-blue-400 border-blue-500/20',
  COMPLETED:        'bg-purple-500/10 text-purple-400 border-purple-500/20',
  CANCELLED:        'bg-red-500/10 text-red-400 border-red-500/20',
  REJECTED:         'bg-red-500/10 text-red-400 border-red-500/20',
  NO_SHOW:          'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const RECURRENCE_OPTIONS = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'];
const UNAVAILABLE = ['BOOKED', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED'];

const Bookings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const sp = new URLSearchParams(location.search);

  const [bookings,      setBookings]      = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [viewTab,       setViewTab]       = useState(sp.get('tab') || 'my');
  const [statusFilter,  setStatusFilter]  = useState(sp.get('status') || '');
  const [roleFilter,    setRoleFilter]    = useState('');

  // Add reservation modal
  const [isAddOpen,    setIsAddOpen]    = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState('');
  const [isConflict,   setIsConflict]   = useState(false);

  // Waitlist join state
  const [joiningWL,    setJoiningWL]    = useState(false);
  const [wlSuccess,    setWlSuccess]    = useState('');

  // Reject modal
  const [rejectModal,      setRejectModal]      = useState({ open: false, id: null });
  const [rejectReason,     setRejectReason]     = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    equipmentId: '', startTime: '', endTime: '', purpose: '',
    isRecurring: false, recurrencePattern: '', recurrenceEndDate: '',
  });

  const isManagerOrAdmin = user &&
    ['LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN','SYSTEM_ADMIN'].includes(user.role);

  const selectedEq      = equipmentList.find(e => e.id === parseInt(formData.equipmentId));
  const isSelectedUnavail = selectedEq && UNAVAILABLE.includes(selectedEq.status);

  const fetchBookings = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get((viewTab === 'all' && isManagerOrAdmin) ? '/bookings' : '/bookings/my');
      setBookings(res.data);
    } catch { setError('Failed to fetch bookings.'); }
    finally { setLoading(false); }
  };

  const fetchEquipment = async () => {
    try { const r = await api.get('/equipment'); setEquipmentList(r.data); }
    catch { console.error('Equipment load failed'); }
  };

  useEffect(() => { fetchBookings(); }, [viewTab]);
  useEffect(() => { fetchEquipment(); }, []);

  const resetForm = () => {
    setFormData({ equipmentId:'', startTime:'', endTime:'', purpose:'',
      isRecurring:false, recurrencePattern:'', recurrenceEndDate:'' });
    setSubmitError(''); setIsConflict(false); setWlSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'isRecurring' && !checked ? { recurrencePattern:'', recurrenceEndDate:'' } : {}),
    }));
  };

  const handleEquipmentChange = (e) => {
    setWlSuccess(''); setSubmitError(''); setIsConflict(false);
    handleInputChange(e);
  };

  /* ── Join Waitlist ── */
  const handleJoinWaitlist = async (eqId) => {
    setJoiningWL(true); setWlSuccess('');
    try {
      await api.post('/waitlist', { equipmentId: parseInt(eqId) });
      setWlSuccess('You joined the waitlist! We will notify you when this equipment becomes available.');
      setSubmitError(''); setIsConflict(false);
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('already')) {
        setWlSuccess('You are already on the waitlist for this equipment.');
      } else {
        setSubmitError('Failed to join waitlist. ' + (msg || 'Please try again.'));
      }
    } finally { setJoiningWL(false); }
  };

  /* ── Submit Booking ── */
  const handleAddSubmit = async (e) => {
    e.preventDefault(); setSubmitError(''); setSubmitting(true);
    try {
      const start = new Date(formData.startTime);
      const end   = new Date(formData.endTime);
      if (start < new Date()) { setSubmitError('Start time must be in the future.'); return; }
      if (end <= start)        { setSubmitError('End time must be after start time.'); return; }
      if (formData.isRecurring && !formData.recurrencePattern) {
        setSubmitError('Please choose a recurrence pattern.'); return;
      }
      await api.post('/bookings', {
        equipmentId:       parseInt(formData.equipmentId),
        startTime:         formData.startTime,
        endTime:           formData.endTime,
        purpose:           formData.purpose,
        isRecurring:       formData.isRecurring,
        recurrencePattern: formData.isRecurring ? formData.recurrencePattern : null,
        recurrenceEndDate: (formData.isRecurring && formData.recurrenceEndDate)
                           ? formData.recurrenceEndDate : null,
      });
      setIsAddOpen(false); resetForm(); fetchBookings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error creating booking.';
      const conflict = msg.toLowerCase().includes('already booked') ||
                       msg.toLowerCase().includes('conflict') ||
                       msg.toLowerCase().includes('time slot');
      setIsConflict(conflict); setSubmitError(msg);
    } finally { setSubmitting(false); }
  };

  /* ── Status Change ── */
  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, null, { params: { status } });
      fetchBookings();
    } catch (err) { alert(err.response?.data?.message || 'Failed to update status.'); }
  };

  const handleReject = (id) => { setRejectReason(''); setRejectModal({ open:true, id }); };

  const submitReject = async () => {
    setRejectSubmitting(true);
    try {
      await api.put(`/bookings/${rejectModal.id}/status`, null, {
        params: { status:'REJECTED', ...(rejectReason ? { rejectionReason: rejectReason } : {}) }
      });
      setRejectModal({ open:false, id:null }); setRejectReason(''); fetchBookings();
    } catch (err) { alert(err.response?.data?.message || 'Failed to reject.'); }
    finally { setRejectSubmitting(false); }
  };

  const displayed = bookings.filter(b => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (roleFilter   && b.userRole !== roleFilter)  return false;
    return true;
  });

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1; return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
            <p className="text-gray-400 mt-1">Reserve equipment and monitor time slots.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/bookings/calendar" className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition font-medium text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              Calendar
            </Link>
            <Link to="/bookings/history" className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition font-medium text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              History
            </Link>
            <Link to="/bookings/waitlist" className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition font-medium text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
              Waitlist
            </Link>
            <button onClick={() => { resetForm(); setIsAddOpen(true); }}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-500/20 font-medium text-sm">
              + Reserve Equipment
            </button>
          </div>
        </div>

        {/* Tabs + Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/[0.05] mb-6 pb-2 gap-4">
          <div className="flex gap-4">
            {isManagerOrAdmin ? (
              [['my','My Bookings'],['all','All Portal Bookings']].map(([tab,label]) => (
                <button key={tab} onClick={() => { setViewTab(tab); setStatusFilter(''); setRoleFilter(''); }}
                  className={`pb-2 px-1 text-sm font-semibold border-b-2 transition ${viewTab===tab ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
                  {label}
                </button>
              ))
            ) : (
              <span className="pb-2 px-1 text-sm font-semibold border-b-2 border-purple-500 text-purple-400">My Bookings</span>
            )}
          </div>
          {!loading && bookings.length > 0 && (
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Status:</span>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="bg-[#181922] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none">
                  <option value="">All ({bookings.length})</option>
                  {Object.entries(counts).map(([s,c]) => (
                    <option key={s} value={s}>{s.replace(/_/g,' ')} ({c})</option>
                  ))}
                </select>
              </div>
              {isManagerOrAdmin && viewTab==='all' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Role:</span>
                  <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                    className="bg-[#181922] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none">
                    <option value="">All Roles</option>
                    {[...new Set(bookings.map(b=>b.userRole).filter(Boolean))].map(r => (
                      <option key={r} value={r}>{r.replace(/_/g,' ')}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bookings Table */}
        <div className="bg-[#12131a] border border-white/[0.05] rounded-xl overflow-hidden shadow-xl">
          {loading ? <div className="p-12 text-center text-gray-400">Loading bookings…</div>
          : error   ? <div className="p-12 text-center text-red-400">{error}</div>
          : displayed.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {statusFilter ? `No bookings with status "${statusFilter.replace(/_/g,' ')}".`
               : 'No reservations found. Click "+ Reserve Equipment" to start.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#161720] border-b border-white/[0.05]">
                    {['Equipment','Reserved By','Start Time','End Time','Purpose','Status','Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                    ))}
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
                      <td className="px-6 py-4 text-sm text-gray-400">{new Date(item.startTime).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{new Date(item.endTime).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-400 max-w-[160px] truncate" title={item.purpose}>{item.purpose}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${STATUS_STYLES[item.status] || STATUS_STYLES.CANCELLED}`}>
                          {item.status.replace(/_/g,' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 flex-nowrap">
                          {((!isManagerOrAdmin && item.status==='PENDING_APPROVAL') || item.status==='CONFIRMED') && (
                            <button onClick={() => handleStatusChange(item.id,'CANCELLED')}
                              className="text-red-400 text-xs px-2.5 py-1.5 rounded bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition whitespace-nowrap">
                              Cancel
                            </button>
                          )}
                          {isManagerOrAdmin && item.status==='PENDING_APPROVAL' && (<>
                            <button onClick={() => handleStatusChange(item.id,'CONFIRMED')}
                              className="text-emerald-400 text-xs px-2.5 py-1.5 rounded bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition whitespace-nowrap">
                              Approve
                            </button>
                            <button onClick={() => handleReject(item.id)}
                              className="text-red-400 text-xs px-2.5 py-1.5 rounded bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition whitespace-nowrap">
                              Reject
                            </button>
                          </>)}
                          {item.status==='CONFIRMED' && (
                            <button onClick={() => handleStatusChange(item.id,'IN_USE')}
                              className="text-blue-400 text-xs px-2.5 py-1.5 rounded bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition">
                              Check In
                            </button>
                          )}
                          {item.status==='IN_USE' && (
                            <button onClick={() => handleStatusChange(item.id,'COMPLETED')}
                              className="text-purple-400 text-xs px-2.5 py-1.5 rounded bg-purple-500/5 border border-purple-500/10 hover:bg-purple-500/10 transition">
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

      {/* ══ ADD RESERVATION MODAL ══ */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#12131a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
            <h2 className="text-xl font-bold mb-4">New Reservation</h2>

            {/* Conflict / error banner */}
            {submitError && !wlSuccess && (
              <div className={`mb-4 p-3 rounded-lg text-sm border flex gap-2 items-start ${isConflict ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <div>
                  <p className="font-medium">{isConflict ? 'Time Slot Conflict' : 'Booking Error'}</p>
                  <p className="text-xs mt-0.5 opacity-90">{submitError}</p>
                  {isConflict && (
                    <>
                      <p className="text-xs mt-1 opacity-75">
                        This equipment is already booked for that time. Choose a different slot or{' '}
                        <Link to="/bookings/calendar" onClick={() => setIsAddOpen(false)} className="underline">check the calendar</Link>.
                      </p>
                      <button type="button" disabled={joiningWL}
                        onClick={() => handleJoinWaitlist(formData.equipmentId)}
                        className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition disabled:opacity-60 flex items-center gap-1.5">
                        {joiningWL ? <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"/> : '+ '}
                        Join Waitlist instead
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Equipment select */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Equipment *</label>
                <select required name="equipmentId" value={formData.equipmentId}
                  onChange={handleEquipmentChange}
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none">
                  <option value="">Select equipment…</option>
                  {equipmentList.map(eq => {
                    const unavail = UNAVAILABLE.includes(eq.status);
                    return (
                      <option key={eq.id} value={eq.id}>
                        {unavail ? '⚠ ' : '✓ '}{eq.name} — {eq.status.replace(/_/g,' ')} (Qty: {eq.quantity})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Waitlist prompt when equipment is unavailable */}
              {isSelectedUnavail && !wlSuccess && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <div className="flex-1">
                      <p className="text-amber-400 font-semibold text-sm">
                        {selectedEq?.name} is currently {selectedEq?.status.replace(/_/g,' ').toLowerCase()}
                      </p>
                      <p className="text-amber-300/70 text-xs mt-1">
                        You cannot book this right now. Join the waitlist — we'll notify you automatically when a slot opens up.
                      </p>
                      <button type="button" disabled={joiningWL}
                        onClick={() => handleJoinWaitlist(formData.equipmentId)}
                        className="mt-3 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition disabled:opacity-60 flex items-center gap-2">
                        {joiningWL
                          ? <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"/>
                          : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        }
                        Join Waitlist for {selectedEq?.name}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Waitlist success */}
              {wlSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div>
                    <p className="text-emerald-400 font-semibold text-sm">Added to Waitlist!</p>
                    <p className="text-emerald-300/70 text-xs mt-0.5">{wlSuccess}</p>
                    <button type="button"
                      onClick={() => { setIsAddOpen(false); resetForm(); navigate('/bookings/waitlist'); }}
                      className="mt-2 text-xs text-emerald-400 underline hover:text-emerald-300">
                      View my waitlist →
                    </button>
                  </div>
                </div>
              )}

              {/* Time / Purpose / Recurring — only when equipment is available */}
              {!isSelectedUnavail && !wlSuccess && (<>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Start Time *</label>
                    <input required type="datetime-local" name="startTime" value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"/>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">End Time *</label>
                    <input required type="datetime-local" name="endTime" value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Purpose *</label>
                  <textarea required rows="2" name="purpose" value={formData.purpose}
                    onChange={handleInputChange} placeholder="State the usage purpose…"
                    className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"/>
                </div>
                <div className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.01]">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className="relative">
                      <input type="checkbox" name="isRecurring" checked={formData.isRecurring}
                        onChange={handleInputChange} className="sr-only peer"/>
                      <div className="w-10 h-5 bg-white/10 rounded-full peer-checked:bg-purple-600 transition-colors"/>
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"/>
                    </div>
                    <span className="text-sm font-medium text-gray-300">Recurring Booking</span>
                  </label>
                  {formData.isRecurring && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Pattern *</label>
                        <select name="recurrencePattern" required value={formData.recurrencePattern}
                          onChange={handleInputChange}
                          className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none">
                          <option value="">Select…</option>
                          {RECURRENCE_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0)+o.slice(1).toLowerCase()}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
                        <input type="date" name="recurrenceEndDate" value={formData.recurrenceEndDate}
                          onChange={handleInputChange}
                          className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"/>
                      </div>
                    </div>
                  )}
                </div>
              </>)}

              {/* Submit row */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
                <button type="button" onClick={() => { setIsAddOpen(false); resetForm(); }}
                  className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-sm transition">
                  Close
                </button>
                {!isSelectedUnavail && !wlSuccess && (
                  <button type="submit" disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-medium transition shadow-lg shadow-purple-500/20 disabled:opacity-60 flex items-center gap-2">
                    {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : null}
                    {submitting ? 'Verifying…' : 'Book Equipment'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ REJECT MODAL ══ */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#12131a] border border-red-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Reject Booking</h2>
                <p className="text-xs text-gray-400">Booking #{rejectModal.id}</p>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm text-gray-400 mb-1.5">
                Reason <span className="text-gray-600">(optional)</span>
              </label>
              <textarea rows="3" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. Equipment under maintenance, conflicting priority booking…"
                className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-red-500/50 focus:outline-none resize-none"/>
              <p className="text-xs text-gray-600 mt-1">Visible to the requester.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRejectModal({ open:false, id:null })} disabled={rejectSubmitting}
                className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-sm transition">
                Cancel
              </button>
              <button onClick={submitReject} disabled={rejectSubmitting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-medium transition flex items-center gap-2 disabled:opacity-60">
                {rejectSubmitting
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                }
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
