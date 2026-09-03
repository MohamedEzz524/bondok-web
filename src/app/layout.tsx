import type { Metadata } from 'next';
import './globals.css';
import { UIProvider } from '@/components/ui-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomTabs from '@/components/BottomTabs';
import MenuDrawer from '@/components/MenuDrawer';
import OrderModal from '@/components/OrderModal';

export const metadata: Metadata = {
  title: 'Bondok Fried Chicken',
  description: 'Bondok Fried Chicken — order golden, crispy fried chicken for pickup or delivery.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UIProvider>
          <Header />
          <main className="page">{children}</main>
          <Footer />
          <BottomTabs />
          <MenuDrawer />
          <OrderModal />
        </UIProvider>
      </body>
    </html>
  );
}
