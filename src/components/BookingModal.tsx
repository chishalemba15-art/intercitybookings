'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bus: {
    id: number;
    operator: string;
    from: string;
    to: string;
    time: string;
    price: string;
    seats: number;
  } | null;
}

export default function BookingModal({ isOpen, onClose, bus }: BookingModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'airtel' | 'mtn'>('airtel');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!bus) return null;

  const handlePayment = async () => {
    if (!phoneNumber) {
      alert('Please enter your phone number');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      alert(
        `Payment Successful!\n\nTicket ID: #ZM${Math.floor(Math.random() * 10000)}\nCheck your SMS for ticket details.`
      );
      onClose();
    }, 2000);
  };

  const getInstructions = () => {
    if (paymentMethod === 'airtel') {
      return [
        'Dial *778#',
        'Select Make Payment > Pay Bill',
        'Enter Merchant Code: INTERCITY',
        `Enter Amount: K${bus.price}`,
        'Reference: [Your Phone Number]',
      ];
    } else {
      return [
        'Dial *303#',
        'Select Next > Pay Bill',
        'Enter Merchant ID: 202020',
        `Enter Amount: K${bus.price}`,
        `Reference: Ticket-${bus.id}`,
      ];
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-lg mx-4"
            >
              {/* Header */}
              <div className="bg-slate-900 px-5 md:px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-white">
                    Confirm Reservation
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Complete payment to secure seat
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white bg-white/10 rounded-full h-8 w-8 flex items-center justify-center transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="px-5 md:px-6 py-6">
                {/* Summary Card */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{bus.operator}</h4>
                      <p className="text-sm text-slate-500">
                        {bus.from} to {bus.to}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block text-lg font-bold text-brand-primary">
                        K{bus.price}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-500 border-t border-slate-200 pt-3">
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{bus.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                        />
                      </svg>
                      <span>Seat {Math.floor(Math.random() * bus.seats) + 1}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <h4 className="text-sm font-bold text-slate-900 mb-3">
                  Select Payment Method
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="airtel"
                      checked={paymentMethod === 'airtel'}
                      onChange={() => setPaymentMethod('airtel')}
                      className="peer sr-only"
                    />
                    <div className="rounded-xl border-2 border-slate-200 p-3 md:p-4 hover:bg-red-50 hover:border-red-200 peer-checked:border-red-500 peer-checked:bg-red-50 transition-all flex flex-col items-center gap-2 h-full">
                      <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs">
                        Ar
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        Airtel Money
                      </span>
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="mtn"
                      checked={paymentMethod === 'mtn'}
                      onChange={() => setPaymentMethod('mtn')}
                      className="peer sr-only"
                    />
                    <div className="rounded-xl border-2 border-slate-200 p-3 md:p-4 hover:bg-yellow-50 hover:border-yellow-200 peer-checked:border-yellow-400 peer-checked:bg-yellow-50 transition-all flex flex-col items-center gap-2 h-full">
                      <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center text-slate-900 font-bold text-xs">
                        MT
                      </div>
                      <span className="text-xs font-bold text-slate-700">MTN MoMo</span>
                    </div>
                  </label>
                </div>

                {/* Payment Instructions */}
                <div className="bg-slate-100 rounded-lg p-4 text-sm text-slate-600 mb-6 border border-slate-200">
                  <p className="font-bold mb-2 text-slate-800">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    {getInstructions().map((instruction, idx) => (
                      <li key={idx} dangerouslySetInnerHTML={{ __html: instruction }} />
                    ))}
                  </ol>
                </div>

                {/* Phone Number Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Your Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="097..."
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-5 md:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                <p className="text-xs text-slate-500 text-center sm:text-left">
                  🔒 Secure Encrypted Payment
                </p>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full sm:w-auto bg-brand-primary text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Confirm Payment'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
