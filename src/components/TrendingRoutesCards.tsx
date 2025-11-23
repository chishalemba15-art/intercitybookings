'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TrendingRoute {
  from: string;
  to: string;
  searches: number;
  priceFrom: string;
}

export default function TrendingRoutesCards({ onRouteClick }: {
  onRouteClick: (from: string, to: string) => void
}) {
  const [routes, setRoutes] = useState<TrendingRoute[]>([]);

  useEffect(() => {
    // Fetch trending routes
    fetch('/api/trending-routes')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          // Transform API response to component format
          const transformedRoutes = data.data.slice(0, 3).map((route: any) => ({
            from: route.from,
            to: route.to,
            searches: route.searchCount || 0,
            priceFrom: route.cheapestPrice ? route.cheapestPrice.toString() : '150',
          }));
          setRoutes(transformedRoutes);
        } else {
          // Fallback to mock data
          setRoutes([
            { from: 'Lusaka', to: 'Kitwe', searches: 342, priceFrom: '150' },
            { from: 'Lusaka', to: 'Ndola', searches: 289, priceFrom: '180' },
            { from: 'Kitwe', to: 'Solwezi', searches: 156, priceFrom: '200' },
          ]);
        }
      })
      .catch(() => {
        // Fallback to mock data if API fails
        setRoutes([
          { from: 'Lusaka', to: 'Kitwe', searches: 342, priceFrom: '150' },
          { from: 'Lusaka', to: 'Ndola', searches: 289, priceFrom: '180' },
          { from: 'Kitwe', to: 'Solwezi', searches: 156, priceFrom: '200' },
        ]);
      });
  }, []);

  if (routes.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        🔥 Trending Now
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {routes.map((route, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onRouteClick(route.from, route.to)}
            className="bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-xl p-4 text-left transition-all hover:shadow-lg border border-orange-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                {route.searches} searches
              </span>
              <span className="text-2xl">🚌</span>
            </div>
            <div className="text-sm font-bold text-slate-900 mb-1">
              {route.from} → {route.to}
            </div>
            <div className="text-xs text-slate-600">
              From <span className="font-semibold text-green-600">{route.priceFrom} ZMW</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
