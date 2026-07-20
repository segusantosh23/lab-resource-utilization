import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

/*
  Waitlist API contract assumed (gracefully degrades if not yet wired):
    GET  /waitlist/my              → [{ id, equipmentId, equipmentName, position, joinedAt, status }]
    GET  /waitlist                 → [{ id, equipmentId, equipmentName, userId, userName, userEmail, position, joinedAt, status }]
    POST /waitlist                 body: { equipmentId }
    DELETE /waitlist/:id           leave waitlist
*/

const WaitlistManager = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [entries,       setEntries]       = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [joinEquipId,   setJoinEquipId]   = useState('');
  const [joining,       setJoining]       = useState(false);
  const [joinError,     setJoinError]     = useState('');
  const [joinSuccess,   setJoinSuccess]   = useState('');
  const [viewTab,       setViewTab]       = useState('my'); // 'my' | 'all'

  const isManagerOrAdmin = user && ['LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN'].includes(user.role);

  /* ── fetch ───────────────────────────────────────────────────── */
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = (viewTab === 'all' && isManagerOrAdmin) ? '/waitlist' : '/waitlist/my';
      const res = await api.get(endpoint);
      setEntries(res.data);
    } catch (err) {
      // Backend may not have waitlist endpoint yet — show empty state gracefully
      if (err.response?.status === 404) {
        setEntries([]);
      } else {
        setError('Failed to load waitlist data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [viewTab]);

  useEffect(() => {
    api.get('/equipment')
      .then(r => {
        // Only show BOOKED equipment, or equipment where all quantity is actively consumed
        setEquipmentList(r.data.filter(e => e.status !== 'AVAILABLE' || e.availableQuantity === 0));
      })
      .catch(() => {});
  }, []);

  /* ── join waitlist ───────────────────────────────────────────── */
  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinEquipId) return;
    setJoining(true);
    setJoinError('');
    setJoinSuccess('');
    try {
      await api.post('/waitlist', { equipmentId: parseInt(joinEquipId) });
      setJoinSuccess('You have been added to the waitlist.');
      setJoinEquipId('');
      load();
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Failed to join waitlist. You may already be on it.');
    } finally {
      setJoining(false);
    }
  };

  /* ── leave waitlist ──────────────────────────────────────────── */
  const handleLeave = async (entryId) => {
    if (!window.confirm('Remove yourself from this waitlist?')) return;
    try {
      await api.delete(`/waitlist/${entryId}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave waitlist.');
    }
  };

  const fmtDate = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  /* ── render ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Waitlist Manager</h1>
            <p className="text-gray-400 mt-1">
              Queue up for high-demand equipment and get notified when it's available.
            </p>
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

        {/* Join waitlist form */}
        <div className="bg-[#12131a] border border-white/[0.05] rounded-xl p-6 mb-6 shadow-xl">
          <h2 className="text-base font-semibold mb-4">Join a Waitlist</h2>

          {joinSuccess && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm">
              {joinSuccess}
            </div>
          )}
          {joinError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {joinError}
            </div>
          )}

          <form onSubmit={handleJoin} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">
                Select Equipment
              </label>
              <select
                required
                value={joinEquipId}
                onChange={e => { setJoinEquipId(e.target.value); setJoinSuccess(''); setJoinError(''); }}
                className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="">Choose equipment…</option>
                {equipmentList.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} — {eq.status.replace(/_/g, ' ')}
                    {eq.quantity != null ? ` (Total: ${eq.quantity})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={joining || !joinEquipId}
              className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-purple-500/20 font-medium text-sm shrink-0"
            >
              {joining ? 'Joining…' : 'Join Waitlist'}
            </button>
          </form>
        </div>

        {/* Tabs for managers */}
        {isManagerOrAdmin && (
          <div className="flex gap-4 border-b border-white/[0.05] mb-6">
            {['my', 'all'].map(tab => (
              <button
                key={tab}
                onClick={() => setViewTab(tab)}
                className={`pb-3 px-1 text-sm font-semibold border-b-2 transition
                  ${viewTab === tab
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-white'}`}
              >
                {tab === 'my' ? 'My Waitlist' : 'All Waitlists'}
              </button>
            ))}
          </div>
        )}

        {/* Waitlist table */}
        <div className="bg-[#12131a] border border-white/[0.05] rounded-xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading waitlist…</div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">{error}</div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">
                {viewTab === 'my' ? "You're not on any waitlists." : 'No active waitlists.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-[#161720] border-b border-white/[0.05]">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Position</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Equipment</th>
                    {isManagerOrAdmin && viewTab === 'all' && (
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">User</th>
                    )}
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Joined At</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {entries.map((entry, idx) => (
                    <tr key={entry.id} className="hover:bg-white/[0.02] transition">
                      {/* Position badge */}
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${entry.position === 1
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : entry.position === 2
                            ? 'bg-gray-400/10 text-gray-300 border border-gray-500/20'
                            : entry.position === 3
                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            : 'bg-white/[0.04] text-gray-400 border border-white/[0.08]'}`}>
                          {entry.position ?? idx + 1}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-white">{entry.equipmentName}</td>

                      {isManagerOrAdmin && viewTab === 'all' && (
                        <td className="px-6 py-4 text-sm text-gray-400">
                          <div>{entry.userName}</div>
                          <div className="text-xs text-gray-600">{entry.userEmail}</div>
                        </td>
                      )}

                      <td className="px-6 py-4 text-sm text-gray-400">
                        {entry.joinedAt ? fmtDate(entry.joinedAt) : '—'}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border
                          ${entry.status === 'NOTIFIED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : entry.status === 'EXPIRED'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          {(entry.status || 'WAITING').replace(/_/g,' ')}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {/* Only the owner (or admin) can remove */}
                        {(viewTab === 'my' || isManagerOrAdmin) && entry.status !== 'EXPIRED' && (
                          <button
                            onClick={() => handleLeave(entry.id)}
                            className="text-red-400 hover:text-red-300 text-xs px-3 py-1.5 rounded bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition"
                          >
                            Leave
                          </button>
                        )}
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
            You'll be automatically moved to position #1 as others book or leave.
          </p>
        </div>

      </div>
    </div>
  );
};

export default WaitlistManager;
