import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
const EquipmentList = () => {

  const { user } = useContext(AuthContext);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: '', category: '', description: '', manufacturer: '', modelNumber: '',
    serialNumber: '', purchaseDate: '', department: '', institution: '',
    quantity: 1, status: 'AVAILABLE'
  });

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const response = await api.get('/equipment');
      setEquipment(response.data);
    } catch (err) {
      setError('Failed to fetch equipment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/equipment', formData);
      setIsAddOpen(false);
      fetchEquipment();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding equipment');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {

      if (user.role === "LAB_TECHNICIAN") {

        await api.put(
            `/equipment/${selectedItem.id}/status?status=${formData.status}`
        );

      } else {

        await api.put(
            `/equipment/${selectedItem.id}`,
            formData
        );

      }

      setIsEditOpen(false);
      fetchEquipment();
      resetForm();

    } catch (err) {

      alert(err.response?.data?.message || "Error updating equipment");

    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/equipment/${selectedItem.id}`);
      setIsDeleteOpen(false);
      fetchEquipment();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting equipment');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', category: '', description: '', manufacturer: '', modelNumber: '',
      serialNumber: '', purchaseDate: '', department: '', institution: '',
      quantity: 1, status: 'AVAILABLE'
    });
    setSelectedItem(null);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name || '', category: item.category || '', description: item.description || '',
      manufacturer: item.manufacturer || '', modelNumber: item.modelNumber || '',
      serialNumber: item.serialNumber || '', purchaseDate: item.purchaseDate || '',
      department: item.department || '', institution: item.institution || '',
      quantity: item.quantity || 1, status: item.status || 'AVAILABLE'
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  // Filtering
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          (item.manufacturer && item.manufacturer.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesDept = departmentFilter ? item.department === departmentFilter : true;
    return matchesSearch && matchesStatus && matchesDept;
  });

  // Unique departments for filter dropdown
  const departments = [...new Set(equipment.map(item => item.department).filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipment Inventory</h1>
            <p className="text-gray-400 mt-1">Manage and track all laboratory resources.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">

            {user.role !== "LAB_TECHNICIAN" && (
                <button
                    onClick={() => {
                      resetForm();
                      setIsAddOpen(true);
                    }}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-500/20 font-medium text-sm w-full md:w-auto"
                >
                  + Add Equipment
                </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#12131a] border border-white/[0.05] rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input 
              type="text" placeholder="Search by name or manufacturer..." 
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div className="w-full md:w-48">
            <select 
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="BOOKED">Booked</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <select 
              value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Equipment List */}
        <div className="bg-[#12131a] border border-white/[0.05] rounded-xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading inventory...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">{error}</div>
          ) : filteredEquipment.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No equipment found matching criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-[#161720] border-b border-white/[0.05]">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Category</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Department / Inst.</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Manufacturer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Qty</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filteredEquipment.map(item => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition">
                      <td className="px-6 py-4 font-medium">
                        <Link to={`/equipment/${item.id}`} className="hover:text-purple-400 transition">{item.name}</Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{item.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {item.department || '-'} <span className="text-gray-600">/</span> {item.institution || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{item.manufacturer || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{item.quantity}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border 
                          ${item.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            item.status === 'UNDER_MAINTENANCE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                            'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <td className="px-6 py-4 text-right">

                          {user.role === "LAB_TECHNICIAN" ? (

                              <button
                                  onClick={() => openEditModal(item)}
                                  className="text-amber-400 hover:text-amber-300 text-sm"
                              >
                                Update Status
                              </button>

                          ) : (

                              <>
                                <button
                                    onClick={() => openEditModal(item)}
                                    className="text-purple-400 hover:text-purple-300 mx-2 text-sm"
                                >
                                  Edit
                                </button>

                                <button
                                    onClick={() => openDeleteModal(item)}
                                    className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Delete
                                </button>
                              </>

                          )}

                        </td>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}
      {/* Add / Edit Form Modal */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#12131a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-2xl shadow-2xl my-8">
            <h2 className="text-xl font-bold mb-6">{isEditOpen ? 'Edit Equipment' : 'Add New Equipment'}</h2>

            <form onSubmit={isEditOpen ? handleEditSubmit : handleAddSubmit} className="space-y-4">

              {user.role === "LAB_TECHNICIAN" && isEditOpen ? (

                  <div>

                    <label className="block text-sm text-gray-400 mb-1">
                      Equipment Status
                    </label>

                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="BOOKED">Booked</option>
                      <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                      <option value="OUT_OF_SERVICE">Out of Service</option>
                      <option value="RETIRED">Retired</option>
                    </select>

                  </div>

              ) : (

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Name *</label>
                      <input
                          required
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Category *</label>
                      <input
                          required
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Manufacturer</label>
                      <input
                          name="manufacturer"
                          value={formData.manufacturer}
                          onChange={handleInputChange}
                          className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Quantity *</label>
                      <input
                          required
                          type="number"
                          min="1"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Department</label>
                      <input
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Institution</label>
                      <input
                          name="institution"
                          value={formData.institution}
                          onChange={handleInputChange}
                          className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Status *</label>
                      <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="BOOKED">Booked</option>
                        <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                        <option value="OUT_OF_SERVICE">Out of Service</option>
                        <option value="RETIRED">Retired</option>
                      </select>
                    </div>

                  </div>

              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-white/[0.05] mt-6">

                <button
                    type="button"
                    onClick={() => {
                      setIsAddOpen(false);
                      setIsEditOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-sm transition"
                >
                  Cancel
                </button>

                <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-medium transition shadow-lg shadow-purple-500/20"
                >
                  {user.role === "LAB_TECHNICIAN"
                      ? "Update Status"
                      : "Save Equipment"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#12131a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Delete Equipment</h3>
            <p className="text-sm text-gray-400 mb-6">Are you sure you want to delete <span className="text-white font-medium">{selectedItem?.name}</span>? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-sm transition">Cancel</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-medium transition shadow-lg shadow-red-500/20">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EquipmentList;
