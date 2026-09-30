import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: 'Colombo',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('Please complete all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      toast.success('Ayubowan! Welcome to Lankan Vibe.');
      navigate(redirect);
    } catch (err) {
      console.error('Registration error', err);
      toast.error(err.response?.data?.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#e94560] to-[#c9a84c] flex items-center justify-center shadow-lg">
              <span className="text-lg font-black text-white">LV</span>
            </div>
            <span className="text-2xl font-black text-white">
              LANKAN <span className="text-[#e94560]">VIBE</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white tracking-tight">Join the Island Vibe Community</h2>
          <p className="text-xs text-gray-400">
            Create an account to track handcrafted orders and write verified reviews
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-3xl bg-[#111424] border border-[#1e233d] shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  First Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="e.g. Kasun"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0c0e1a] text-xs text-white placeholder-gray-500 rounded-xl pl-9 pr-3 py-3 border border-[#232742] focus:outline-none focus:border-[#e94560]"
                  />
                  <FiUser className="absolute left-3 top-3.5 text-gray-500 text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="e.g. Perera"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0c0e1a] text-xs text-white placeholder-gray-500 rounded-xl px-3 py-3 border border-[#232742] focus:outline-none focus:border-[#e94560]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. kasun@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0c0e1a] text-xs text-white placeholder-gray-500 rounded-xl pl-9 pr-3 py-3 border border-[#232742] focus:outline-none focus:border-[#e94560]"
                />
                <FiMail className="absolute left-3 top-3.5 text-gray-500 text-xs" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Password * (min 6 characters)
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0c0e1a] text-xs text-white placeholder-gray-500 rounded-xl pl-9 pr-3 py-3 border border-[#232742] focus:outline-none focus:border-[#e94560]"
                />
                <FiLock className="absolute left-3 top-3.5 text-gray-500 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+94 77 123 4567"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#0c0e1a] text-xs text-white placeholder-gray-500 rounded-xl pl-9 pr-3 py-3 border border-[#232742] focus:outline-none focus:border-[#e94560]"
                  />
                  <FiPhone className="absolute left-3 top-3.5 text-gray-500 text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  City / District
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-[#0c0e1a] text-xs text-white rounded-xl px-3 py-3 border border-[#232742] focus:outline-none focus:border-[#e94560] cursor-pointer"
                >
                  <option value="Colombo">Colombo</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                  <option value="Negombo">Negombo</option>
                  <option value="Matara">Matara</option>
                  <option value="Kurunegala">Kurunegala</option>
                  <option value="Jaffna">Jaffna</option>
                  <option value="Other">Other Island Location</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Delivery Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  placeholder="Street name, apt / house number"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-[#0c0e1a] text-xs text-white placeholder-gray-500 rounded-xl pl-9 pr-3 py-3 border border-[#232742] focus:outline-none focus:border-[#e94560]"
                />
                <FiMapPin className="absolute left-3 top-3.5 text-gray-500 text-xs" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#e94560] to-[#c9a84c] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#e94560]/20 hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
              <FiArrowRight />
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-[#1e233d]">
            Already have an account?{' '}
            <Link
              to={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="text-[#e94560] font-semibold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
