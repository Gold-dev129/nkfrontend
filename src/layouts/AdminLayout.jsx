import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { clearCartState } from '../redux/slices/cartSlice';
import { clearWishlistState } from '../redux/slices/wishlistSlice';
import { Toaster } from 'react-hot-toast';
import { 
  FiGrid, FiPackage, FiFolder, FiShoppingBag, FiUsers, 
  FiMessageSquare, FiImage, FiSettings, FiExternalLink, FiLogOut 
} from 'react-icons/fi';

const AdminLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

      {/* Admin Sidebar */}
      <aside className="w-64 bg-luxury-black text-luxury-white flex flex-col justify-between border-r border-luxury-gold/20 z-20">
        <div>
          {/* Header/Brand */}
          <div className="p-6 border-b border-luxury-gold/10">
            <Link to="/" className="block">
              <span className="font-serif text-lg font-semibold tracking-luxury text-luxury-gold uppercase">NKYLUXURY</span>
            </Link>
            <span className="text-[9px] font-sans tracking-widest text-luxury-gray uppercase block mt-1">Admin Management</span>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
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
        <header className="h-16 bg-luxury-black border-b border-luxury-gold/20 flex justify-between items-center px-8 text-luxury-white">
          <h1 className="font-serif text-lg text-luxury-gold tracking-wide">
            {menuItems.find(item => item.path === location.pathname)?.name || 'Portal'}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="font-sans text-xs uppercase tracking-widest text-luxury-gray">
              Greetings, <strong className="text-luxury-gold">{user?.name}</strong>
            </span>
          </div>
        </header>

        {/* Main Scrolling Container */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
