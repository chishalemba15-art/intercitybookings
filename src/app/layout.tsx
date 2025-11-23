import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/context/ThemeContext';
import MobileBottomNav from '@/components/MobileBottomNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'IntercityBookings | Fast Bus Tickets in Zambia',
  description:
    'Book intercity bus tickets in Zambia instantly. Compare prices for Mazhandu, Power Tools, and more. Lusaka, Kitwe, Livingstone routes available.',
  keywords: [
    'Bus Tickets Zambia',
    'Lusaka Intercity',
    'Mazhandu Booking',
    'Power Tools Bus',
    'Online Bus Booking Zambia',
  ],
  authors: [{ name: 'IntercityBookings' }],
  themeColor: '#0f172a',
  openGraph: {
    title: 'IntercityBookings - Travel Made Simple',
    description:
      'Check schedules and book bus tickets across Zambia instantly via Mobile Money.',
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200',
    ],
    type: 'website',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
        <ThemeProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#0f172a',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            {children}
            <MobileBottomNav />
          </ThemeProvider>
      </body>
    </html>
  );
}
