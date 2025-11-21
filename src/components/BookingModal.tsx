'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

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
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset form when modal closes
      setPassengerName('');
      setPassengerEmail('');
      setPhoneNumber('');
      setShowSuccess(false);
      setBookingRef('');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!bus) return null;

  const handlePayment = async () => {
    // Validate inputs
    if (!passengerName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    if (!/^(\+260|0)?[97]\d{8}$/.test(phoneNumber.replace(/\s/g, ''))) {
      toast.error('Please enter a valid Zambian phone number');
      return;
    }

    setIsProcessing(true);

    try {
      // Format phone number
      let formattedPhone = phoneNumber.replace(/\s/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+260' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+260' + formattedPhone;
      }

      // Generate a random seat number
      const seatNumber = `A${Math.floor(Math.random() * bus.seats) + 1}`;

      // Get today's date for travel (or use a date picker value)
      const travelDate = new Date();
      travelDate.setDate(travelDate.getDate() + 1); // Tomorrow

      // Create booking via API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          busId: bus.id,
          passengerName: passengerName.trim(),
          passengerPhone: formattedPhone,
          passengerEmail: passengerEmail.trim() || undefined,
          seatNumber,
          travelDate: travelDate.toISOString().split('T')[0],
          paymentMethod: paymentMethod,
          totalAmount: parseFloat(bus.price),
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.booking?.bookingRef) {
        const bookingRefValue = data.data.booking.bookingRef;
        setBookingRef(bookingRefValue);
        setShowSuccess(true);

        // Show success toast with confetti effect
        toast.success(
          `🎉 Booking Confirmed!\nReference: ${bookingRefValue}\nSeat: ${seatNumber}`,
          {
            duration: 6000,
            style: {
              background: '#10b981',
              color: '#fff',
            },
          }
        );

        // Auto close after 5 seconds
        setTimeout(() => {
          onClose();
        }, 5000);
      } else {
        toast.error(data.error || 'Booking failed. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to process booking. Please check your connection.');
      setIsProcessing(false);
    }
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

                {/* Passenger Details Section */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">
                    Passenger Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="097 123 4567"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Email (optional)
                      </label>
                      <input
                        type="email"
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Section */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">
                    Choose Payment Method
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Airtel Money */}
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="airtel"
                        checked={paymentMethod === 'airtel'}
                        onChange={() => setPaymentMethod('airtel')}
                        className="peer sr-only"
                      />
                      <div className="rounded-xl border-2 border-slate-200 p-4 hover:bg-red-50 hover:border-red-300 peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:ring-2 peer-checked:ring-red-500/20 transition-all h-full">
                        <div className="flex flex-col items-center gap-2.5">
                          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            <span>Ar</span>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-900">Airtel Money</p>
                            <p className="text-xs text-slate-500 mt-1">Dial *778#</p>
                          </div>
                        </div>
                      </div>
                    </label>

                    {/* MTN MoMo */}
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="mtn"
                        checked={paymentMethod === 'mtn'}
                        onChange={() => setPaymentMethod('mtn')}
                        className="peer sr-only"
                      />
                      <div className="rounded-xl border-2 border-slate-200 p-4 hover:bg-yellow-50 hover:border-yellow-300 peer-checked:border-yellow-500 peer-checked:bg-yellow-50 peer-checked:ring-2 peer-checked:ring-yellow-500/20 transition-all h-full">
                        <div className="flex flex-col items-center gap-2.5">
                          <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg">
                            <span>MT</span>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-900">MTN MoMo</p>
                            <p className="text-xs text-slate-500 mt-1">Dial *303#</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Payment Instructions */}
                <motion.div
                  key={paymentMethod}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-xl p-4 mb-4 border-2 ${
                    paymentMethod === 'airtel'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      paymentMethod === 'airtel'
                        ? 'bg-red-600'
                        : 'bg-yellow-500'
                    }`}>
                      ⓘ
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold mb-2 ${
                        paymentMethod === 'airtel'
                          ? 'text-red-900'
                          : 'text-yellow-900'
                      }`}>
                        How to pay with {paymentMethod === 'airtel' ? 'Airtel Money' : 'MTN MoMo'}
                      </p>
                      <ol className={`text-xs space-y-1.5 ${
                        paymentMethod === 'airtel'
                          ? 'text-red-800'
                          : 'text-yellow-800'
                      }`}>
                        {getInstructions().map((instruction, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="font-bold min-w-fit">{idx + 1}.</span>
                            <span dangerouslySetInnerHTML={{ __html: instruction }} />
                          </li>
                        ))}
                      </ol>
                      <div className={`mt-3 p-2 rounded text-xs ${
                        paymentMethod === 'airtel'
                          ? 'bg-red-100 text-red-900'
                          : 'bg-yellow-100 text-yellow-900'
                      }`}>
                        <p className="font-semibold">Total Amount: <span className="text-lg">K{bus.price}</span></p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Success State */}
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 z-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
                  >
                    <svg
                      className="w-10 h-10 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h3>
                  <p className="text-slate-600 text-center mb-4">
                    Your ticket has been successfully booked
                  </p>
                  <div className="bg-slate-100 rounded-lg p-4 mb-6 text-center">
                    <p className="text-xs text-slate-500 mb-1">Booking Reference</p>
                    <p className="text-lg font-bold text-brand-primary">{bookingRef}</p>
                  </div>
                  <p className="text-sm text-slate-500 text-center">
                    We've sent the ticket details to your phone via SMS
                  </p>
                </motion.div>
              )}

              {/* Footer */}
              <div className="bg-slate-50 px-5 md:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                <p className="text-xs text-slate-500 text-center sm:text-left">
                  🔒 Secure Encrypted Payment
                </p>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || showSuccess}
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
                    'Confirm Booking'
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
