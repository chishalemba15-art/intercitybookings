'use client';

import { useState, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import BusCard from '@/components/BusCard';
import BookingModal from '@/components/BookingModal';
import Footer from '@/components/Footer';

// Mock data - will be replaced with API calls
const mockBuses = [
  {
    id: 1,
    operator: 'Mazhandu Family',
    from: 'Lusaka',
    to: 'Livingstone',
    time: '06:00',
    price: '350',
    type: 'luxury',
    seats: 45,
    rating: '4.8',
    features: ['AC', 'USB', 'Snacks', 'Wi-Fi'],
    color: 'bg-red-600',
  },
  {
    id: 2,
    operator: 'Power Tools',
    from: 'Lusaka',
    to: 'Kitwe',
    time: '07:30',
    price: '280',
    type: 'standard',
    seats: 50,
    rating: '4.5',
    features: ['AC', 'Leg Room'],
    color: 'bg-blue-600',
  },
  {
    id: 3,
    operator: 'Juldan Motors',
    from: 'Lusaka',
    to: 'Johannesburg',
    time: '10:00',
    price: '1200',
    type: 'luxury',
    seats: 30,
    rating: '4.9',
    features: ['Reclining Seats', 'Meal', 'Toilet', 'AC', 'Entertainment'],
    color: 'bg-green-600',
  },
  {
    id: 4,
    operator: 'Shalom Bus',
    from: 'Lusaka',
    to: 'Chipata',
    time: '05:00',
    price: '300',
    type: 'standard',
    seats: 40,
    rating: '4.2',
    features: ['Music', 'Storage'],
    color: 'bg-purple-600',
  },
  {
    id: 5,
    operator: 'Likili',
    from: 'Lusaka',
    to: 'Mongu',
    time: '06:30',
    price: '400',
    type: 'standard',
    seats: 35,
    rating: '4.0',
    features: ['AC'],
    color: 'bg-orange-600',
  },
  {
    id: 6,
    operator: 'Mazhandu Family',
    from: 'Lusaka',
    to: 'Ndola',
    time: '14:00',
    price: '310',
    type: 'luxury',
    seats: 45,
    rating: '4.8',
    features: ['AC', 'TV', 'USB'],
    color: 'bg-red-600',
  },
];

type BusType = typeof mockBuses[0];

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [buses, setBuses] = useState<BusType[]>(mockBuses);
  const [filteredBuses, setFilteredBuses] = useState<BusType[]>(mockBuses);
  const [category, setCategory] = useState<'all' | 'luxury' | 'standard'>('all');
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleSearch = (destination: string, date: string) => {
    let filtered = buses;

    if (destination) {
      filtered = filtered.filter((bus) =>
        bus.to.toLowerCase().includes(destination.toLowerCase())
      );
    }

    setFilteredBuses(filtered);
  };

  const handleCategoryChange = (newCategory: 'all' | 'luxury' | 'standard') => {
    setCategory(newCategory);

    if (newCategory === 'all') {
      setFilteredBuses(buses);
    } else {
      setFilteredBuses(buses.filter((bus) => bus.type === newCategory));
    }
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

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Hero onSearch={handleSearch} />

        {/* Main Content */}
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-12 w-full">
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
            {filteredBuses.length > 0 ? (
              filteredBuses.map((bus, index) => (
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
                <form className="space-y-4">
                  <textarea
                    placeholder="How was your experience?"
                    className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-primary/50 outline-none resize-none h-32 bg-slate-50 focus:bg-white transition-colors"
                    required
                  ></textarea>
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-black transition-colors"
                  >
                    Send Feedback
                  </button>
                </form>
              </div>
            </div>
          </div>
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
      </div>
    </>
  );
}
