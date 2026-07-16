import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const WaitlistBookings = () => {
  const navigate = useNavigate();
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [leaving, setLeaving]   = useState(null); // id of entry being removed

  const fetchWaitlist = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/waitlist/my');
      setEntries(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setEntries([]);
      } else {
        setError('Failed to load waitlist data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWaitlist(); }, []);

  const handleLeave = async (entryId) => {
    if (!window.confirm('Remove yourself from this waitlist?')) return;
    setLeaving(entryId);
    try {
      await api.delete(`/waitlist/${entryId}`);
      setEntries(prev => prev.filter(e => e.id !== entryId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave waitlist.');
    } finally {
      setLeaving(null);
    }
  };

  const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }) : '—';

  const filtered = entries.filter(e =>
    e.equipmentName?.toLowerCase().includes(search.toLowerCase())
  );

  const waitingCount  = entries.filter(e => e.status === 'WAITING').length;
  const notifiedCount = entries.filter(e => e.status === 'NOTIFIED').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0e12] flex justify-center items-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your waitlist…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white px-6 md:px-8 py-8 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Waitlist</h1>
            <p className="text-gray-400 mt-1">
              Equipment queues you've joined — you'll be notified in position order.
            </p>
          </div>
          <button
            onClick={() => navigate('/bookings/waitlist')}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition text-sm font-medium shadow-lg shadow-purple-500/20"
          >
            + Join a Waitlist
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#12131a] border border-white/[0.05] rounded-xl p-5">
            <p className="text-gray-400 text-sm">Total Queued</p>
            <h2 className="text-3xl font-bold mt-2">{entries.length}</h2>
          </div>
          <div className="bg-[#12131a] border border-white/[0.05] rounded-xl p-5">
            <p className="text-gray-400 text-sm">Waiting</p>
            <h2 className="text-3xl font-bold mt-2 text-amber-400">{waitingCount}</h2>
          </div>
          <div className="bg-[#12131a] border border-white/[0.05] rounded-xl p-5">
            <p className="text-gray-400 text-sm">Notified (Ready)</p>
            <h2 className="text-3xl font-bold mt-2 text-emerald-400">{notifiedCount}</h2>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            id="waitlist-search"
            type="text"
            placeholder="Search by equipment name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#12131a] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Notified alert — equipment ready */}
        {notifiedCount > 0 && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-emerald-400">Equipment is Ready!</p>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                {notifiedCount} item{notifiedCount > 1 ? 's are' : ' is'} available for you. Head to Bookings to reserve now.
              </p>
            </div>
            <button
              onClick={() => navigate('/bookings?add=true')}
              className="ml-auto shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium transition"
            >
              Book Now
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-[#12131a] border border-white/[0.05] rounded-xl overflow-hidden shadow-xl">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">
                {search ? 'No matches found' : "You're not on any waitlists"}
              </h2>
              <p className="text-gray-400 text-sm mt-1 mb-6">
                {search
                  ? `No waitlist entries match "${search}".`
                  : "When all test tubes or equipment are fully booked, you can join the waitlist to be notified when they're available."}
              </p>
              {!search && (
                <button
                  onClick={() => navigate('/equipment')}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 transition text-sm font-medium shadow-lg shadow-purple-500/20"
                >
                  Browse Equipment
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-[#161720] border-b border-white/[0.05]">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Position</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Equipment</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Joined At</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filtered.map((entry) => (
                    <tr key={entry.id} className={`hover:bg-white/[0.02] transition ${entry.status === 'NOTIFIED' ? 'bg-emerald-500/[0.03]' : ''}`}>

                      {/* Position badge */}
                      <td className="px-6 py-4">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border
                          ${entry.status === 'NOTIFIED'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : entry.position === 1
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : entry.position === 2
                            ? 'bg-gray-400/10 text-gray-300 border-gray-500/20'
                            : entry.position === 3
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            : 'bg-white/[0.04] text-gray-400 border-white/[0.08]'}`}>
                          #{entry.position ?? '—'}
                        </div>
                      </td>

                      {/* Equipment name */}
                      <td className="px-6 py-4 font-medium text-white">
                        {entry.equipmentName}
                      </td>

                      {/* Joined date */}
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {fmtDate(entry.joinedAt)}
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border
                          ${entry.status === 'NOTIFIED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : entry.status === 'EXPIRED'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          {(entry.status || 'WAITING').replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {entry.status === 'NOTIFIED' && (
                            <button
                              onClick={() => navigate('/bookings?add=true')}
                              className="text-emerald-400 hover:text-emerald-300 text-xs px-3 py-1.5 rounded bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition font-medium"
                            >
                              Book Now
                            </button>
                          )}
                          {entry.status !== 'EXPIRED' && (
                            <button
                              id={`leave-waitlist-${entry.id}`}
                              onClick={() => handleLeave(entry.id)}
                              disabled={leaving === entry.id}
                              className="text-red-400 hover:text-red-300 text-xs px-3 py-1.5 rounded bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition disabled:opacity-50"
                            >
                              {leaving === entry.id ? 'Leaving…' : 'Leave'}
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

        {/* Info note */}
        <div className="mt-6 p-4 bg-[#12131a] border border-white/[0.05] rounded-xl flex gap-3 text-sm text-gray-400">
          <svg className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>
            When equipment becomes available, waitlisted users are notified in queue order.
            Your position moves up automatically as others book or leave.
          </p>
        </div>

      </div>
    </div>
  );
};

export default WaitlistBookings;