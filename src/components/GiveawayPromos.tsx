'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Giveaway {
  id: number;
  title: string;
  description: string;
  prizeType: string;
  prizeValue: number;
  drawDate: string;
  status: string;
  winnersCount: number;
  totalEntries: number;
  daysRemaining: number;
}

const PRIZE_IMAGES: Record<string, string> = {
  free_ticket: 'https://images.unsplash.com/photo-1527480694994-ffd759802d0d?w=500&h=500&fit=crop',
  phone: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=500&fit=crop',
  powerbank: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=500&fit=crop',
  cash_voucher: 'https://images.unsplash.com/photo-1579621970563-430f63602d4b?w=500&h=500&fit=crop',
  airpods: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
  charger: 'https://images.unsplash.com/photo-1623293182086-7651a899d37f?w=500&h=500&fit=crop',
};

const GRADIENT_COLORS: Record<string, { from: string; to: string; accent: string }> = {
  free_ticket: {
    from: 'from-blue-500',
    to: 'to-cyan-500',
    accent: 'bg-blue-600',
  },
  phone: {
    from: 'from-purple-500',
    to: 'to-pink-500',
    accent: 'bg-purple-600',
  },
  powerbank: {
    from: 'from-orange-500',
    to: 'to-red-500',
    accent: 'bg-orange-600',
  },
  cash_voucher: {
    from: 'from-emerald-500',
    to: 'to-teal-500',
    accent: 'bg-emerald-600',
  },
  airpods: {
    from: 'from-indigo-500',
    to: 'to-blue-500',
    accent: 'bg-indigo-600',
  },
  charger: {
    from: 'from-yellow-500',
    to: 'to-orange-500',
    accent: 'bg-yellow-600',
  },
};

const TicketIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const GiftIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v-1m0 0H9m3 0h3m-6 4v10a1 1 0 001 1h8a1 1 0 001-1v-10m-11 0h11M9 20h6" />
  </svg>
);

const PRIZE_ICONS: Record<string, React.ReactNode> = {
  free_ticket: <TicketIcon />,
  phone: <PhoneIcon />,
  powerbank: <ZapIcon />,
  cash_voucher: <GiftIcon />,
  airpods: <ZapIcon />,
  charger: <ZapIcon />,
};

export default function GiveawayPromos() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGiveaway, setSelectedGiveaway] = useState<Giveaway | null>(null);
  const [isEnteringGiveaway, setIsEnteringGiveaway] = useState(false);

  useEffect(() => {
    loadGiveaways();
    const interval = setInterval(loadGiveaways, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadGiveaways = async () => {
    try {
      const response = await fetch('/api/giveaways?limit=6');
      const data = await response.json();
      if (data.success) {
        setGiveaways(data.data);
      }
    } catch (error) {
      console.error('Failed to load giveaways:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterGiveaway = async (giveaway: Giveaway) => {
    const userPhone = localStorage.getItem('userPhone');

    if (!userPhone) {
      toast.error('Please register to enter the giveaway', {
        icon: '🔒',
      });
      return;
    }

    setIsEnteringGiveaway(true);
    try {
      const response = await fetch('/api/giveaways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giveawayId: giveaway.id,
          userPhone,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('🎉 You\'ve entered the giveaway! Good luck!', {
          duration: 4000,
        });
        setSelectedGiveaway(null);
        loadGiveaways(); // Refresh to show updated entry count
      } else {
        toast.error(result.error || 'Failed to enter giveaway');
      }
    } catch (error) {
      console.error('Error entering giveaway:', error);
      toast.error('Failed to enter giveaway. Please try again.');
    } finally {
      setIsEnteringGiveaway(false);
    }
  };

  if (loading && giveaways.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (giveaways.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
            <GiftIcon />
            <span className="text-purple-700 font-semibold text-sm">Exciting Offers</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Win Amazing Prizes! 🎁
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Participate in our exclusive giveaways and stand a chance to win smartphones,
            free tickets, power banks, and more!
          </p>
        </div>

        {/* Giveaway Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {giveaways.map((giveaway) => {
            const colors = GRADIENT_COLORS[giveaway.prizeType] || GRADIENT_COLORS.free_ticket;
            const image = PRIZE_IMAGES[giveaway.prizeType] || PRIZE_IMAGES.free_ticket;
            const icon = PRIZE_ICONS[giveaway.prizeType] || PRIZE_ICONS.free_ticket;

            return (
              <div
                key={giveaway.id}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedGiveaway(giveaway)}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.from} ${colors.to} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                {/* Card Content */}
                <div className="relative bg-white">
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img
                      src={image}
                      alt={giveaway.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Prize Badge */}
                    <div className={`absolute top-4 right-4 ${colors.accent} text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1`}>
                      {icon}
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-6">
                    {/* Prize Value */}
                    <div className={`inline-block bg-gradient-to-r ${colors.from} ${colors.to} text-white px-3 py-1 rounded-lg text-xs font-bold mb-3`}>
                      Prize: K{giveaway.prizeValue}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                      {giveaway.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {giveaway.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-slate-200">
                      <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Entries</p>
                        <p className={`text-2xl font-bold bg-gradient-to-r ${colors.from} ${colors.to} bg-clip-text text-transparent`}>
                          {giveaway.totalEntries}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Time Left</p>
                        <p className={`text-2xl font-bold bg-gradient-to-r ${colors.from} ${colors.to} bg-clip-text text-transparent`}>
                          {giveaway.daysRemaining}d
                        </p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnterGiveaway(giveaway);
                      }}
                      className={`w-full bg-gradient-to-r ${colors.from} ${colors.to} text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2`}
                    >
                      <GiftIcon />
                      Enter Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* How It Works Section */}
        <div className="mt-16 bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-8">How to Win</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-600 text-white font-bold text-lg">
                1
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Register</h4>
                <p className="text-slate-600">Create your account with your phone number to participate</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-600 text-white font-bold text-lg">
                2
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Enter Giveaway</h4>
                <p className="text-slate-600">Click "Enter Now" on any promotion to get a chance to win</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-600 text-white font-bold text-lg">
                3
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Check Results</h4>
                <p className="text-slate-600">Winners are drawn automatically and notified via phone</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Selected Giveaway */}
      {selectedGiveaway && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
          onClick={() => setSelectedGiveaway(null)}
        >
          <div
            className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md overflow-hidden animate-in slide-in-from-bottom-4 md:zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedGiveaway(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative">
              {/* Image */}
              <div className="relative h-64 overflow-hidden bg-gray-200">
                <img
                  src={PRIZE_IMAGES[selectedGiveaway.prizeType] || PRIZE_IMAGES.free_ticket}
                  alt={selectedGiveaway.title}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-4 right-4 ${GRADIENT_COLORS[selectedGiveaway.prizeType]?.accent || 'bg-blue-600'} text-white px-4 py-2 rounded-full text-sm font-bold`}>
                  K{selectedGiveaway.prizeValue}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {selectedGiveaway.title}
                </h3>
                <p className="text-slate-600 mb-4">
                  {selectedGiveaway.description}
                </p>

                {/* Details */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Entries</span>
                    <span className="font-bold text-slate-900">{selectedGiveaway.totalEntries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Winners</span>
                    <span className="font-bold text-slate-900">{selectedGiveaway.winnersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Days Left</span>
                    <span className="font-bold text-slate-900">{selectedGiveaway.daysRemaining} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Draw Date</span>
                    <span className="font-bold text-slate-900">
                      {new Date(selectedGiveaway.drawDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={() => handleEnterGiveaway(selectedGiveaway)}
                  disabled={isEnteringGiveaway}
                  className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                    isEnteringGiveaway
                      ? 'bg-slate-400 cursor-not-allowed'
                      : `bg-gradient-to-r ${GRADIENT_COLORS[selectedGiveaway.prizeType]?.from || 'from-blue-500'} ${GRADIENT_COLORS[selectedGiveaway.prizeType]?.to || 'to-cyan-500'} hover:shadow-lg hover:scale-105`
                  }`}
                >
                  {isEnteringGiveaway ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Entering...
                    </>
                  ) : (
                    <>
                      <GiftIcon />
                      Enter Giveaway
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
