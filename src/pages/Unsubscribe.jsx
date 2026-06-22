import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiMail, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const Unsubscribe = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await api.post('/newsletter/unsubscribe', { email });
      if (response.data.status === 'success') {
        setSuccess(true);
        toast.success(response.data.message || 'Unsubscribed successfully.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unsubscribe. Please verify the email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-20 bg-luxury-cream">
      <div className="w-full max-w-md bg-white p-8 border border-luxury-gold/20 shadow-xl text-center">
        {success ? (
          <div className="space-y-6">
            <FiCheckCircle className="text-5xl text-luxury-gold mx-auto animate-bounce" />
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-luxury-black uppercase tracking-wide">Unsubscribed</h2>
              <p className="font-sans text-xs text-luxury-gray leading-relaxed">
                You have been successfully removed from our newsletter subscription list. You will no longer receive any broadcast marketing emails from NKYLUXURY.
              </p>
            </div>
            <Link
              to="/"
              className="mt-6 w-full bg-luxury-black text-white border border-luxury-gold py-4 uppercase tracking-widest font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all inline-block text-[10px]"
            >
              Return to Homepage
            </Link>
          </div>
        ) : (
          <div className="space-y-6 font-sans text-xs">
            <div className="space-y-2">
              <p className="text-luxury-gold uppercase tracking-luxury text-[9px] font-semibold">Subscription Settings</p>
              <h2 className="font-serif text-2xl text-luxury-black uppercase tracking-wide">Unsubscribe</h2>
              <div className="w-12 h-[1px] bg-luxury-gold mx-auto mt-4"></div>
              <p className="text-luxury-gray leading-relaxed text-[11px] pt-2">
                We are sorry to see you go. Enter your registered email address below to stop receiving newsletter broadcasts from us.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block uppercase tracking-wider text-luxury-gray mb-2 font-semibold">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-luxury-gold text-sm">
                    <FiMail />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-transparent border border-luxury-gold/20 pl-10 pr-4 py-3 focus:outline-none focus:border-luxury-gold text-slate-900"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-luxury-black text-white border border-luxury-gold py-4 uppercase tracking-widest font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all cursor-pointer text-[10px]"
              >
                {loading ? 'Processing...' : 'Confirm Unsubscribe'}
              </button>
            </form>

            <Link
              to="/"
              className="block text-center text-luxury-gray hover:text-luxury-gold hover:underline uppercase text-[9px] tracking-widest font-semibold"
            >
              Cancel and Return
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
