import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { subscriberAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiSend,
  FiClock,
  FiPhone,
  FiMail,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiCheckCircle,
  FiShield,
  FiTruck,
  FiRefreshCw,
} from 'react-icons/fi';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setSubscribing(true);
      await subscriberAPI.subscribe(email);
      setSubscribed(true);
      setEmail('');
      toast.success('Welcome to Lankan Vibe VIP Club!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="w-full bg-[#0a0a0c] text-neutral-400 border-t border-neutral-800/80">
      {/* ——— Brand Trust Highlights Bar ——— */}
      <div className="border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-neutral-300">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
              <FiTruck className="text-lg" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">Islandwide Delivery</p>
              <p className="text-[11px] text-neutral-500">Fast 1-3 business days courier</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
              <FiClock className="text-lg" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">Daily Customer Care</p>
              <p className="text-[11px] text-neutral-400 font-semibold">MON – SUN: 9AM – 8PM</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
              <FiRefreshCw className="text-lg" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">7-Day Free Exchange</p>
              <p className="text-[11px] text-neutral-500">Hassle-free size & style swaps</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
              <FiShield className="text-lg" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">Authentic Guarantee</p>
              <p className="text-[11px] text-neutral-500">Pure Ceylon craft & quality</p>
            </div>
          </div>
        </div>
      </div>

      {/* ——— Main Footer Navigation Grid ——— */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-14 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-neutral-800/80">
          
          {/* Column 1: Brand Info (col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block group" aria-label="Lankan Vibe Homepage">
              <span className="text-2xl font-black tracking-[0.14em] uppercase text-white">
                LANKAN<span className="font-light"> VIBE</span>
              </span>
            </Link>
            <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed max-w-sm">
              Contemporary island streetwear engineered for the modern society. Built with authentic Ceylon craft, high-density combed cotton, and timeless silhouettes.
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-2.5 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram className="text-sm" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors"
                aria-label="Facebook"
              >
                <FiFacebook className="text-sm" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors"
                aria-label="Twitter"
              >
                <FiTwitter className="text-sm" />
              </a>
            </div>
          </div>

          {/* Column 2: Customer Support (HIGHLIGHTED) (col-span-3) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">
              Customer Support
            </h4>

            {/* Prominent Support Hours Card */}
            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-left space-y-1">
              <div className="flex items-center gap-2 text-white">
                <FiClock className="w-3.5 h-3.5 text-neutral-300" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Support Time</span>
              </div>
              <p className="text-xs font-bold text-white tracking-wide">
                MON to SUN 9am to 8pm
              </p>
              <p className="text-[10px] text-neutral-400">
                (Daily Colombo Local Time)
              </p>
            </div>

            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-neutral-300">
                <FiPhone className="text-neutral-400 shrink-0 text-xs" />
                <span>+94 11 234 5678 / +94 77 123 4567</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-300">
                <FiMail className="text-neutral-400 shrink-0 text-xs" />
                <a href="mailto:support@lankanvibe.com" className="hover:text-white transition">
                  support@lankanvibe.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation (col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Collections</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/category/women" className="hover:text-white transition">
                  Women
                </Link>
              </li>
              <li>
                <Link to="/category/men" className="hover:text-white transition">
                  Men
                </Link>
              </li>
              <li>
                <Link to="/category/unisex" className="hover:text-white transition">
                  Unisex
                </Link>
              </li>
              <li>
                <Link to="/category/accessories" className="hover:text-white transition">
                  Accessories
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Casual" className="hover:text-white transition">
                  Branded Tees
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Subscription (col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">VIP Club</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Get first access to limited graphic t-shirt drops and private sales.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs font-medium">
                <FiCheckCircle className="text-sm shrink-0" />
                <span>You're on the list! Check your inbox soon.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-neutral-900 text-xs text-white placeholder-neutral-500 rounded-xl pl-3.5 pr-10 py-2.5 border border-neutral-800 focus:outline-none focus:border-white transition"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="absolute right-1 top-1 bottom-1 px-3 bg-white text-black font-bold rounded-lg text-xs flex items-center justify-center hover:bg-neutral-200 transition disabled:opacity-50"
                    aria-label="Subscribe to newsletter"
                  >
                    <FiSend className="text-xs" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ——— Bottom Copyright Bar ——— */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} LANKAN VIBE CLOTHING. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center space-x-6 text-[11px]">
            <span className="text-neutral-400 font-medium">Support: MON–SUN 9AM–8PM</span>
            <Link to="/about" className="hover:text-white transition">About Us</Link>
            <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
