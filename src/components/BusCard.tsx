'use client';

import { motion } from 'framer-motion';

interface BusCardProps {
  bus: {
    id: number;
    operator: string;
    from: string;
    to: string;
    time: string;
    price: string;
    type: string;
    seats: number;
    rating: string;
    features: string[];
    color: string;
  };
  index: number;
  onBook: (id: number) => void;
}

export default function BusCard({ bus, index, onBook }: BusCardProps) {
  const shareText = `Hey! I found a ${bus.operator} bus to ${bus.to} for K${bus.price} on IntercityBookings. Check it out!`;
  const waLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
    >
      <div className="p-4 md:p-5 relative">
        {/* WhatsApp Share Button */}
        <div className="absolute top-3 right-3 md:top-4 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 bg-green-50 p-2 rounded-full hover:bg-green-100 inline-flex items-center justify-center transition-colors"
            title="Share via WhatsApp"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
            </svg>
          </a>
        </div>

        {/* Operator Header */}
        <div className="flex items-center gap-3 md:gap-4 mb-4">
          <div
            className={`h-12 w-12 md:h-14 md:w-14 rounded-xl ${bus.color} shadow-lg flex items-center justify-center text-white font-bold text-xl md:text-2xl`}
          >
            {bus.operator.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white leading-tight text-base md:text-lg">
              {bus.operator}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="capitalize px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full font-medium text-slate-600 dark:text-slate-300">
                {bus.type}
              </span>
              <span className="flex items-center gap-1">
                •
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3.5 h-3.5 text-yellow-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                    clipRule="evenodd"
                  />
                </svg>
                {bus.rating}
              </span>
            </div>
          </div>
        </div>

        {/* Route Visualization */}
        <div className="flex items-center justify-between mb-5 px-2">
          <div className="text-center">
            <p className="text-base md:text-lg font-bold text-slate-800 dark:text-white">
              {bus.time}
            </p>
            <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">
              {bus.from}
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center px-3">
            <div className="w-full border-t-2 border-dotted border-slate-300 dark:border-slate-600 relative top-3"></div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-slate-300 dark:text-slate-600 bg-white dark:bg-slate-800 relative z-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-base md:text-lg font-bold text-slate-800 dark:text-white text-right">
              Dest.
            </p>
            <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide text-right">
              {bus.to}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4">
          {bus.features.map((feature, idx) => (
            <span
              key={idx}
              className="text-[10px] md:text-xs bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded border border-slate-100 dark:border-slate-600 font-medium"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Footer with Price and CTA */}
      <div className="mt-auto bg-slate-50 dark:bg-slate-700 p-4 border-t border-slate-100 dark:border-slate-600 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 dark:text-slate-500 block">Per Seat</span>
          <span className="text-xl md:text-2xl font-extrabold text-brand-primary">
            K{bus.price}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onBook(bus.id)}
          className="bg-slate-900 dark:bg-slate-600 text-white px-5 md:px-6 py-2 md:py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:bg-brand-primary dark:hover:bg-brand-primary transition-colors"
        >
          Book Now
        </motion.button>
      </div>
    </motion.div>
  );
}
