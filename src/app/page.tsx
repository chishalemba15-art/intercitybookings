'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import SplashScreen from '@/components/SplashScreen';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import BusCard from '@/components/BusCard';
import BookingModal from '@/components/BookingModal';
import RegistrationModal from '@/components/RegistrationModal';
import PromotionsBanner from '@/components/PromotionsBanner';
import TrendingDestinations from '@/components/TrendingDestinations';
import UserBookingsModal from '@/components/UserBookingsModal';
import SettingsModal from '@/components/SettingsModal';
import GiveawayPromos from '@/components/GiveawayPromos';
import Footer from '@/components/Footer';
import { useUserSession } from '@/hooks/useUserSession';
import { useBookingNotifications } from '@/hooks/useBookingNotifications';

interface Bus {
  id: number;
  operator: string;
  operatorColor: string;
  from: string;
  to: string;
  time: string;
  price: string;
  type: 'luxury' | 'standard';
  seats: number;
  availableSeats: number;
  rating: string;
  features: string[];
  color: string;
}

type BusType = Bus;

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<BusType[]>([]);
  const [category, setCategory] = useState<'all' | 'luxury' | 'standard'>('all');
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchDestination, setSearchDestination] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(6); // Pagination: show 6 buses initially

  // Use custom hooks
  const { session, register, incrementSearchCount, needsRegistration, isRegistered } = useUserSession();
  const { latestBookings } = useBookingNotifications({
    enabled: true,
    onBookingClick: () => setIsBookingsModalOpen(true),
  });

  // Load buses on mount
  useEffect(() => {
    loadBuses();
  }, []);

  // Show welcome message for registered users (only on first render after registration)
  const hasShownWelcome = useRef(false);

  useEffect(() => {
    if (session && session.name && !showSplash && !hasShownWelcome.current) {
      // Only show welcome message once
      const wasJustRegistered = session.registeredAt &&
        (Date.now() - new Date(session.registeredAt).getTime()) < 5000;

      if (wasJustRegistered) {
        toast.success(`Welcome, ${session.name.split(' ')[0]}! 🎉`, {
          duration: 3000,
        });
        hasShownWelcome.current = true;
      }
    }
  }, [session, showSplash]);

  const loadBuses = async (destination?: string, date?: string, type?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (destination) params.append('destination', destination);
      if (date) params.append('date', date);
      if (type && type !== 'all') params.append('type', type);

      const response = await fetch(`/api/buses?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setBuses(data.data);
        setFilteredBuses(data.data);

        if (destination || type) {
          toast.success(`Found ${data.count} buses for your search`, {
            icon: '🚌',
          });
        }
      } else {
        toast.error('Failed to load buses. Please try again.');
      }
    } catch (error) {
      console.error('Failed to load buses:', error);
      toast.error('Failed to load buses. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleSearch = async (destination: string, date: string) => {
    // Increment search count
    incrementSearchCount();

    // Perform search
    setSearchDestination(destination);
    setSearchDate(date);
    await loadBuses(destination, date, category === 'all' ? undefined : category);
  };

  const handleCategoryChange = async (newCategory: 'all' | 'luxury' | 'standard') => {
    setCategory(newCategory);
    await loadBuses(searchDestination, searchDate, newCategory === 'all' ? undefined : newCategory);
  };

  const handleBooking = (busId: number) => {
    const bus = buses.find((b) => b.id === busId);
    if (bus) {
      setSelectedBus(bus);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedBus(null), 300);
  };

  const handleRegistration = async (name: string, phone: string, city?: string) => {
    register(name, phone);

    // Save user location if city is provided
    if (city) {
      try {
        await fetch('/api/user-locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userPhone: phone,
            userName: name,
            city: city,
            locationType: 'residence',
          }),
        });
      } catch (error) {
        console.error('Error saving user location:', error);
        // Don't fail registration if location save fails
      }
    }

    setIsRegistrationModalOpen(false);
    hasShownWelcome.current = true;

    toast.success(`Welcome, ${name.split(' ')[0]}! You're all set! 🎉`, {
      duration: 4000,
    });

    // Small delay to allow state to update before navigation
    setTimeout(() => {
      // Continue with the search after registration
      if (searchDestination || searchDate) {
        handleSearch(searchDestination, searchDate);
      }
    }, 100);
  };

  const handleSeeMore = () => {
    // Check if user is registered
    if (!isRegistered) {
      toast('Please register to see more buses', {
        icon: '🔐',
        duration: 3000,
      });
      setIsRegistrationModalOpen(true);
      return;
    }

    // Increase display limit
    setDisplayLimit(prev => prev + 6);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!feedbackMessage.trim()) {
      toast.error('Please enter your feedback message');
      return;
    }

    setIsSendingFeedback(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: session?.name || 'Anonymous',
          phone: session?.phone || null,
          message: feedbackMessage.trim(),
          rating: feedbackRating,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Thank you for your feedback! 🙌', {
          duration: 4000,
        });
        setFeedbackMessage('');
        setFeedbackRating(5);
      } else {
        toast.error(data.error || 'Failed to send feedback');
      }
    } catch (error) {
      console.error('Feedback error:', error);
      toast.error('Failed to send feedback. Please try again.');
    } finally {
      setIsSendingFeedback(false);
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <div className="min-h-screen flex flex-col">
        <Navbar
          onNotificationClick={() => setIsBookingsModalOpen(true)}
          onSettingsClick={() => setIsSettingsModalOpen(true)}
        />
        <Hero onSearch={handleSearch} />

        {/* Main Content */}
        <main className="flex-grow w-full">
          {/* Promotions Banner Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-8">
            <PromotionsBanner onPromoClick={() => {
              // Scroll to search or handle promo click
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} />
          </div>

          {/* Trending Destinations Section */}
          <TrendingDestinations onDestinationClick={(destination) => {
            setSearchDestination(destination);
            handleSearch(destination, '');
          }} />

          {/* Popular Routes Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-12">
          {/* Section Header with Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Popular Routes
              </h2>
              <p className="text-slate-500 text-sm md:text-base mt-1">
                Real-time availability from reliable operators
              </p>
            </div>

            {/* Category Filters */}
            <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto no-scrollbar w-full sm:w-auto touch-manipulation">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${
                  category === 'all'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleCategoryChange('luxury')}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${
                  category === 'luxury'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Luxury
              </button>
              <button
                onClick={() => handleCategoryChange('standard')}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${
                  category === 'standard'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Standard
              </button>
            </div>
          </div>

          {/* Bus Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-20 bg-slate-200 rounded-lg mb-4"></div>
                  <div className="h-10 bg-slate-200 rounded-lg"></div>
                </div>
              ))
            ) : filteredBuses.length > 0 ? (
              filteredBuses.slice(0, displayLimit).map((bus, index) => (
                <BusCard
                  key={bus.id}
                  bus={bus}
                  index={index}
                  onBook={handleBooking}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
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
                      d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  No buses found for this route
                </h3>
                <p className="text-slate-500 text-sm">
                  Try adjusting your search or check back later
                </p>
              </div>
            )}
          </div>

          {/* See More Button - Show if there are more buses to display */}
          {!isLoading && filteredBuses.length > displayLimit && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSeeMore}
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span>See More Buses</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5 group-hover:translate-y-1 transition-transform"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
                {!isRegistered && (
                  <span className="absolute -top-2 -right-2 flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 items-center justify-center text-xs font-bold">
                      🔐
                    </span>
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-16 md:mt-20 bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
                  Why book with IntercityBookings?
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 items-start">
                    <div className="bg-green-100 text-green-600 p-1.5 rounded-full mt-0.5 flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-3 h-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="text-slate-900 font-semibold block mb-1">
                        No Hidden Fees
                      </span>
                      <span className="text-slate-600 text-sm leading-relaxed">
                        What you see is what you pay via Mobile Money
                      </span>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="bg-green-100 text-green-600 p-1.5 rounded-full mt-0.5 flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-3 h-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="text-slate-900 font-semibold block mb-1">
                        Live Tracking
                      </span>
                      <span className="text-slate-600 text-sm leading-relaxed">
                        We work with operators to provide accurate timings
                      </span>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="bg-green-100 text-green-600 p-1.5 rounded-full mt-0.5 flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-3 h-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="text-slate-900 font-semibold block mb-1">
                        24/7 Support
                      </span>
                      <span className="text-slate-600 text-sm leading-relaxed">
                        Call our dedicated Lusaka center anytime
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
                  Customer Feedback
                </h3>
                <form className="space-y-4" onSubmit={handleFeedbackSubmit}>
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      How would you rate your experience?
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className={`text-2xl transition-transform hover:scale-110 ${
                            star <= feedbackRating ? 'text-yellow-400' : 'text-slate-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Your feedback
                    </label>
                    <textarea
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="How was your experience? Your feedback helps us improve..."
                      className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-primary/50 outline-none resize-none h-32 bg-slate-50 focus:bg-white transition-colors"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingFeedback || !feedbackMessage.trim()}
                    className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSendingFeedback ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Feedback'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
          </div>

          {/* Giveaway Promotions Section - Bottom */}
          <GiveawayPromos />
        </main>

        <Footer />

        {/* Floating Support Button */}
        <a
          href="tel:+260970000000"
          className="fixed bottom-6 right-6 z-40 bg-green-600 text-white p-4 rounded-full shadow-xl hover:bg-green-700 hover:scale-105 transition-all flex items-center justify-center gap-2 group no-print"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 animate-pulse"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
            />
          </svg>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-medium">
            Call Support
          </span>
        </a>

        {/* Booking Modal */}
        <BookingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          bus={selectedBus}
        />

        {/* Registration Modal */}
        <RegistrationModal
          isOpen={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
          onRegister={handleRegistration}
        />

        {/* User Bookings Modal */}
        <UserBookingsModal
          isOpen={isBookingsModalOpen}
          onClose={() => setIsBookingsModalOpen(false)}
          userPhone={session?.phone || ''}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      </div>
    </>
  );
}
