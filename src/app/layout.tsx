import type { Metadata } from 'next';
import './globals.css';
import { UIProvider } from '@/components/ui-context';
import { BranchProvider } from '@/components/branch-context';
import { CatalogProvider } from '@/components/catalog-context';
import { CartProvider } from '@/components/cart-context';
import { PrefsProvider } from '@/components/prefs-context';
import BranchModal from '@/components/BranchModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomTabs from '@/components/BottomTabs';
import MenuDrawer from '@/components/MenuDrawer';
import OrderModal from '@/components/OrderModal';
import StickyCart from '@/components/StickyCart';
import Toaster from '@/components/Toaster';
import FloatingContact from '@/components/FloatingContact';
import DocModal from '@/components/DocModal';
import AuthModal from '@/components/AuthModal';

export const metadata: Metadata = {
  title: 'Bondok Fried Chicken',
  description: 'Bondok Fried Chicken — order golden, crispy fried chicken for pickup or delivery.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UIProvider>
          <BranchProvider>
          <CatalogProvider>
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
            <DocModal />
            <AuthModal />
            <BranchModal />
          </PrefsProvider>
          </CartProvider>
          </CatalogProvider>
          </BranchProvider>
        </UIProvider>
      </body>
    </html>
  );
}
