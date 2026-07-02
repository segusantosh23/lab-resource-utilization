import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState('Available');
  const [selectedId, setSelectedId] = useState(null);

  const navigate = useNavigate();

  // Roles permissions mapping
  const hasFullCrud = ['LAB_MANAGER', 'SYSTEM_ADMINISTRATOR'].includes(user?.role);
  const hasStatusUpdateOnly = ['LAB_TECHNICIAN'].includes(user?.role);
  const hasReadOnly = !hasFullCrud && !hasStatusUpdateOnly;

  // Fetch Equipment
  const fetchEquipment = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/equipment');
      setEquipmentList(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch equipment. Please make sure the backend is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Add Equipment Action
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/equipment', { name, quantity, status });
      if (response.data) {
        setSuccess('Equipment added successfully!');
        setAddModalOpen(false);
        // Reset Form
        setName('');
        setQuantity(1);
        setStatus('Available');
        fetchEquipment();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add equipment.');
    }
  };

  // Edit Equipment Action
  const handleEditOpen = (item) => {
    setSelectedId(item.id);
    setName(item.name);
    setQuantity(item.quantity);
    setStatus(item.status);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await api.put(`/equipment/${selectedId}`, { name, quantity, status });
      if (response.data) {
        setSuccess('Equipment updated successfully!');
        setEditModalOpen(false);
        fetchEquipment();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update equipment.');
    }
  };

  // Delete Action
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/equipment/${id}`);
      setSuccess('Equipment deleted successfully!');
      fetchEquipment();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete equipment.');
    }
  };

  // Status Change (for Lab Technician)
  const handleStatusChange = async (id, newStatus) => {
    setError('');
    setSuccess('');
    try {
      const response = await api.put(`/equipment/${id}/status?status=${newStatus}`);
      if (response.data) {
        setSuccess('Status updated successfully!');
        fetchEquipment();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Filter Equipment list
  const filteredEquipment = equipmentList.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (statusName) => {
    const s = statusName.toLowerCase();
    if (s === 'available' || s === 'active') {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    } else if (s === 'maintenance') {
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    } else {
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white font-sans pb-16">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>

      {/* Dashboard Nav */}
      <nav className="bg-[#12131a] border-b border-white/[0.05] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="font-bold tracking-tight text-white">Lab Utilization Panel</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-200">{user?.name}</p>
              <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-gray-400 text-sm font-medium transition duration-200 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Dashboard Header & Search */}
        <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Equipment Inventory</h1>
            <p className="text-sm text-gray-400">
              {hasFullCrud && 'Manage lab equipment specifications, quantity, and status.'}
              {hasStatusUpdateOnly && 'View lab inventory and update equipment statuses.'}
              {hasReadOnly && 'View available equipment and coordinate with technicians.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#181922] border border-white/[0.08] text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-64"
              />
            </div>

            {hasFullCrud && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-semibold transition duration-200 cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Equipment
              </button>
            )}
          </div>
        </div>

        {/* Equipment Table */}
        <div className="bg-[#12131a] border border-white/[0.05] rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent mb-4"></div>
              <p className="text-gray-400 text-sm">Loading inventory data...</p>
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-base font-semibold">No equipment found</p>
              <p className="text-sm text-gray-600 mt-1">Try refining your search query or adding a new record.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.05] bg-[#161720]">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Equipment Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filteredEquipment.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.01] transition duration-150">
                      <td className="px-6 py-4.5 text-sm text-gray-400">#{item.id}</td>
                      <td className="px-6 py-4.5 text-sm font-semibold text-white">{item.name}</td>
                      <td className="px-6 py-4.5 text-sm text-gray-300">{item.quantity} units</td>
                      <td className="px-6 py-4.5 text-sm">
                        {hasStatusUpdateOnly ? (
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className="bg-[#181922] border border-white/[0.08] text-white text-xs rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                          >
                            <option value="Available">Available</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Out of Service">Out of Service</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-sm text-right">
                        {hasFullCrud && (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleEditOpen(item)}
                              className="p-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition cursor-pointer"
                              title="Edit Equipment"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                              title="Delete Equipment"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                        {hasStatusUpdateOnly && (
                          <span className="text-xs text-gray-500">Technician Control</span>
                        )}
                        {hasReadOnly && (
                          <span className="text-xs text-gray-500">View Only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-[#12131a] border border-white/[0.08] rounded-2xl p-6 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Add Lab Equipment</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Equipment Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mass Spectrometer Model B"
                  className="w-full bg-[#181922] border border-white/[0.08] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full bg-[#181922] border border-white/[0.08] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#181922] border border-white/[0.08] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="Available">Available</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/[0.03] transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-semibold transition duration-200 cursor-pointer"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-[#12131a] border border-white/[0.08] rounded-2xl p-6 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Edit Equipment Specification</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Equipment Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#181922] border border-white/[0.08] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full bg-[#181922] border border-white/[0.08] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#181922] border border-white/[0.08] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="Available">Available</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/[0.03] transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-semibold transition duration-200 cursor-pointer"
                >
                  Update Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
