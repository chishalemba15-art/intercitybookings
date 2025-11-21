'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface RecentBooking {
  id: number;
  bookingRef: string;
  passengerName: string;
  seatNumber: string;
  operator: string;
  route: string;
  departureTime: string;
  travelDate: string;
  createdAt: string;
}

interface UseBookingNotificationsProps {
  enabled?: boolean;
  onBookingClick?: () => void;
}

export function useBookingNotifications({
  enabled = true,
  onBookingClick
}: UseBookingNotificationsProps | boolean = {}) {
  // Handle backward compatibility - if boolean is passed, convert to object
  const enabledValue = typeof enabled === 'boolean' ? enabled : (enabled as UseBookingNotificationsProps).enabled ?? true;
  const onBookingClickValue = typeof enabled === 'object' ? (enabled as UseBookingNotificationsProps).onBookingClick : onBookingClick;

  const [latestBookings, setLatestBookings] = useState<RecentBooking[]>([]);
  const seenBookingIds = useRef<Set<number>>(new Set());
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!enabledValue) return;

    const fetchRecentBookings = async () => {
      try {
        const response = await fetch('/api/recent-bookings?minutes=5');
        if (!response.ok) return;

        const data = await response.json();
        if (data.success && data.data) {
          const bookings = data.data as RecentBooking[];

          // On first load, just mark all as seen without showing notifications
          if (isFirstLoad.current) {
            bookings.forEach(booking => {
              seenBookingIds.current.add(booking.id);
            });
            isFirstLoad.current = false;
          } else {
            // Show notifications for new bookings
            bookings.forEach(booking => {
              if (!seenBookingIds.current.has(booking.id)) {
                seenBookingIds.current.add(booking.id);
                showBookingNotification(booking);
              }
            });
          }

          setLatestBookings(bookings);
        }
      } catch (error) {
        console.error('Failed to fetch recent bookings:', error);
      }
    };

    // Initial fetch
    fetchRecentBookings();

    // Poll every 15 seconds
    const interval = setInterval(fetchRecentBookings, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [enabledValue]);

  const showBookingNotification = (booking: RecentBooking) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xl">🎫</span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  New Booking!
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  <strong>{booking.passengerName}</strong> just booked a seat on{' '}
                  <strong>{booking.operator}</strong>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {booking.route} • Seat {booking.seatNumber}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            {onBookingClickValue && (
              <button
                onClick={() => {
                  onBookingClickValue();
                  toast.dismiss(t.id);
                }}
                className="border-r border-gray-200 px-4 py-2 flex items-center justify-center text-sm font-medium text-brand-primary hover:text-brand-primary/80 focus:outline-none hover:bg-slate-50 transition-colors"
              >
                View All
              </button>
            )}
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ),
      {
        duration: 6000,
        position: 'top-right',
      }
    );
  };

  return {
    latestBookings,
  };
}
