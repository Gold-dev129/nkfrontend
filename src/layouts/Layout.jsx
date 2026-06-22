import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Toaster } from 'react-hot-toast';
import WhatsAppWidget from '../components/WhatsAppWidget';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-luxury-cream">
      {/* Toast notifications handler */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#121212',
            color: '#D4AF37',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '0px',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '12px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          },
          success: {
            iconTheme: {
              primary: '#D4AF37',
              secondary: '#121212',
            },
          },
        }}
      />
      
      <Navbar />
      
      <main className="flex-grow pt-24">
        <Outlet />
      </main>
      
      {/* Floating WhatsApp Bubble Component */}
      <WhatsAppWidget />

      <Footer />
    </div>
  );
};

export default Layout;
