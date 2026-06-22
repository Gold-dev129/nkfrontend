import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { clearCartState } from '../redux/slices/cartSlice';
import { clearWishlistState } from '../redux/slices/wishlistSlice';
import { Toaster } from 'react-hot-toast';
import { 
  FiGrid, FiPackage, FiFolder, FiShoppingBag, FiUsers, 
  FiMessageSquare, FiImage, FiSettings, FiExternalLink, FiLogOut,
  FiMenu, FiX, FiTag, FiEdit
} from 'react-icons/fi';

const AdminLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCartState());
    dispatch(clearWishlistState());
    navigate('/login');
  };

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: <FiGrid /> },
    { name: 'Products', path: '/admin/products', icon: <FiPackage /> },
    { name: 'Categories', path: '/admin/categories', icon: <FiFolder /> },
    { name: 'Orders', path: '/admin/orders', icon: <FiShoppingBag /> },
    { name: 'Customers', path: '/admin/customers', icon: <FiUsers /> },
    { name: 'Bespoke Inquiries', path: '/admin/custom-inquiries', icon: <FiEdit /> },
    { name: 'Coupons', path: '/admin/coupons', icon: <FiTag /> },
    { name: 'Reviews', path: '/admin/reviews', icon: <FiMessageSquare /> },
    { name: 'Banners', path: '/admin/banners', icon: <FiImage /> },
    { name: 'Settings', path: '/admin/settings', icon: <FiSettings /> }
  ];

  return (
    <div className="flex h-screen bg-luxury-cream overflow-hidden">
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
          }
        }}
      />

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`fixed inset-y-0 left-0 lg:static w-64 bg-luxury-black text-luxury-white flex flex-col justify-between border-r border-luxury-gold/20 z-40 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div>
          {/* Header/Brand */}
          <div className="p-6 border-b border-luxury-gold/10 flex justify-between items-center">
            <Link to="/" className="block" onClick={() => setIsSidebarOpen(false)}>
              <span className="font-serif text-lg font-semibold tracking-luxury text-luxury-gold uppercase">NKYLUXURY</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-luxury-gray hover:text-white transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 text-xs uppercase tracking-widest transition-all duration-200 ${
                    isActive
                      ? 'bg-luxury-gold text-luxury-black font-semibold'
                      : 'hover:bg-luxury-gold/10 hover:text-luxury-gold'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-luxury-gold/10 space-y-1">
          <Link
            to="/"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center space-x-3 px-4 py-3 text-xs uppercase tracking-widest hover:bg-luxury-gold/10 hover:text-luxury-gold transition-colors text-luxury-gray"
          >
            <FiExternalLink />
            <span>Go to Shop</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-xs uppercase tracking-widest text-left text-red-400 hover:bg-red-950 hover:text-white transition-colors"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Dashboard */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-luxury-black border-b border-luxury-gold/20 flex justify-between items-center px-6 lg:px-8 text-luxury-white">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 text-luxury-gold hover:text-white transition-colors cursor-pointer"
              aria-label="Open sidebar"
            >
              <FiMenu className="text-xl" />
            </button>
            <h1 className="font-serif text-sm lg:text-lg text-luxury-gold tracking-wide">
              {menuItems.find(item => item.path === location.pathname)?.name || 'Portal'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-sans text-xs uppercase tracking-widest text-luxury-gray hidden sm:inline">
              Greetings, <strong className="text-luxury-gold">{user?.name}</strong>
            </span>
          </div>
        </header>

        {/* Main Scrolling Container */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
