'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Suggestion {
  name: string;
  searchCount: number;
  cheapestPrice: number | null;
}

interface HeroProps {
  onSearch: (destination: string, date: string) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch search suggestions
  useEffect(() => {
    if (destination.length > 0) {
      const fetchSuggestions = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(destination)}`);
          const data = await response.json();
          if (data.success) {
            setSuggestions(data.data);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
        } finally {
          setLoading(false);
        }
      };

      const timer = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [destination]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  const handleSearch = () => {
    if (destination || date) {
      setShowSuggestions(false);
      onSearch(destination, date);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setDestination(suggestion.name);
    setShowSuggestions(false);
  };

  return (
    <header className="relative bg-brand-dark text-white overflow-hidden pb-16 md:pb-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071&auto=format&fit=crop"
          alt="Zambian Road"
          className="w-full h-full object-cover opacity-20 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-50"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8 md:pt-12 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Status Badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6"
        >
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-xs md:text-sm font-medium text-slate-200">
            Live Schedules Updated
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 md:mb-6 tracking-tight leading-tight"
        >
          Journey Across{' '}
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
            Zambia
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-slate-300 text-base sm:text-lg md:text-xl max-w-2xl mb-8 md:mb-10 font-light leading-relaxed px-4"
        >
          Smart booking for smart travelers. Reserve seats on Mazhandu, Power
          Tools, and more using Mobile Money.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl shadow-slate-900/20 p-3 md:p-5 flex flex-col md:flex-row gap-3 transform translate-y-8 border border-slate-100"
        >
          {/* Destination Input with Suggestions */}
          <div className="flex-1 relative group" ref={suggestionsRef}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() => destination.length > 0 && setShowSuggestions(true)}
              placeholder="Destination (e.g. Kitwe)"
              className="block w-full pl-11 pr-4 py-3 md:py-3.5 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-slate-50 focus:bg-white text-sm md:text-base"
            />

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-center justify-between group"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-sm">{suggestion.name}</span>
                        <span className="text-xs text-slate-500">
                          {suggestion.searchCount} searches •
                          {suggestion.cheapestPrice ? ` from K${suggestion.cheapestPrice.toFixed(2)}` : ' No price data'}
                        </span>
                      </div>
                      {suggestion.searchCount > 10 && (
                        <span className="text-xs bg-brand-primary/10 text-brand-primary font-semibold px-2 py-1 rounded-full group-hover:bg-brand-primary/20">
                          Trending
                        </span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading State */}
            {loading && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 px-4 py-3">
                <span className="text-sm text-slate-500 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-primary animate-pulse"></div>
                  Finding destinations...
                </span>
              </div>
            )}
          </div>

          {/* Date Input */}
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="block w-full pl-11 pr-4 py-3 md:py-3.5 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-slate-50 focus:bg-white text-sm md:text-base"
            />
          </div>

          {/* Search Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            className="bg-brand-primary hover:bg-blue-700 text-white font-bold py-3 md:py-3.5 px-6 md:px-8 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <span>Search</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </header>
  );
}
