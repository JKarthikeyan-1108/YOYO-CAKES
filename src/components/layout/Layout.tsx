import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import ScrollToTop from '@/components/common/ScrollToTop';
import RouteProgressBar from '@/components/common/RouteProgressBar';
import MobileAppInstallBanner from '@/components/common/MobileAppInstallBanner';
import OfflineNotice from '@/components/common/OfflineNotice';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <OfflineNotice />
      <MobileAppInstallBanner />
      <ScrollToTop />
      <RouteProgressBar />
      <Navbar />
      <main key={location.pathname} className="flex-1 page-transition-wrapper pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#3D2417',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#4A9D6E',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#C74A4A',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}
