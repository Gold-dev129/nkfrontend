import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiInstagram, FiFacebook, FiTwitter, FiMail } from 'react-icons/fi';
import { SiGmail } from 'react-icons/si';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await api.post('/newsletter/subscribe', { email });
      toast.success(response.data.message || 'Subscribed successfully!');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Subscription failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-slate-50 text-slate-800 pt-16 pb-8 border-t border-slate-200 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Column 1: Brand */}
        <div className="space-y-4">
          <h2 className="font-bold text-sm tracking-widest uppercase text-slate-900">NKYLUXURY</h2>
          <p className="text-slate-500 leading-relaxed font-light">
            Contemporary high-end jewelry, certified precious metals, bespoke collections, and premium watches. Engineered for the modern aesthetic.
          </p>
          <div className="flex space-x-4 pt-2 text-slate-400">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors" title="Instagram">
              <FiInstagram className="text-lg" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors" title="Facebook">
              <FiFacebook className="text-lg" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors" title="Twitter">
              <FiTwitter className="text-lg" />
            </a>
            <a href="mailto:ajaniadenike8@gmail.com" className="hover:text-slate-900 transition-colors" title="Email Concierge">
              <SiGmail className="text-lg" />
            </a>
          </div>
        </div>

        {/* Column 2: Navigation */}
        <div className="space-y-4 md:pl-12">
          <h3 className="font-semibold uppercase tracking-widest text-slate-900 text-[10px]">Explore</h3>
          <ul className="space-y-2 text-slate-500 font-light">
            <li>
              <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-slate-900 transition-colors">Shop Curation</Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-slate-900 transition-colors">FAQs</Link>
            </li>
            <li>
              <Link to="/refund-policy" className="hover:text-slate-900 transition-colors">Refund & Return Policy</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-slate-900 transition-colors">Our Story</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-slate-900 transition-colors">Contact Concierge</Link>
            </li>
            <li>
              <Link to="/order-history" className="hover:text-slate-900 transition-colors">Order History</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Newsletter */}
        <div className="space-y-4">
          <h3 className="font-semibold uppercase tracking-widest text-slate-900 text-[10px]">Newsletter</h3>
          <p className="text-slate-500 font-light leading-relaxed">
            Subscribe to receive priority access to new releases, seasonal lookbooks, and private viewings.
          </p>
          <form onSubmit={handleSubscribe} className="flex">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="YOUR EMAIL"
              className="bg-white border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-slate-800 w-full text-slate-900"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 text-white font-semibold text-xs px-4 border border-slate-900 hover:bg-slate-800 transition-all duration-300"
              aria-label="Subscribe button"
            >
              {loading ? '...' : <FiMail />}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
        <p>&copy; {new Date().getFullYear()} NKYLUXURY. All Rights Reserved.</p>
        <p className="mt-2 md:mt-0 font-light">Secure Payments via Paystack & Flutterwave</p>
      </div>
    </footer>
  );
};

export default Footer;
