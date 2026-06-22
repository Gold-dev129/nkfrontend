import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/forgotpassword', { email });
      toast.success(response.data.message || 'Check your inbox for a reset link.');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-10 bg-luxury-cream">
      <div className="w-full max-w-md bg-white p-8 border border-luxury-gold/20 shadow-xl">
        <div className="text-center mb-8">
          <p className="text-luxury-gold uppercase tracking-luxury text-[10px] font-semibold">Security Portal</p>
          <h2 className="font-serif text-2xl text-luxury-black mt-2">Reset Password</h2>
          <p className="font-sans text-xs text-luxury-gray mt-2 leading-relaxed">
            Enter your account email below. We will send you an authentication link to choose a new password.
          </p>
          <div className="w-12 h-[1px] bg-luxury-gold mx-auto mt-4"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 font-sans text-xs">
          <div>
            <label className="block uppercase tracking-wider text-luxury-gray mb-2 font-semibold">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-luxury-gold/20 px-4 py-3 focus:outline-none focus:border-luxury-gold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-luxury-black text-white font-semibold uppercase tracking-luxury py-4 border border-luxury-gold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300"
          >
            {loading ? 'Processing...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-8 text-center font-sans text-xs text-luxury-gray">
          <span>Remember your details? </span>
          <Link to="/login" className="text-luxury-gold font-semibold hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
