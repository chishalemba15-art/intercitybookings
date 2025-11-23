'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useUserSession } from '@/hooks/useUserSession';
import { useScrollAnalytics } from '@/hooks/useScrollAnalytics';

interface Booking {
  id: number;
  bookingRef: string;
  passengerName: string;
  passengerPhone: string;
  seatNumber: string;
  travelDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: string;
  createdAt: string;
  operator: string;
  route: string;
  departureTime: string;
  busType: 'luxury' | 'standard';
}

export default function BookingsPage() {
  const router = useRouter();
  const { session, isRegistered } = useUserSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');

  // Track scroll analytics
  useScrollAnalytics(session?.phone);

  useEffect(() => {
    if (!isRegistered) {
      toast.error('Please register to view your bookings');
      router.push('/');
      return;
    }

    loadBookings();
  }, [isRegistered]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user-bookings?phone=${session?.phone}`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        toast.error('Failed to load bookings');
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();

    return bookings.filter((booking) => {
      const travelDate = new Date(booking.travelDate);

      switch (filter) {
        case 'upcoming':
          return travelDate >= now && booking.status !== 'cancelled';
        case 'past':
          return travelDate < now || booking.status === 'completed';
        case 'cancelled':
          return booking.status === 'cancelled';
        default:
          return true;
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = getFilteredBookings();

  if (!isRegistered) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" data-section="bookings-page">
      <Navbar onNotificationClick={() => {}} onSettingsClick={() => {}} />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Page Header */}
        <div className="mb-8" data-section="bookings-header">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Bookings</h1>
          <p className="text-slate-600">View and manage all your bus bookings</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-2 shadow-sm mb-6 inline-flex gap-2" data-section="bookings-filters">
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            count={bookings.length}
          >
            All
          </FilterButton>
          <FilterButton
            active={filter === 'upcoming'}
            onClick={() => setFilter('upcoming')}
            count={bookings.filter((b) => new Date(b.travelDate) >= new Date() && b.status !== 'cancelled').length}
          >
            Upcoming
          </FilterButton>
          <FilterButton
            active={filter === 'past'}
            onClick={() => setFilter('past')}
            count={bookings.filter((b) => new Date(b.travelDate) < new Date() || b.status === 'completed').length}
          >
            Past
          </FilterButton>
          <FilterButton
            active={filter === 'cancelled'}
            onClick={() => setFilter('cancelled')}
            count={bookings.filter((b) => b.status === 'cancelled').length}
          >
            Cancelled
          </FilterButton>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="grid gap-4" data-section="bookings-loading">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm text-center" data-section="bookings-empty">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No bookings found</h3>
            <p className="text-slate-600 mb-6">
              {filter === 'all'
                ? "You haven't made any bookings yet"
                : `You don't have any ${filter} bookings`}
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Buses
            </button>
          </div>
        ) : (
          <div className="grid gap-4" data-section="bookings-list">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-slate-900">
                        {booking.route}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 mb-1">Operator</p>
                        <p className="font-semibold text-slate-900">{booking.operator}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Travel Date</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(booking.travelDate).toLocaleDateString('en-ZM', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Departure</p>
                        <p className="font-semibold text-slate-900">{booking.departureTime}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Seat Number</p>
                        <p className="font-semibold text-slate-900">{booking.seatNumber}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <span className="text-sm text-slate-600">
                        Booking Ref: <span className="font-mono font-semibold text-slate-900">{booking.bookingRef}</span>
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.busType === 'luxury'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {booking.busType === 'luxury' ? '✨ Luxury' : 'Standard'}
                      </span>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {booking.totalAmount} <span className="text-base font-normal text-slate-600">ZMW</span>
                      </p>
                    </div>

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          toast.success('Booking details copied to clipboard!');
                          navigator.clipboard.writeText(`Booking: ${booking.bookingRef}\nRoute: ${booking.route}\nDate: ${new Date(booking.travelDate).toLocaleDateString()}\nSeat: ${booking.seatNumber}`);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Share Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children} {count > 0 && <span className="ml-1">({count})</span>}
    </button>
  );
}
