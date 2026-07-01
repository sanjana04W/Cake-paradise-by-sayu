import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet, useLocation } from 'react-router';

const PublicLayout = ({ children }) => {
  const location = useLocation();
  
  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-cream font-body text-charcoal">
      <Header />
      <main className="flex-grow">
        <div
          key={location.pathname}
          style={{
            animation: 'page-slide-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
          }}
        >
          {children || <Outlet />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
