'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface UserBooking {
  id: number;
  bookingRef: string;
  passengerName: string;
  seatNumber: string;
  travelDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: string | number;
  createdAt: string;
  operator: string;
  operatorColor: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime?: string;
  busType: string;
}

interface UserBookingsSummary {
  totalBookings: number;
  confirmedBookings: number;
  upcomingBookings: number;
  completedBookings: number;
}

interface UserBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPhone: string;
}

export default function UserBookingsModal({
  isOpen,
  onClose,
  userPhone,
}: UserBookingsModalProps) {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [summary, setSummary] = useState<UserBookingsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'confirmed' | 'pending' | 'completed'>('all');

  useEffect(() => {
    if (isOpen && userPhone) {
      fetchUserBookings();
    }
  }, [isOpen, userPhone]);

  const fetchUserBookings = async () => {
    setLoading(true);
    try {
      const statusParam = selectedStatus === 'all' ? '' : `&status=${selectedStatus}`;
      const response = await fetch(`/api/user-bookings?phone=${encodeURIComponent(userPhone)}${statusParam}`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.data);
        setSummary(data.summary);
      } else {
        toast.error('Failed to load bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: 'all' | 'confirmed' | 'pending' | 'completed') => {
    setSelectedStatus(status);
    setLoading(true);
    try {
      const statusParam = status === 'all' ? '' : `&status=${status}`;
      const response = await fetch(`/api/user-bookings?phone=${encodeURIComponent(userPhone)}${statusParam}`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.data);
      } else {
        toast.error('Failed to filter bookings');
      }
    } catch (error) {
      console.error('Error filtering bookings:', error);
      toast.error('Failed to filter bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '✓';
      case 'pending':
        return '⏳';
      case 'completed':
        return '✔️';
      case 'cancelled':
        return '✕';
      default:
        return '•';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    return timeString;
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
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-4xl mx-4"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-brand-primary to-blue-600 px-6 py-6 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">My Bookings</h3>
                  <p className="text-blue-100 text-sm mt-1">View and manage your travel bookings</p>
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

              {/* Summary Cards */}
              {summary && (
                <div className="px-6 py-6 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-brand-primary">{summary.totalBookings}</p>
                    <p className="text-xs text-slate-600 font-medium mt-1 uppercase tracking-wide">Total Bookings</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">{summary.confirmedBookings}</p>
                    <p className="text-xs text-green-700 font-medium mt-1 uppercase tracking-wide">Confirmed</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-amber-600">{summary.upcomingBookings}</p>
                    <p className="text-xs text-amber-700 font-medium mt-1 uppercase tracking-wide">Upcoming</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">{summary.completedBookings}</p>
                    <p className="text-xs text-blue-700 font-medium mt-1 uppercase tracking-wide">Completed</p>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="px-6 py-4 border-b border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
                {(['all', 'confirmed', 'pending', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedStatus === status
                        ? 'bg-brand-primary text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {/* Bookings List */}
              <div className="px-6 py-6 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin">
                      <svg
                        className="h-8 w-8 text-brand-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-brand-primary/30 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Booking Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-slate-900">
                                {booking.from} → {booking.to}
                              </h4>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                                {getStatusIcon(booking.status)} {booking.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500 text-xs font-medium uppercase">Operator</p>
                                <p className="font-semibold text-slate-900 mt-0.5">{booking.operator}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs font-medium uppercase">Seat</p>
                                <p className="font-semibold text-slate-900 mt-0.5">{booking.seatNumber}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs font-medium uppercase">Travel Date</p>
                                <p className="font-semibold text-slate-900 mt-0.5">{formatDate(booking.travelDate)}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs font-medium uppercase">Departure</p>
                                <p className="font-semibold text-slate-900 mt-0.5">{formatTime(booking.departureTime)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Price & Ref */}
                          <div className="text-right">
                            <p className="text-2xl font-bold text-brand-primary">
                              K{typeof booking.totalAmount === 'string' ? parseFloat(booking.totalAmount).toFixed(2) : booking.totalAmount.toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-500 font-mono mt-2 bg-slate-50 px-2 py-1 rounded">
                              {booking.bookingRef}
                            </p>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
                          <span>Booked: {formatDate(booking.createdAt)}</span>
                          <button className="text-brand-primary hover:text-brand-primary/80 font-semibold transition-colors">
                            View Details →
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-block p-6 rounded-full bg-slate-100 mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-12 h-12 text-slate-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-600 font-medium">No bookings found</p>
                    <p className="text-slate-500 text-sm mt-1">Start booking your next trip!</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-black transition-colors"
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
