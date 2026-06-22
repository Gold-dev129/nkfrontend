import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure, clearAuthError } from '../redux/slices/authSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Register = () => {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    dispatch(authStart());
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        phoneNumber
      });
      dispatch(authSuccess({
        user: response.data.user,
        token: response.data.token
      }));
      toast.success(`Registration successful! Welcome, ${response.data.user.name}.`);
      const redirect = searchParams.get('redirect');
      navigate(redirect ? `/${redirect}` : '/dashboard');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Please check inputs.';
      dispatch(authFailure(errMsg));
      toast.error(errMsg);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-10 bg-luxury-cream">
      <div className="w-full max-w-md bg-white p-8 border border-luxury-gold/20 shadow-xl">
        <div className="text-center mb-8">
          <p className="text-luxury-gold uppercase tracking-luxury text-[10px] font-semibold">Join the Club</p>
          <h2 className="font-serif text-2xl text-luxury-black mt-2">Create Account</h2>
          <div className="w-12 h-[1px] bg-luxury-gold mx-auto mt-4"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 font-sans text-xs">
          <div>
            <label className="block uppercase tracking-wider text-luxury-gray mb-2 font-semibold">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) dispatch(clearAuthError());
              }}
              className="w-full bg-transparent border border-luxury-gold/20 px-4 py-3 focus:outline-none focus:border-luxury-gold"
              required
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider text-luxury-gray mb-2 font-semibold">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) dispatch(clearAuthError());
              }}
              className="w-full bg-transparent border border-luxury-gold/20 px-4 py-3 focus:outline-none focus:border-luxury-gold"
              required
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider text-luxury-gray mb-2 font-semibold">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (error) dispatch(clearAuthError());
              }}
              className="w-full bg-transparent border border-luxury-gold/20 px-4 py-3 focus:outline-none focus:border-luxury-gold"
              placeholder="+234..."
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider text-luxury-gray mb-2 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) dispatch(clearAuthError());
              }}
              className="w-full bg-transparent border border-luxury-gold/20 px-4 py-3 focus:outline-none focus:border-luxury-gold"
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-luxury-black text-white font-semibold uppercase tracking-luxury py-4 border border-luxury-gold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center font-sans text-xs text-luxury-gray">
          <span>Already have an account? </span>
          <Link to={searchParams.get('redirect') ? `/login?redirect=${searchParams.get('redirect')}` : "/login"} className="text-luxury-gold font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
