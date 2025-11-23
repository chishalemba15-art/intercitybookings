'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/hooks/useUserSession';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';

interface UserStats {
  totalBookings: number;
  totalSearches: number;
  favoriteRoute: string | null;
  memberSince: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { session, isRegistered } = useUserSession();
  const [stats, setStats] = useState<UserStats>({
    totalBookings: 0,
    totalSearches: 0,
    favoriteRoute: null,
    memberSince: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);

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

      // Fetch user bookings count
      const bookingsResponse = await fetch(`/api/user-bookings?phone=${session.phone}`);
      const bookingsData = await bookingsResponse.json();

      setStats({
        totalBookings: bookingsData.bookings?.length || 0,
        totalSearches: session.searchCount || 0,
        favoriteRoute: null, // Can be calculated from bookings
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        onNotificationClick={() => {}}
        onSettingsClick={() => {}}
      />

      <main className="flex-grow w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-6 shadow-lg">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon="🎫"
              label="Total Bookings"
              value={stats.totalBookings}
              loading={isLoading}
            />
            <StatCard
              icon="🔍"
              label="Searches"
              value={stats.totalSearches}
              loading={isLoading}
            />
            <StatCard
              icon="⭐"
              label="Points"
              value={stats.totalBookings * 10}
              loading={isLoading}
            />
            <StatCard
              icon="🎁"
              label="Rewards"
              value={Math.floor(stats.totalBookings / 5)}
              loading={isLoading}
            />
          </div>

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
                onClick={() => router.push('/?bookings=true')}
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

function StatCard({ icon, label, value, loading }: {
  icon: string;
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="text-2xl mb-2">{icon}</div>
      {loading ? (
        <div className="h-8 bg-slate-200 rounded animate-pulse mb-2"></div>
      ) : (
        <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
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
