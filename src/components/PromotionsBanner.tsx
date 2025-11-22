'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUserSession } from '@/hooks/useUserSession';

interface Promotion {
  id: number;
  title: string;
  description: string | null;
  discountPercent: number | null;
  discountAmount: number | null;
  code: string | null;
  badge: string | null;
  imageUrl: string | null;
  startDate: Date | string;
  endDate: Date | string;
}

interface PromotionsBannerProps {
  onPromoClick?: () => void;
}

export default function PromotionsBanner({ onPromoClick }: PromotionsBannerProps) {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const { isRegistered } = useUserSession();

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const response = await fetch('/api/promotions?featured=true');
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setPromotion(data.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch promotion:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotion();
  }, []);

  // Calculate time left
  useEffect(() => {
    if (!promotion) return;

    const timer = setInterval(() => {
      const endDate = new Date(promotion.endDate);
      const now = new Date();
      const diffMs = endDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        setTimeLeft(`${diffDays} day${diffDays > 1 ? 's' : ''} left`);
      } else if (diffHours > 0) {
        setTimeLeft(`${diffHours}h left`);
      } else {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        setTimeLeft(`${diffMinutes}m left`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [promotion]);

  if (loading || !promotion) {
    return null;
  }

  const isNewUser = !isRegistered;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-xl shadow-lg ${
        promotion.imageUrl
          ? 'bg-cover bg-center'
          : 'bg-gradient-to-r from-brand-primary via-blue-600 to-cyan-500'
      }`}
      style={
        promotion.imageUrl
          ? {
              backgroundImage: `linear-gradient(135deg, rgba(37, 99, 235, 0.85) 0%, rgba(59, 130, 246, 0.85) 100%), url(${promotion.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Content */}
        <div className="flex-1">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-3">
            {isNewUser && (
              <span className="inline-block bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                NEW USER
              </span>
            )}
            {promotion.badge && (
              <span className="inline-block bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full">
                {promotion.badge}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
            {promotion.title}
          </h3>

          {/* Description */}
          {promotion.description && (
            <p className="text-blue-50 text-sm sm:text-base mb-3 max-w-xl">
              {promotion.description}
            </p>
          )}

          {/* Discount & Code */}
          <div className="flex flex-wrap items-center gap-3">
            {promotion.discountPercent && (
              <div className="flex items-center gap-2">
                <span className="text-3xl sm:text-4xl font-black text-yellow-300">
                  {promotion.discountPercent}%
                </span>
                <span className="text-xs sm:text-sm text-blue-100">OFF</span>
              </div>
            )}
            {promotion.discountAmount && (
              <div className="flex items-center gap-1">
                <span className="text-2xl sm:text-3xl font-black text-yellow-300">
                  K{promotion.discountAmount.toFixed(2)}
                </span>
                <span className="text-xs sm:text-sm text-blue-100">Discount</span>
              </div>
            )}
            {promotion.code && (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2">
                <span className="text-xs text-blue-50">Code: </span>
                <span className="text-sm font-bold text-white">{promotion.code}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right - CTA & Timer */}
        <div className="flex flex-col items-start sm:items-end gap-4 w-full sm:w-auto">
          {/* Urgency Message for First-Time Users */}
          {isNewUser && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-full sm:w-auto bg-red-500 text-white rounded-lg px-4 py-3 text-center sm:text-left"
            >
              <p className="text-sm font-bold">Only valid for new users!</p>
              <p className="text-xs opacity-90 mt-1">Complete your first booking now</p>
            </motion.div>
          )}

          {/* Time Left Countdown */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-white animate-pulse"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5-15a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-bold text-white text-sm sm:text-base">{timeLeft}</span>
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPromoClick}
              className="bg-white dark:bg-slate-800 text-brand-primary dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all whitespace-nowrap text-sm sm:text-base flex items-center gap-2"
            >
              <span>Book Now</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-2 right-2 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-2 left-2 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </motion.div>
  );
}
