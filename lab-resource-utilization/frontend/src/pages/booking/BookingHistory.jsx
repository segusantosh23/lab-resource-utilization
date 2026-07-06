import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const STATUS_STYLES = {
  PENDING_APPROVAL: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CONFIRMED:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  IN_USE:           'bg-blue-500/10 text-blue-400 border-blue-500/20',
  COMPLETED:        'bg-purple-500/10 text-purple-400 border-purple-500/20',
  CANCELLED:        'bg-red-500/10 text-red-400 border-red-500/20',
  REJECTED:         'bg-red-500/10 text-red-400 border-red-500/20',
};

const ALL_STATUSES = ['PENDING_APPROVAL','CONFIRMED','IN_USE','COMPLETED','CANCELLED','REJECTED'];

const BookingHistory = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bookings,       setBookings]       = useState([]);
  const [filtered,       setFiltered]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');

  // Filters
  const [searchTerm,     setSearchTerm]     = useState('');
  const [statusFilter,   setStatusFilter]   = useState('');
  const [fromDate,       setFromDate]       = useState('');
  const [toDate,         setToDate]         = useState('');
  const [sortOrder,      setSortOrder]      = useState('desc'); // 'asc' | 'desc'

  // Expanded row for full detail
  const [expandedId,     setExpandedId]     = useState(null);

  const isManagerOrAdmin = user && ['LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN'].includes(user.role);

  /* ── fetch ───────────────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const endpoint = isManagerOrAdmin ? '/bookings' : '/bookings/my';
        const res = await api.get(endpoint);
        // Sort descending by creation / startTime by default
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.startTime) - new Date(a.startTime)
        );
        setBookings(sorted);
      } catch {
        setError('Failed to load booking history.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── client-side filter + sort ───────────────────────────────── */
  useEffect(() => {
    let result = [...bookings];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        b =>
          b.equipmentName?.toLowerCase().includes(q) ||
          b.userName?.toLowerCase().includes(q) ||
          b.userEmail?.toLowerCase().includes(q) ||
          b.purpose?.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      result = result.filter(b => b.status === statusFilter);
    }

    if (fromDate) {
      result = result.filter(b => new Date(b.startTime) >= new Date(fromDate));
    }

    if (toDate) {
      // include the full end-of-day for the toDate
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(b => new Date(b.startTime) <= end);
    }

    result.sort((a, b) =>
      sortOrder === 'desc'
        ? new Date(b.startTime) - new Date(a.startTime)
        : new Date(a.startTime) - new Date(b.startTime)
    );

    setFiltered(result);
  }, [bookings, searchTerm, statusFilter, fromDate, toDate, sortOrder]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setFromDate('');
    setToDate('');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchTerm || statusFilter || fromDate || toDate || sortOrder !== 'desc';

  const fmt = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const duration = (start, end) => {
    const ms  = new Date(end) - new Date(start);
    const hrs = Math.floor(ms / 3_600_000);
    const min = Math.floor((ms % 3_600_000) / 60_000);
    return hrs > 0 ? `${hrs}h ${min}m` : `${min}m`;
  };

  /* ── stats banner ────────────────────────────────────────────── */
  const stats = ALL_STATUSES.map(s => ({
    label: s.replace(/_/g, ' '),
    count: bookings.filter(b => b.status === s).length,
    style: STATUS_STYLES[s],
  })).filter(s => s.count > 0);

  /* ── render ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Booking History</h1>
            <p className="text-gray-400 mt-1">Complete audit trail of all reservation activity.</p>
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

        {/* Stats banner */}
        {!loading && !error && stats.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {stats.map(s => (
              <button
                key={s.label}
                onClick={() => setStatusFilter(prev =>
                  prev === s.label.replace(/ /g, '_') ? '' : s.label.replace(/ /g, '_')
                )}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition
                  ${statusFilter === s.label.replace(/ /g, '_') ? 'ring-2 ring-white/20' : ''}
                  ${s.style}`}
              >
                {s.label} · {s.count}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-500 self-center">
              {filtered.length} of {bookings.length} records
            </span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#12131a] border border-white/[0.05] rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Search</label>
              <input
                type="text"
                placeholder="Equipment, user, purpose…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="">All</option>
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sort</label>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            {/* Date range */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-sm transition w-full"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* History table */}
        <div className="bg-[#12131a] border border-white/[0.05] rounded-xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading history…</div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No records match your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-[#161720] border-b border-white/[0.05]">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">#</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Equipment</th>
                    {isManagerOrAdmin && (
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Reserved By</th>
                    )}
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Start</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">End</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Duration</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Recurring</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filtered.map((b, idx) => (
                    <React.Fragment key={b.id}>
                      <tr className="hover:bg-white/[0.02] transition">
                        <td className="px-6 py-4 text-xs text-gray-600">{b.id}</td>
                        <td className="px-6 py-4 font-medium text-white">{b.equipmentName}</td>
                        {isManagerOrAdmin && (
                          <td className="px-6 py-4 text-sm text-gray-400">
                            <div>{b.userName}</div>
                            <div className="text-xs text-gray-600">{b.userEmail}</div>
                          </td>
                        )}
                        <td className="px-6 py-4 text-sm text-gray-400">{fmt(b.startTime)}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{fmt(b.endTime)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{duration(b.startTime, b.endTime)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full border whitespace-nowrap inline-block ${STATUS_STYLES[b.status] || STATUS_STYLES.CANCELLED}`}>
                            {b.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {b.isRecurring ? (
                            <span className="px-2 py-0.5 text-xs rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {b.recurrencePattern || 'Recurring'}
                            </span>
                          ) : (
                            <span className="text-gray-700">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setExpandedId(prev => prev === b.id ? null : b.id)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition text-gray-300"
                          >
                            {expandedId === b.id ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded audit detail row */}
                      {expandedId === b.id && (
                        <tr className="bg-[#0d0e12]/60">
                          <td colSpan={isManagerOrAdmin ? 9 : 8} className="px-8 py-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Booking Details</p>
                                <dl className="space-y-1.5">
                                  <div className="flex gap-2">
                                    <dt className="text-gray-500 w-24 shrink-0">ID</dt>
                                    <dd className="text-gray-300">#{b.id}</dd>
                                  </div>
                                  <div className="flex gap-2">
                                    <dt className="text-gray-500 w-24 shrink-0">Equipment</dt>
                                    <dd className="text-gray-300">{b.equipmentName}</dd>
                                  </div>
                                  <div className="flex gap-2">
                                    <dt className="text-gray-500 w-24 shrink-0">Purpose</dt>
                                    <dd className="text-gray-300">{b.purpose || '—'}</dd>
                                  </div>
                                </dl>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Time Slot</p>
                                <dl className="space-y-1.5">
                                  <div className="flex gap-2">
                                    <dt className="text-gray-500 w-24 shrink-0">Start</dt>
                                    <dd className="text-gray-300">{fmt(b.startTime)}</dd>
                                  </div>
                                  <div className="flex gap-2">
                                    <dt className="text-gray-500 w-24 shrink-0">End</dt>
                                    <dd className="text-gray-300">{fmt(b.endTime)}</dd>
                                  </div>
                                  <div className="flex gap-2">
                                    <dt className="text-gray-500 w-24 shrink-0">Duration</dt>
                                    <dd className="text-gray-300">{duration(b.startTime, b.endTime)}</dd>
                                  </div>
                                </dl>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Audit</p>
                                <dl className="space-y-1.5">
                                  <div className="flex gap-2">
                                    <dt className="text-gray-500 w-24 shrink-0">Status</dt>
                                    <dd>
                                      <span className={`px-2 py-0.5 text-xs rounded-full border whitespace-nowrap inline-block ${STATUS_STYLES[b.status] || STATUS_STYLES.CANCELLED}`}>
                                        {b.status.replace(/_/g, ' ')}
                                      </span>
                                    </dd>
                                  </div>
                                  {b.approvedBy && (
                                    <div className="flex gap-2">
                                      <dt className="text-gray-500 w-24 shrink-0">Approved By</dt>
                                      <dd className="text-gray-300">{b.approvedBy}</dd>
                                    </div>
                                  )}
                                  {b.rejectionReason && (
                                    <div className="flex gap-2">
                                      <dt className="text-gray-500 w-24 shrink-0">Reason</dt>
                                      <dd className="text-red-400">{b.rejectionReason}</dd>
                                    </div>
                                  )}
                                  {b.isRecurring && (
                                    <div className="flex gap-2">
                                      <dt className="text-gray-500 w-24 shrink-0">Recurrence</dt>
                                      <dd className="text-indigo-400">{b.recurrencePattern}</dd>
                                    </div>
                                  )}
                                  {b.createdAt && (
                                    <div className="flex gap-2">
                                      <dt className="text-gray-500 w-24 shrink-0">Created</dt>
                                      <dd className="text-gray-300">{fmt(b.createdAt)}</dd>
                                    </div>
                                  )}
                                </dl>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer count */}
        {!loading && !error && filtered.length > 0 && (
          <p className="text-xs text-gray-600 mt-4 text-right">
            Showing {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
