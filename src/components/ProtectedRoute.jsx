import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  // If redux is still loading rehydrated state, show a basic luxury loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-luxury-cream">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-luxury-gold mx-auto"></div>
          <p className="mt-4 font-serif text-sm tracking-luxury uppercase text-luxury-gold">Loading NKYLUXURY...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    // Redirect to home if they are not an admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
