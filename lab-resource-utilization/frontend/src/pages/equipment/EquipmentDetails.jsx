import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const UNAVAILABLE_STATUSES = ['BOOKED', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED'];

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [equipment, setEquipment]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // Waitlist state
  const [waitlistEntry, setWaitlistEntry]   = useState(null);  // existing entry if already joined
  const [joining, setJoining]               = useState(false);
  const [waitlistMsg, setWaitlistMsg]       = useState('');
  const [waitlistErr, setWaitlistErr]       = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/equipment/${id}`);
        setEquipment(response.data);
      } catch {
        setError('Failed to load equipment details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  // Check if user is already on waitlist for this equipment
  useEffect(() => {
    const checkWaitlist = async () => {
      try {
        const res = await api.get('/waitlist/my');
        const found = res.data.find(e => String(e.equipmentId) === String(id));
        if (found) setWaitlistEntry(found);
      } catch {
        // silently ignore — not critical
      }
    };
    if (id) checkWaitlist();
  }, [id]);

  const handleJoinWaitlist = () => {
    navigate(`/bookings?add=true&equipmentId=${id}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0d0e12] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
    </div>
  );

  if (error || !equipment) return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-12 text-center">
      <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
      <p>{error || 'Equipment not found'}</p>
      <button onClick={() => navigate('/equipment')} className="mt-6 px-4 py-2 bg-white/[0.05] rounded-lg">Back to Inventory</button>
    </div>
  );

  const isUnavailable = UNAVAILABLE_STATUSES.includes(equipment.status);
  // Only researchers can join waitlist
  const canJoinWaitlist = isUnavailable && user?.role === 'RESEARCHER';

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans relative">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{equipment.name}</h1>
            <p className="text-gray-400 mt-1">ID: #{equipment.id} &bull; Added to inventory</p>
          </div>
        </div>

        {/* Waitlist Banner — shown when equipment is unavailable */}
        {canJoinWaitlist && (
          <div className={`mb-6 rounded-xl border p-4 flex flex-col md:flex-row md:items-center gap-4
            ${waitlistEntry || waitlistMsg
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-amber-500/10 border-amber-500/20'}`}>
            <div className="flex items-start gap-3 flex-1">
              {waitlistEntry || waitlistMsg ? (
                <svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div>
                {waitlistEntry && !waitlistMsg ? (
                  <>
                    <p className="text-sm font-semibold text-emerald-400">You're on the Waitlist</p>
                    <p className="text-xs text-emerald-400/80 mt-0.5">
                      Queue position: <span className="font-bold">#{waitlistEntry.position}</span>
                      {' '}· Status: <span className="font-medium capitalize">{waitlistEntry.status?.toLowerCase()}</span>
                    </p>
                  </>
                ) : waitlistMsg ? (
                  <p className="text-sm text-emerald-400">{waitlistMsg}</p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-amber-400">Equipment Currently Unavailable</p>
                    <p className="text-xs text-amber-400/80 mt-0.5">
                      This equipment is <span className="capitalize">{equipment.status.replace(/_/g, ' ').toLowerCase()}</span>.
                      {' '}Join the waitlist to be notified when it becomes available.
                    </p>
                  </>
                )}
                {waitlistErr && (
                  <p className="text-xs text-red-400 mt-1">{waitlistErr}</p>
                )}
              </div>
            </div>

            {/* Join button — redirects to booking form now */}
            {!waitlistEntry && !waitlistMsg && (
              <button
                id="join-waitlist-btn"
                onClick={handleJoinWaitlist}
                className="shrink-0 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 transition font-medium text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Go to Booking Form to Waitlist
              </button>
            )}

            {/* View my waitlist link once joined */}
            {(waitlistEntry || waitlistMsg) && !waitlistErr && (
              <button
                onClick={() => navigate('/bookings/waitlist')}
                className="shrink-0 px-4 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium transition"
              >
                View My Waitlist →
              </button>
            )}
          </div>
        )}

        {/* Info Grid */}
        <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl shadow-xl overflow-hidden">

          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">

            {/* Primary Details */}
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                <span className={`px-3 py-1 text-sm font-medium rounded-full border inline-block
                    ${equipment.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      equipment.status === 'UNDER_MAINTENANCE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      equipment.status === 'BOOKED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                    {equipment.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Category</p>
                <p className="text-lg font-medium">{equipment.category}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Quantity</p>
                <p className="text-lg font-medium">
                  {equipment.availableQuantity != null ? (
                    <>
                      <span className={equipment.availableQuantity === 0 ? 'text-red-400' : 'text-emerald-400'}>
                        {equipment.availableQuantity}
                      </span>
                      <span className="text-gray-500 text-base"> available of {equipment.quantity} total</span>
                    </>
                  ) : (
                    <>{equipment.quantity} units</>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                <p className="text-base text-gray-300 leading-relaxed">{equipment.description || 'No description provided.'}</p>
              </div>
            </div>

            {/* Secondary Details */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 space-y-5">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Location &amp; Specifications</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Department</p>
                  <p className="text-sm">{equipment.department || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Institution</p>
                  <p className="text-sm">{equipment.institution || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Manufacturer</p>
                  <p className="text-sm">{equipment.manufacturer || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Model Number</p>
                  <p className="text-sm">{equipment.modelNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Serial Number</p>
                  <p className="text-sm">{equipment.serialNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Purchase Date</p>
                  <p className="text-sm">{equipment.purchaseDate || '-'}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Action Bar */}
          <div className="bg-[#161720] border-t border-white/[0.05] p-6 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-gray-500">
              {isUnavailable
                ? 'This equipment is currently not available for booking.'
                : 'To edit this item, return to the inventory list.'}
            </p>
            <div className="flex items-center gap-3">
              {/* Always offer reserve button since waitlisting requires it too, or only if available */}
              {equipment.status !== 'RETIRED' && equipment.status !== 'OUT_OF_SERVICE' && (
                <button
                  onClick={() => navigate(`/bookings?add=true&equipmentId=${equipment.id}`)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-500/20 font-medium text-sm"
                >
                  {equipment.status === 'AVAILABLE' ? '+ Reserve Equipment' : '+ Reserve or Waitlist'}
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] transition font-medium text-sm border border-white/[0.08]"
              >
                ← Back
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EquipmentDetails;
