import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

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
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
