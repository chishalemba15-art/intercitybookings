'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/hooks/useUserSession';
import { useScrollAnalytics } from '@/hooks/useScrollAnalytics';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';

interface UserStats {
  totalBookings: number;
  totalSearches: number;
  upcomingBookings: number;
  totalSpent: string;
  favoriteRoute: string | null;
  memberSince: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { session, isRegistered } = useUserSession();
  const [stats, setStats] = useState<UserStats>({
    totalBookings: 0,
    totalSearches: 0,
    upcomingBookings: 0,
    totalSpent: '0',
    favoriteRoute: null,
    memberSince: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);

  // Track scroll analytics
  useScrollAnalytics(session?.phone);

  useEffect(() => {
    // Redirect if not registered
    if (!isRegistered) {
      toast.error('Please register to view your profile');
      router.push('/');
      return;
    }

    // Load user stats
    loadUserStats();
  }, [isRegistered, router]);

  const loadUserStats = async () => {
    if (!session?.phone) return;

    try {
      setIsLoading(true);

      // Fetch user bookings
      const bookingsResponse = await fetch(`/api/user-bookings?phone=${session.phone}`);
      const bookingsData = await bookingsResponse.json();

      const bookings = bookingsData.bookings || [];

      // Calculate upcoming bookings
      const now = new Date();
      const upcoming = bookings.filter((b: any) =>
        new Date(b.travelDate) >= now && b.status !== 'cancelled'
      ).length;

      // Calculate total spent
      const totalSpent = bookings
        .filter((b: any) => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum: number, b: any) => sum + parseFloat(b.totalAmount || 0), 0)
        .toFixed(2);

      // Find favorite route (most booked)
      const routeCounts = bookings.reduce((acc: any, b: any) => {
        const route = b.route || `${b.from} → ${b.to}`;
        acc[route] = (acc[route] || 0) + 1;
        return acc;
      }, {});

      const favoriteRoute = Object.keys(routeCounts).length > 0
        ? Object.entries(routeCounts).sort((a: any, b: any) => b[1] - a[1])[0][0]
        : null;

      setStats({
        totalBookings: bookings.length,
        totalSearches: session.searchCount || 0,
        upcomingBookings: upcoming,
        totalSpent,
        favoriteRoute,
        memberSince: session.registeredAt || new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" data-section="profile-page">
      <Navbar
        onNotificationClick={() => {}}
        onSettingsClick={() => {}}
      />

      <main className="flex-grow w-full py-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-6 shadow-lg" data-section="profile-header">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-3xl sm:text-4xl font-bold text-blue-600">
                  {session.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {session.name || 'User'}
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  📱 {session.phone}
                </p>
                <p className="text-blue-100 text-xs sm:text-sm mt-1">
                  Member since {new Date(stats.memberSince).toLocaleDateString('en-ZM', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-section="profile-stats">
            <StatCard
              icon="🎫"
              label="Total Bookings"
              value={stats.totalBookings}
              loading={isLoading}
            />
            <StatCard
              icon="📅"
              label="Upcoming Trips"
              value={stats.upcomingBookings}
              loading={isLoading}
            />
            <StatCard
              icon="💰"
              label="Total Spent"
              value={`${stats.totalSpent} ZMW`}
              isString={true}
              loading={isLoading}
            />
            <StatCard
              icon="⭐"
              label="Points"
              value={stats.totalBookings * 10}
              loading={isLoading}
            />
          </div>

          {/* Favorite Route */}
          {stats.favoriteRoute && !isLoading && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6 border border-purple-100" data-section="favorite-route">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌟</span>
                <div>
                  <p className="text-sm text-slate-600">Your Favorite Route</p>
                  <p className="text-lg font-bold text-slate-900">{stats.favoriteRoute}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <ActionButton
                icon="🚌"
                label="View My Bookings"
                description="See all your past and upcoming trips"
                onClick={() => router.push('/bookings')}
              />
              <ActionButton
                icon="🔔"
                label="Notifications"
                description="Check booking alerts and updates"
                onClick={() => toast.success('Coming soon!')}
              />
              <ActionButton
                icon="🎁"
                label="Rewards & Offers"
                description="Redeem points and view offers"
                onClick={() => toast.success('Coming soon!')}
              />
              <ActionButton
                icon="⚙️"
                label="Settings"
                description="Update your preferences"
                onClick={() => router.push('/?settings=true')}
              />
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Account Details
            </h2>
            <div className="space-y-4">
              <DetailRow label="Full Name" value={session.name || 'Not set'} />
              <DetailRow label="Phone Number" value={session.phone || 'Not set'} />
              <DetailRow
                label="Member Since"
                value={new Date(stats.memberSince).toLocaleDateString('en-ZM', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ icon, label, value, loading, isString }: {
  icon: string;
  label: string;
  value: number | string;
  loading: boolean;
  isString?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="text-2xl mb-2">{icon}</div>
      {loading ? (
        <div className="h-8 bg-slate-200 rounded animate-pulse mb-2"></div>
      ) : (
        <div className={`font-bold text-slate-900 mb-1 ${isString ? 'text-lg' : 'text-2xl'}`}>
          {value}
        </div>
      )}
      <div className="text-xs text-slate-600">{label}</div>
    </div>
  );
}

function ActionButton({ icon, label, description, onClick }: {
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-left w-full"
    >
      <div className="text-2xl flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-900 mb-1">{label}</div>
        <div className="text-xs text-slate-600">{description}</div>
      </div>
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
