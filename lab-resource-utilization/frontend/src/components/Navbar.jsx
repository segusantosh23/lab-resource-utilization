//import React, { useContext, useState } from 'react';
import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  getMyNotifications,
  markAllAsRead
} from "../services/notificationService";
// Configuration for role-based navigation menus
const ROLE_MENUS = {
  RESEARCHER: [
    { label: 'Dashboard', path: '/dashboard/researcher' },
    { label: 'Equipment', path: '/researcher/equipment' },
    { label: 'Bookings', path: '/bookings' },
    { label: 'Reports', path: '/reports' },
  ],

  LAB_TECHNICIAN: [
    { label: 'Dashboard', path: '/dashboard/lab-technician' },
    { label: 'Equipment', path: '/equipment' },
    { label: 'Calibration', path: '/calibrations' },
    { label: 'Maintenance', path: '/maintenance' },
  ],

  LAB_MANAGER: [
    { label: 'Dashboard', path: '/dashboard/lab-manager' },
    { label: 'Equipment Management', path: '/equipment' },
    { label: 'Calibration', path: '/calibrations' },
    { label: 'Maintenance', path: '/maintenance' },
    { label: 'Bookings', path: '/bookings' },
    { label: 'Utilization', path: '/analytics/utilization' },
    { label: 'Reports', path: '/reports' },
  ],

  DEPARTMENT_HEAD: [
    { label: 'Dashboard', path: '/dashboard/department-head' },
    { label: 'Bookings', path: '/bookings' },
    { label: 'Utilization', path: '/analytics/utilization' },
    { label: 'Reports', path: '/reports' },
  ],

  INSTITUTION_ADMIN: [
    { label: 'Dashboard', path: '/dashboard/institution-admin' },
    { label: 'Institution Management', path: '/institution' },
    { label: 'Users', path: '/users' },
    { label: 'Utilization', path: '/analytics/utilization' },
    { label: 'Reports', path: '/reports' },
  ],

  SYSTEM_ADMIN: [
    { label: 'Dashboard', path: '/dashboard/system-admin' },
    { label: 'All Equipment', path: '/equipment' },
    { label: 'Bookings', path: '/bookings' },
    { label: 'Utilization', path: '/analytics/utilization' },
    { label: 'Maintenance', path: '/maintenance' },
    { label: 'Users', path: '/users' },
    { label: 'System Settings', path: '/settings' },
  ]
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(
      n => !n.read
  ).length;

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  // Retrieve the authorized links for the current user's role
  // Default to empty array if role is somehow undefined
  const authorizedLinks = ROLE_MENUS[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  const fetchNotifications = async () => {

    try{

      const data = await getMyNotifications();

      setNotifications(data);

    }

    catch(error){

      console.error(error);

    }

  };

  useEffect(() => {

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);

  }, []);

  return (
    <nav className="bg-[#12131a] border-b border-white/[0.05] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <Link to={authorizedLinks.length > 0 ? authorizedLinks[0].path : "/"} className="flex items-center gap-3 group">
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

        <div className="flex items-center gap-4">

          {/* Notification Bell */}

          <div className="relative" ref={notificationRef}>

            <button

                onClick={async () => {

                  setNotificationOpen(!notificationOpen);

                  if (!notificationOpen) {

                    await markAllAsRead();

                    fetchNotifications();

                  }

                }}

                className="relative w-10 h-10 rounded-full bg-[#1a1c23] hover:bg-[#252833] flex items-center justify-center transition"

            >

              <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z"
                />
              </svg>

              {unreadCount > 0 && (

                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">

                    {unreadCount}

                </span>

              )}

            </button>

            {notificationOpen && (

                <div className="absolute right-0 mt-3 w-96 max-h-[500px] bg-[#1a1c23] rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-white/10">

                    <h2 className="text-white font-bold text-lg">
                      Notifications
                    </h2>

                  </div>

                  {notifications.length === 0 ? (

                      <div className="p-5 text-gray-300 text-center">
                        No notifications
                      </div>

                  ) : (

                      <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-[#1a1c23]">

                        {notifications.map(notification => (
                          <div
                              key={notification.id}
                              onClick={() => {
                                setNotificationOpen(false);
                                navigate('/bookings?tab=all');
                              }}
                              className="p-4 border-b border-white/5 hover:bg-white/5 transition duration-200 cursor-pointer"
                          >
                            <h3 className="text-white font-semibold">
                              {notification.title}
                            </h3>

                            <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                              {notification.message}
                            </p>

                            <p className="text-gray-500 text-xs mt-3">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}

                      </div>

                  )}

                </div>

            )}

          </div>

         {/* User Profile & Actions */}
        <div className="relative flex items-center shrink-0" ref={profileRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] transition duration-200 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <span className="text-sm font-medium text-gray-200">Profile</span>
          </button>

          {dropdownOpen && (

              <div className="absolute right-0 top-12 w-64 bg-[#1a1c23] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">

                <button
                    onClick={() => {
                      navigate("/profile");
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 text-white flex items-center gap-3"
                >
                  👤
                  <span>View Profile</span>
                </button>

                {/*<button*/}
                {/*    onClick={() => {*/}
                {/*      navigate("/notifications");*/}
                {/*      setDropdownOpen(false);*/}
                {/*    }}*/}
                {/*    className="w-full text-left px-4 py-3 hover:bg-white/5 text-white flex items-center gap-3"*/}
                {/*>*/}
                {/*  🔔*/}
                {/*  <span>Notifications</span>*/}
                {/*</button>*/}

                <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-red-400 flex items-center gap-3"
                >
                  🚪
                  <span>Logout</span>
                </button>

              </div>

          )}
        </div>
      </div>
        </div>
    </nav>
  );
};

export default Navbar;
