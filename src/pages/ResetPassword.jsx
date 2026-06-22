import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authSuccess } from '../redux/slices/authSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/auth/resetpassword/${token}`, { password });
      dispatch(authSuccess({
        user: response.data.user,
        token: response.data.token
      }));
      toast.success(response.data.message || 'Password reset successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error resetting password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-10 bg-luxury-cream">
      <div className="w-full max-w-md bg-white p-8 border border-luxury-gold/20 shadow-xl">
        <div className="text-center mb-8">
          <p className="text-luxury-gold uppercase tracking-luxury text-[10px] font-semibold">Security Update</p>
          <h2 className="font-serif text-2xl text-luxury-black mt-2">New Password</h2>
          <p className="font-sans text-xs text-luxury-gray mt-2 leading-relaxed">
            Please enter your new password below. Ensure it is at least 6 characters long.
          </p>
          <div className="w-12 h-[1px] bg-luxury-gold mx-auto mt-4"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 font-sans text-xs">
          <div>
            <label className="block uppercase tracking-wider text-luxury-gray mb-2 font-semibold">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-luxury-gold/20 px-4 py-3 focus:outline-none focus:border-luxury-gold"
              required
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider text-luxury-gray mb-2 font-semibold">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent border border-luxury-gold/20 px-4 py-3 focus:outline-none focus:border-luxury-gold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-luxury-black text-white font-semibold uppercase tracking-luxury py-4 border border-luxury-gold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300"
          >
            {loading ? 'Updating password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
