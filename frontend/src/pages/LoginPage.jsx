import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight, FiShield } from 'react-icons/fi';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      toast.success('Ayubowan! Successfully logged in.');
      navigate(redirect);
    } catch (err) {
      console.error('Login error', err);
      toast.error(
        err.response?.data?.message || 'Invalid email or password. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@lankanvibe.com');
    setPassword('password123');
    toast.success('Admin credentials filled!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#e94560] to-[#c9a84c] flex items-center justify-center shadow-lg">
              <span className="text-lg font-black text-white">LV</span>
            </div>
            <span className="text-2xl font-black text-white">
              LANKAN <span className="text-[#e94560]">VIBE</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white tracking-tight">Welcome Back to the Island</h2>
          <p className="text-xs text-gray-400">Sign in to your account to manage orders, wishlist, and reviews</p>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-3xl bg-[#111424] border border-[#1e233d] shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#0c0e1a] text-xs text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 border border-[#232742] focus:outline-none focus:border-[#e94560]"
                />
                <FiMail className="absolute left-3.5 top-3.5 text-gray-500 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#0c0e1a] text-xs text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 border border-[#232742] focus:outline-none focus:border-[#e94560]"
                />
                <FiLock className="absolute left-3.5 top-3.5 text-gray-500 text-sm" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#e94560] to-[#c9a84c] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#e94560]/20 hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <FiArrowRight />
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="pt-4 border-t border-[#1e233d] space-y-2">
            <span className="block text-[11px] text-gray-400 text-center font-medium">
              Testing Admin Dashboard or Customer Review?
            </span>
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="w-full py-2.5 rounded-xl bg-[#171b30] border border-[#c9a84c]/30 text-[#f1cb68] hover:bg-[#c9a84c]/15 text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <FiShield className="text-sm" />
              <span>Fill Admin Demo (admin@lankanvibe.com)</span>
            </button>
          </div>

          <div className="text-center text-xs text-gray-400">
            Don't have an account yet?{' '}
            <Link
              to={`/register?redirect=${encodeURIComponent(redirect)}`}
              className="text-[#e94560] font-semibold hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
