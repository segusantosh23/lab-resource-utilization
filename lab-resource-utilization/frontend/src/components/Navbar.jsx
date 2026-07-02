import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Configuration for role-based navigation menus
const ROLE_MENUS = {
  RESEARCHER: [
    { label: 'Dashboard', path: '/dashboard/researcher' },
    { label: 'Equipment', path: '/equipment' },
    { label: 'Bookings', path: '/bookings' },
  ],
  LAB_TECHNICIAN: [
    { label: 'Dashboard', path: '/dashboard/lab-technician' },
    { label: 'Equipment', path: '/equipment' },
    { label: 'Maintenance', path: '/maintenance' },
  ],
  LAB_MANAGER: [
    { label: 'Dashboard', path: '/dashboard/lab-manager' },
    { label: 'Equipment Management', path: '/equipment' },
    { label: 'Reports', path: '/reports' },
  ],
  DEPARTMENT_HEAD: [
    { label: 'Dashboard', path: '/dashboard/department-head' },
    { label: 'Reports', path: '/reports' },
    { label: 'Analytics', path: '/analytics' },
  ],
  INSTITUTION_ADMIN: [
    { label: 'Dashboard', path: '/dashboard/institution-admin' },
    { label: 'Institution Management', path: '/institution' },
    { label: 'Users', path: '/users' },
    { label: 'Reports', path: '/reports' },
  ],
  SYSTEM_ADMIN: [
    { label: 'Dashboard', path: '/dashboard/system-admin' },
    { label: 'All Equipment', path: '/equipment' },
    { label: 'Bookings', path: '/bookings' },
    { label: 'Maintenance', path: '/maintenance' },
    { label: 'Users', path: '/users' },
    { label: 'System Settings', path: '/settings' },
  ]
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  // Retrieve the authorized links for the current user's role
  // Default to empty array if role is somehow undefined
  const authorizedLinks = ROLE_MENUS[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-[#12131a] border-b border-white/[0.05] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 group-hover:shadow-lg group-hover:shadow-purple-500/30 transition">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="font-bold tracking-tight text-white hidden md:block">Lab Resource</span>
          </Link>
        </div>

        {/* Dynamic Role-Aware Navigation Links */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide justify-center md:justify-start">
          {authorizedLinks.map((link, index) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={index}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive 
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-200">{user.name}</p>
            <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
              {user.role.replace('_', ' ')}
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
  );
};

export default Navbar;
