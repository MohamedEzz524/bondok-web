import type { Metadata } from 'next';
import './globals.css';
import { UIProvider } from '@/components/ui-context';
import { CartProvider } from '@/components/cart-context';
import { PrefsProvider } from '@/components/prefs-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomTabs from '@/components/BottomTabs';
import MenuDrawer from '@/components/MenuDrawer';
import OrderModal from '@/components/OrderModal';
import StickyCart from '@/components/StickyCart';
import Toaster from '@/components/Toaster';
import FloatingContact from '@/components/FloatingContact';

export const metadata: Metadata = {
  title: 'Bondok Fried Chicken',
  description: 'Bondok Fried Chicken — order golden, crispy fried chicken for pickup or delivery.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UIProvider>
          <CartProvider>
          <PrefsProvider>
            <Header />
            <main className="page">{children}</main>
            <Footer />
            <BottomTabs />
            <MenuDrawer />
            <OrderModal />
            <StickyCart />
            <Toaster />
            <FloatingContact />
          </PrefsProvider>
          </CartProvider>
        </UIProvider>
      </body>
    </html>
  );
}
