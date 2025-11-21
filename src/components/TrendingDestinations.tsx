'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TrendingRoute {
  from: string;
  to: string;
  route: string;
  searchCount: number;
  cheapestPrice: number | null;
  operatorCount: number;
}

interface TrendingDestinationsProps {
  onDestinationClick: (destination: string) => void;
}

export default function TrendingDestinations({ onDestinationClick }: TrendingDestinationsProps) {
  const [trending, setTrending] = useState<TrendingRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch('/api/trending-routes');
        const data = await response.json();
        if (data.success) {
          setTrending(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch trending routes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-slate-200 rounded w-48 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!trending || trending.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3">
              Trending Destinations
            </h2>
            <p className="text-slate-600 max-w-2xl">
              Most popular routes this week. Book your trip to the most searched destinations.
            </p>
          </motion.div>
        </div>

        {/* Trending Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trending.map((route, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => onDestinationClick(route.to)}
              className="text-left bg-white border border-slate-200 rounded-lg p-5 hover:shadow-lg hover:border-brand-primary/20 transition-all group relative overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-brand-primary/5 to-transparent rounded-bl-3xl"></div>

              {/* Trending Badge */}
              {route.searchCount > 50 && (
                <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.281m5.94 2.281l-2.28 5.941" />
                  </svg>
                  Hot Route
                </div>
              )}

              <div className="relative z-10">
                {/* Route */}
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-brand-primary transition-colors">
                  {route.from} → {route.to}
                </h3>

                {/* Stats */}
                <div className="flex items-center gap-3 mb-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.5 5.5a7.5 7.5 0 0010.5 10.5z" />
                    </svg>
                    <span>{route.searchCount} searches</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                    <span>{route.operatorCount} operators</span>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  {route.cheapestPrice ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500">Starting from</span>
                      <span className="text-lg font-bold text-brand-primary">K{route.cheapestPrice.toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500">View prices</span>
                  )}

                  <div className="bg-brand-primary/10 text-brand-primary p-2 rounded-lg group-hover:bg-brand-primary group-hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
