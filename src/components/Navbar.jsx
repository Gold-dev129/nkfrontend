import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { clearCartState } from '../redux/slices/cartSlice';
import { clearWishlistState } from '../redux/slices/wishlistSlice';
import api from '../utils/api';

import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiHeart, FiUser, FiMenu, FiX, FiLogOut, FiSettings } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);


  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.products?.length || 0;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.categories);
      } catch (err) {
        console.error('Failed to load categories in Navbar:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCartState());
    dispatch(clearWishlistState());
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop All', path: '/shop' },
    { name: 'Bespoke', path: '/bespoke' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  if (isAuthenticated) {
    navLinks.push({ name: 'My Orders', path: '/order-history' });
  }

  categories.forEach((cat) => {
    navLinks.push({
      name: cat.name,
      path: `/shop?category=${cat.slug}`,
      isCategory: true
    });
  });

  const isActiveLink = (link) => {
    if (link.path === '/shop') {
      return location.pathname === '/shop' && !location.search.includes('category=');
    }
    if (link.isCategory) {
      const slug = link.path.split('category=')[1];
      return location.pathname === '/shop' && location.search.includes(`category=${slug}`);
    }
    return location.pathname === link.path;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md text-slate-900 shadow-sm py-4 border-b border-slate-200'
          : 'bg-transparent text-slate-900 py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-xl hover:text-slate-500 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Brand Logo - clean sans-serif spacing */}
        <Link to="/" className="flex-1 md:flex-none text-center md:text-left">
          <span className="font-sans font-bold text-lg tracking-widest uppercase text-slate-900">
            NKYLUXURY
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`font-sans text-[11px] uppercase tracking-widest font-semibold hover:text-slate-500 transition-colors relative group ${
                isActiveLink(link) ? 'text-slate-900 font-bold border-b border-slate-900 pb-1' : 'text-slate-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action Icons */}
        <div className="flex items-center space-x-5 text-slate-800">


          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative hover:text-slate-500 transition-colors"
            aria-label="Wishlist page link"
          >
            <FiHeart className="text-lg" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative hover:text-slate-500 transition-colors"
            aria-label="Cart page link"
          >
            <FiShoppingBag className="text-lg" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User drop menu */}
          <div className="relative">
            {isAuthenticated ? (
              <div>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-1 hover:text-slate-500 transition-colors"
                  aria-label="User dropdown menu trigger"
                >
                  <FiUser className="text-lg" />
                  <span className="hidden md:inline font-sans text-[10px] uppercase tracking-wider font-semibold">
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-52 bg-white text-slate-800 shadow-xl py-2 border border-slate-200 font-sans text-xs"
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[9px] text-slate-400 truncate uppercase tracking-widest">{user?.role}</p>
                      </div>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 transition-colors font-semibold uppercase tracking-wider text-[10px]"
                        >
                          <FiSettings />
                          <span>Admin Portal</span>
                        </Link>
                      )}

                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 transition-colors font-semibold uppercase tracking-wider text-[10px]"
                      >
                        <FiUser />
                        <span>My Account</span>
                      </Link>

                      <Link
                        to="/order-history"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 transition-colors font-semibold uppercase tracking-wider text-[10px]"
                      >
                        <FiShoppingBag />
                        <span>My Orders</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors font-semibold uppercase tracking-wider text-[10px]"
                      >
                        <FiLogOut />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 hover:text-slate-500 transition-colors"
                aria-label="Login page link"
              >
                <FiUser className="text-lg" />
                <span className="hidden md:inline font-sans text-[10px] uppercase tracking-widest font-semibold">
                  Sign In
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden w-full bg-white border-b border-slate-200"
          >
            <div className="flex flex-col space-y-4 px-6 py-6 font-sans text-xs">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`uppercase tracking-widest font-semibold hover:text-slate-900 transition-colors ${
                    isActiveLink(link) ? 'text-slate-900 font-bold' : 'text-slate-700'
                  } ${link.isCategory ? 'text-[10px] pl-4 text-slate-400' : 'text-xs'}`}
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="uppercase tracking-widest font-semibold text-slate-900 hover:underline"
                >
                  Admin Portal
                </Link>
              )}


            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
