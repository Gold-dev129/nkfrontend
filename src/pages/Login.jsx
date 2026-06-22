import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure, clearAuthError } from '../redux/slices/authSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const from = redirectParam ? `/${redirectParam}` : (location.state?.from?.pathname || '/');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    dispatch(authStart());
    try {
      const response = await api.post('/auth/login', { email, password });
      dispatch(authSuccess({
        user: response.data.user,
        token: response.data.token
      }));
      toast.success(`Welcome back, ${response.data.user.name}!`);
      
      // Redirect
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      dispatch(authFailure(errMsg));
      toast.error(errMsg);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-10 bg-luxury-cream">
      <div className="w-full max-w-md bg-white p-8 border border-luxury-gold/20 shadow-xl">
        <div className="text-center mb-8">
          <p className="text-luxury-gold uppercase tracking-luxury text-[10px] font-semibold">Welcome Back</p>
          <h2 className="font-serif text-2xl text-luxury-black mt-2">Sign In</h2>
          <div className="w-12 h-[1px] bg-luxury-gold mx-auto mt-4"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 font-sans text-xs">
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
            <div className="flex justify-between items-center mb-2">
              <label className="block uppercase tracking-wider text-luxury-gray font-semibold">Password</label>
              <Link to="/forgot-password" className="text-luxury-gold hover:underline">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) dispatch(clearAuthError());
              }}
              className="w-full bg-transparent border border-luxury-gold/20 px-4 py-3 focus:outline-none focus:border-luxury-gold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-luxury-black text-white font-semibold uppercase tracking-luxury py-4 border border-luxury-gold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center font-sans text-xs text-luxury-gray">
          <span>New to NKYLUXURY? </span>
          <Link to={redirectParam ? `/register?redirect=${redirectParam}` : "/register"} className="text-luxury-gold font-semibold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
