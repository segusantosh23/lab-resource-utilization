import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const Bookings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewTab, setViewTab] = useState('my'); // 'my' or 'all'
  
  // Form state
  const [formData, setFormData] = useState({
    equipmentId: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check if user is manager or admin
  const isManagerOrAdmin = user && [
    'LAB_MANAGER',
    'INSTITUTION_ADMIN',
    'SYSTEM_ADMIN'
  ].includes(user.role);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (viewTab === 'all' && isManagerOrAdmin) {
        response = await api.get('/bookings');
      } else {
        response = await api.get('/bookings/my');
      }
      setBookings(response.data);
    } catch (err) {
      setError('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment');
      // Filter list to only show AVAILABLE equipment in the dropdown for convenience
      setEquipmentList(response.data.filter(eq => eq.status === 'AVAILABLE'));
    } catch (err) {
      console.error('Failed to load equipment list', err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [viewTab]);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      // Validate future dates
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
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

      await api.post('/bookings', {
        equipmentId: parseInt(formData.equipmentId),
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose
      });
      setIsAddOpen(false);
      fetchBookings();
      setFormData({ equipmentId: '', startTime: '', endTime: '', purpose: '' });
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Error creating booking. Please check for time conflicts.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, null, {
        params: { status: newStatus }
      });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
            <p className="text-gray-400 mt-1">Reserve equipment and monitor time slots.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] transition font-medium text-sm">
              Back
            </button>
            <button onClick={() => setIsAddOpen(true)} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-500/20 font-medium text-sm w-full md:w-auto">
              + Reserve Equipment
            </button>
          </div>
        </div>

        {/* Tabs for Admin/Manager */}
        {isManagerOrAdmin && (
          <div className="flex gap-4 border-b border-white/[0.05] mb-6">
            <button 
              onClick={() => setViewTab('my')} 
              className={`pb-3 px-1 text-sm font-semibold border-b-2 transition ${viewTab === 'my' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              My Bookings
            </button>
            <button 
              onClick={() => setViewTab('all')} 
              className={`pb-3 px-1 text-sm font-semibold border-b-2 transition ${viewTab === 'all' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              All Portal Bookings
            </button>
          </div>
        )}

        {/* Bookings List */}
        <div className="bg-[#12131a] border border-white/[0.05] rounded-xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading bookings...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No reservations found. Click "Reserve Equipment" to start.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-[#161720] border-b border-white/[0.05]">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Equipment</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Reserved By</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Start Time</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">End Time</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Purpose</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {bookings.map(item => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition">
                      <td className="px-6 py-4 font-medium text-white">{item.equipmentName}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        <div>{item.userName}</div>
                        <div className="text-xs text-gray-600">{item.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{new Date(item.startTime).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{new Date(item.endTime).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-400 max-w-[200px] truncate" title={item.purpose}>
                        {item.purpose}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border 
                          ${item.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            item.status === 'PENDING_APPROVAL' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                            item.status === 'IN_USE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            item.status === 'COMPLETED' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                            'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {/* Cancel option for Pending/Confirmed items */}
                        {(item.status === 'PENDING_APPROVAL' || item.status === 'CONFIRMED') && (
                          <button 
                            onClick={() => handleStatusChange(item.id, 'CANCELLED')} 
                            className="text-red-400 hover:text-red-300 text-xs px-2.5 py-1.5 rounded bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition"
                          >
                            Cancel
                          </button>
                        )}
                        {/* Approval actions for Lab Managers/Admins */}
                        {isManagerOrAdmin && item.status === 'PENDING_APPROVAL' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(item.id, 'CONFIRMED')} 
                              className="text-emerald-400 hover:text-emerald-300 text-xs px-2.5 py-1.5 rounded bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleStatusChange(item.id, 'REJECTED')} 
                              className="text-red-400 hover:text-red-300 text-xs px-2.5 py-1.5 rounded bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {/* Check-In / Complete Flow */}
                        {item.status === 'CONFIRMED' && (
                          <button 
                            onClick={() => handleStatusChange(item.id, 'IN_USE')} 
                            className="text-blue-400 hover:text-blue-300 text-xs px-2.5 py-1.5 rounded bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition"
                          >
                            Check In
                          </button>
                        )}
                        {item.status === 'IN_USE' && (
                          <button 
                            onClick={() => handleStatusChange(item.id, 'COMPLETED')} 
                            className="text-purple-400 hover:text-purple-300 text-xs px-2.5 py-1.5 rounded bg-purple-500/5 border border-purple-500/10 hover:bg-purple-500/10 transition"
                          >
                            Complete
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
      </div>

      {/* --- ADD RESERVATION MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#12131a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl my-8">
            <h2 className="text-xl font-bold mb-4">New Reservation</h2>

            {submitError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                {submitError}
              </div>
            )}
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Equipment *</label>
                <select 
                  required 
                  name="equipmentId" 
                  value={formData.equipmentId} 
                  onChange={handleInputChange} 
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select an Equipment</option>
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} (Qty: {eq.quantity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Start Time *</label>
                <input 
                  required 
                  type="datetime-local" 
                  name="startTime" 
                  value={formData.startTime} 
                  onChange={handleInputChange} 
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 text-white" 
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">End Time *</label>
                <input 
                  required 
                  type="datetime-local" 
                  name="endTime" 
                  value={formData.endTime} 
                  onChange={handleInputChange} 
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 text-white" 
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Purpose *</label>
                <textarea 
                  required 
                  name="purpose" 
                  rows="3" 
                  value={formData.purpose} 
                  onChange={handleInputChange} 
                  placeholder="State the usage purpose..."
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05] mt-6">
                <button 
                  type="button" 
                  onClick={() => { setIsAddOpen(false); setSubmitError(''); }} 
                  className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-sm transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-medium transition shadow-lg shadow-purple-500/20 flex items-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? 'Verifying...' : 'Book Equipment'}
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
