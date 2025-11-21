'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (name: string, phone: string) => void;
}

export default function RegistrationModal({ isOpen, onClose, onRegister }: RegistrationModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = { name: '', phone: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^(\+260|0)?[97]\d{8}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Zambian phone number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Format phone number
    let formattedPhone = phone.replace(/\s/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+260' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+260' + formattedPhone;
    }

    // Simulate a brief loading state for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    onRegister(name.trim(), formattedPhone);
    setIsSubmitting(false);

    // Reset form
    setName('');
    setPhone('');
    setErrors({ name: '', phone: '' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-brand-primary to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">Continue Searching</h2>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-blue-100 text-sm">
                  Register to continue searching and get personalized booking updates
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Phone Input */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500">🇿🇲</span>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="097 123 4567"
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    We'll send booking updates via SMS
                  </p>
                </div>

                {/* Benefits */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-brand-dark text-sm mb-2">Benefits:</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Unlimited searches</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Real-time booking notifications</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>SMS updates for your bookings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Quick rebooking on favorite routes</span>
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-brand-primary to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Privacy Note */}
                <p className="text-xs text-gray-500 text-center">
                  By continuing, you agree to receive SMS updates about your bookings.
                  Your data is secure and will never be shared.
                </p>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
