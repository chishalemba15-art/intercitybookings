'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useUserSession } from '@/hooks/useUserSession';
import toast from 'react-hot-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { isDark, toggleTheme, theme } = useTheme();
  const { session } = useUserSession();
  const [notifications, setNotifications] = useState({
    bookingUpdates: true,
    promotions: true,
    systemAlerts: true,
  });
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    allowAnalytics: true,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success('Notification preference updated');
  };

  const handlePrivacyChange = (key: keyof typeof privacySettings) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success('Privacy setting updated');
  };

  const handleThemeToggle = () => {
    toggleTheme();
    toast.success(`Switched to ${isDark ? 'light' : 'dark'} mode`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 text-left shadow-2xl transition-all w-full max-w-2xl mx-4 border border-slate-200 dark:border-slate-800"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-brand-primary to-blue-600 dark:from-blue-900 dark:to-blue-800 px-6 py-6 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">Settings</h3>
                  <p className="text-blue-100 text-sm mt-1">Customize your experience</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 bg-white/10 rounded-full h-10 w-10 flex items-center justify-center transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-8 max-h-96 overflow-y-auto space-y-8">
                {/* Theme Settings */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12a9 9 0 11-18 0 9 9 0 0118 0m0 0v-5.25m0 0a8.973 8.973 0 016.364 2.637M9.172 9.172L5.964 5.964M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Theme
                  </h4>

                  <div className="space-y-3">
                    {/* Current Theme Display */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Current Theme</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isDark ? (
                            <>
                              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                                <span className="text-xl">🌙</span>
                              </div>
                              <span className="font-semibold text-slate-900 dark:text-white">Dark Mode</span>
                            </>
                          ) : (
                            <>
                              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                                <span className="text-xl">☀️</span>
                              </div>
                              <span className="font-semibold text-slate-900 dark:text-white">Light Mode</span>
                            </>
                          )}
                        </div>
                        <button
                          onClick={handleThemeToggle}
                          className="px-4 py-2 bg-brand-primary hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                        >
                          Switch Theme
                        </button>
                      </div>
                    </div>

                    {/* Theme Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-xs text-blue-900 dark:text-blue-100">
                        💡 Dark mode reduces eye strain in low-light environments. Your preference is saved automatically.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                      />
                    </svg>
                    Notifications
                  </h4>

                  <div className="space-y-3">
                    {/* Booking Updates */}
                    <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={notifications.bookingUpdates}
                        onChange={() => handleNotificationChange('bookingUpdates')}
                        className="w-5 h-5 text-brand-primary rounded cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">Booking Updates</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Get notified about your booking status</p>
                      </div>
                    </label>

                    {/* Promotions */}
                    <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={notifications.promotions}
                        onChange={() => handleNotificationChange('promotions')}
                        className="w-5 h-5 text-brand-primary rounded cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">Promotions & Offers</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Receive special deals and discounts</p>
                      </div>
                    </label>

                    {/* System Alerts */}
                    <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={notifications.systemAlerts}
                        onChange={() => handleNotificationChange('systemAlerts')}
                        className="w-5 h-5 text-brand-primary rounded cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">System Alerts</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Important updates about service</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Privacy
                  </h4>

                  <div className="space-y-3">
                    {/* Profile Visibility */}
                    <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={privacySettings.showProfile}
                        onChange={() => handlePrivacyChange('showProfile')}
                        className="w-5 h-5 text-brand-primary rounded cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">Show Profile</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Allow others to see your profile</p>
                      </div>
                    </label>

                    {/* Analytics */}
                    <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={privacySettings.allowAnalytics}
                        onChange={() => handlePrivacyChange('allowAnalytics')}
                        className="w-5 h-5 text-brand-primary rounded cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">Analytics & Tracking</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Help us improve by sharing usage data</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Account Info */}
                {session && (
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Account Information
                    </h4>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase">Name</p>
                        <p className="text-slate-900 dark:text-white font-medium mt-1">{session.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase">Phone</p>
                        <p className="text-slate-900 dark:text-white font-medium mt-1">{session.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase">Member Since</p>
                        <p className="text-slate-900 dark:text-white font-medium mt-1">
                          {session.registeredAt ? new Date(session.registeredAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* App Version */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase mb-2">App Version</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">v1.0.0</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Latest version installed</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
