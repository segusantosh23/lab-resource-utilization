import React, { useState } from 'react';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'Lab Resource Utilization Platform',
    maintenanceMode: false,
    defaultLeadTime: '24',
    maxSlotDurationHours: '8',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlertsEnabled: true,
    overdueAlertThresholdHours: '2',
    calibrationNoticeDays: '14',
    digestFrequency: 'DAILY',
  });

  const [accessSettings, setAccessSettings] = useState({
    otpVerificationRequired: true,
    sessionTimeoutMinutes: '60',
    maxActiveBookingsPerUser: '5',
    allowCrossDepartmentBooking: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans relative">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
            <p className="text-gray-400 mt-1">Configure global parameters, security policies, and system preferences.</p>
          </div>
          {savedSuccess && (
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-xl animate-fadeIn flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              System settings saved successfully!
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.08] mb-8 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            General Platform
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Notifications & Alerts
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Security & Access Policy
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave} className="bg-[#12131a] border border-white/[0.08] rounded-2xl p-6 md:p-8 shadow-xl">
          
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Platform Application Name</label>
                <input
                  type="text"
                  value={generalSettings.platformName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1c23] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Default Advance Lead Time (Hours)</label>
                  <input
                    type="number"
                    value={generalSettings.defaultLeadTime}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, defaultLeadTime: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1c23] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum notice required before a booking slot starts.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Max Single Booking Duration (Hours)</label>
                  <input
                    type="number"
                    value={generalSettings.maxSlotDurationHours}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, maxSlotDurationHours: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1c23] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">System Maintenance Mode</h4>
                  <p className="text-xs text-gray-400">Temporarily restrict new bookings for scheduled platform maintenance.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={generalSettings.maintenanceMode}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
                <div>
                  <h4 className="text-sm font-semibold text-white">Email Notifications</h4>
                  <p className="text-xs text-gray-400">Send automatic transactional emails (Brevo SMTP) for approvals, reminders, and alerts.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={notificationSettings.emailAlertsEnabled}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, emailAlertsEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Overdue Booking Alert Threshold (Hours)</label>
                  <input
                    type="number"
                    value={notificationSettings.overdueAlertThresholdHours}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, overdueAlertThresholdHours: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1c23] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Calibration Notice Advance (Days)</label>
                  <input
                    type="number"
                    value={notificationSettings.calibrationNoticeDays}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, calibrationNoticeDays: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1c23] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
                <div>
                  <h4 className="text-sm font-semibold text-white">Require OTP Verification on Registration</h4>
                  <p className="text-xs text-gray-400">Validate user emails via 6-digit OTP code before granting access.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={accessSettings.otpVerificationRequired}
                    onChange={(e) => setAccessSettings({ ...accessSettings, otpVerificationRequired: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
                <div>
                  <h4 className="text-sm font-semibold text-white">Allow Cross-Department Resource Sharing</h4>
                  <p className="text-xs text-gray-400">Permit researchers to request equipment owned by other departments.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={accessSettings.allowCrossDepartmentBooking}
                    onChange={(e) => setAccessSettings({ ...accessSettings, allowCrossDepartmentBooking: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Max Active Bookings Per User</label>
                  <input
                    type="number"
                    value={accessSettings.maxActiveBookingsPerUser}
                    onChange={(e) => setAccessSettings({ ...accessSettings, maxActiveBookingsPerUser: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1c23] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Session Timeout (Minutes)</label>
                  <input
                    type="number"
                    value={accessSettings.sessionTimeoutMinutes}
                    onChange={(e) => setAccessSettings({ ...accessSettings, sessionTimeoutMinutes: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1c23] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition shadow-lg shadow-purple-600/20 text-sm"
            >
              Save Configuration
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default SystemSettings;
