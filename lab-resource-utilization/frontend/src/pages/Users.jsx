import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Users = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRoleModal, setEditRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [saving, setSaving] = useState(false);

  // Mock initial dataset if backend doesn't have a bulk /users endpoint
  const mockUsers = [
    { id: 1, name: 'Santosh Kumar', email: 'santosh@gmail.com', universityId: 'UNI-2026-001', role: 'RESEARCHER', department: 'Computer Science', institution: 'Main University' },
    { id: 2, name: 'Lab Manager User', email: 'lab_manager@gmail.com', universityId: 'UNI-2026-002', role: 'LAB_MANAGER', department: 'Biotechnology', institution: 'Main University' },
    { id: 3, name: 'Department Head', email: 'dept_head@gmail.com', universityId: 'UNI-2026-003', role: 'DEPARTMENT_HEAD', department: 'Physics', institution: 'Main University' },
    { id: 4, name: 'Lab Tech User', email: 'tech@gmail.com', universityId: 'UNI-2026-004', role: 'LAB_TECHNICIAN', department: 'Chemistry', institution: 'Main University' },
    { id: 5, name: 'System Admin', email: 'admin@gmail.com', universityId: 'UNI-2026-005', role: 'SYSTEM_ADMIN', department: 'IT Services', institution: 'Main University' },
    { id: 6, name: 'Institution Admin', email: 'inst_admin@gmail.com', universityId: 'UNI-2026-006', role: 'INSTITUTION_ADMIN', department: 'Administration', institution: 'Main University' },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users').catch(() => null);
        if (response && response.data) {
          setUsers(response.data);
        } else {
          setUsers(mockUsers);
        }
      } catch (err) {
        console.error("Failed to load users:", err);
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Scoped users list based on role permissions
  const scopedUsers = users.filter(u => {
    if (user?.role === 'INSTITUTION_ADMIN') {
      // Filter by institution if available
      if (user.institution && u.institution && u.institution !== user.institution && u.role !== 'SYSTEM_ADMIN') {
        return false;
      }
    }
    return true;
  });

  const filteredUsers = scopedUsers.filter(u => {
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.universityId && u.universityId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const styles = {
      RESEARCHER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      LAB_TECHNICIAN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      LAB_MANAGER: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      DEPARTMENT_HEAD: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      INSTITUTION_ADMIN: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      SYSTEM_ADMIN: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };
    return styles[role] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  const handleEditRole = (u) => {
    setSelectedUser(u);
    setNewRole(u.role);
    setEditRoleModal(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await api.put(`/users/${selectedUser.id}/role`, { role: newRole }).catch(() => null);
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setEditRoleModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans relative">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-gray-400 mt-1">View, search, and manage roles for registered system users.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#12131a] border border-white/[0.08] rounded-xl p-5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Users</span>
            <p className="text-3xl font-bold text-white mt-1">{scopedUsers.length}</p>
          </div>
          <div className="bg-[#12131a] border border-white/[0.08] rounded-xl p-5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Researchers</span>
            <p className="text-3xl font-bold text-emerald-400 mt-1">{scopedUsers.filter(u => u.role === 'RESEARCHER').length}</p>
          </div>
          <div className="bg-[#12131a] border border-white/[0.08] rounded-xl p-5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lab Managers & Heads</span>
            <p className="text-3xl font-bold text-purple-400 mt-1">{scopedUsers.filter(u => u.role === 'LAB_MANAGER' || u.role === 'LAB_TECHNICIAN' || u.role === 'DEPARTMENT_HEAD').length}</p>
          </div>
          <div className="bg-[#12131a] border border-white/[0.08] rounded-xl p-5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Administrators</span>
            <p className="text-3xl font-bold text-cyan-400 mt-1">{scopedUsers.filter(u => u.role === 'SYSTEM_ADMIN' || u.role === 'INSTITUTION_ADMIN').length}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <svg className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search users by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#12131a] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-[#12131a] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-purple-500 transition cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="RESEARCHER">Researcher</option>
            <option value="LAB_TECHNICIAN">Lab Technician</option>
            <option value="LAB_MANAGER">Lab Manager</option>
            <option value="DEPARTMENT_HEAD">Department Head</option>
            <option value="INSTITUTION_ADMIN">Institution Admin</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
          </select>
        </div>

        {/* User Table */}
        <div className="bg-[#12131a] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-16 text-center text-gray-400">Loading user records...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-white/[0.03] border-b border-white/[0.08] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">University ID</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Department / Inst.</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No matching users found.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-gray-300">
                          {u.universityId || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full border ${getRoleBadge(u.role)}`}>
                            {u.role ? u.role.replace(/_/g, ' ') : 'USER'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400">
                          <div>{u.department || 'General'}</div>
                          <div className="text-[10px] text-gray-500">{u.institution || 'Main'}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleEditRole(u)}
                            className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition text-xs font-medium"
                          >
                            Edit Role
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Role Modal */}
        {editRoleModal && selectedUser && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1c23] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fadeIn">
              <h3 className="text-xl font-bold text-white mb-2">Manage User Role</h3>
              <p className="text-sm text-gray-400 mb-6">Updating role for <span className="text-purple-400 font-semibold">{selectedUser.name}</span> ({selectedUser.email})</p>
              
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Select New Role</label>
              <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-3 bg-[#12131a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 mb-6"
              >
                <option value="RESEARCHER">RESEARCHER</option>
                <option value="LAB_TECHNICIAN">LAB TECHNICIAN</option>
                <option value="LAB_MANAGER">LAB MANAGER</option>
                <option value="DEPARTMENT_HEAD">DEPARTMENT HEAD</option>
                <option value="INSTITUTION_ADMIN">INSTITUTION ADMIN</option>
                <option value="SYSTEM_ADMIN">SYSTEM ADMIN</option>
              </select>

              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setEditRoleModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-gray-300 hover:bg-white/10 transition text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveRole}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition text-sm flex items-center gap-2"
                >
                  {saving ? 'Saving...' : 'Save Role'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Users;
