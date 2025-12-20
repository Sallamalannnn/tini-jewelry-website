import type { Metadata } from 'next';
import { Inter, Playfair_Display, Cinzel } from 'next/font/google';
import './globals.css';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tını - Giyim & Aksesuar',
  description: 'Zarif takı ve aksesuarlar için premium e-ticaret deneyimi.',
};

import { AuthProvider } from '@/context/AuthContext';
import ComingSoon from '@/components/layout/ComingSoon';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMaintenanceMode = process.env.NODE_ENV === 'production';

  return (
    <html lang="tr">
      <body className={clsx(inter.className, playfair.variable, cinzel.variable)}>
        {isMaintenanceMode ? (
          <ComingSoon />
        ) : (
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <CartDrawer />
              <main style={{ minHeight: '80vh' }}>
                {children}
              </main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        )}
      </body>
    </html>
  );
}
