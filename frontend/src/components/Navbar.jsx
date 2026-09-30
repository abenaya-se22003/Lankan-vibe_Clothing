import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  FiShoppingBag,
  FiUser,
  FiLogOut,
  FiSearch,
  FiMenu,
  FiX,
  FiShield,
  FiPackage,
  FiArrowRight,
} from 'react-icons/fi';

export const CATEGORY_LINKS = [
  { name: 'Women', slug: 'women', path: '/category/women' },
  { name: 'Men', slug: 'men', path: '/category/men' },
  { name: 'Unisex', slug: 'unisex', path: '/category/unisex' },
  { name: 'Accessories', slug: 'accessories', path: '/category/accessories' },
];

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Transparent navbar only on homepage when at top & menu/search closed
  const isHomePage = location.pathname === '/' && !location.search;
  const isTransparent = isHomePage && !scrolled && !mobileMenuOpen && !searchOpen;

  // Track scroll for transparent → solid transition with subtle border/shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close menus on Escape or outside click
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target) &&
        !e.target.closest('[data-search-toggle]')
      ) {
        setSearchOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen, mobileMenuOpen]);

  // Auto-close open drawers and menus on route change
  useEffect(() => {
    setSearchOpen(false);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const isCategoryActive = (linkPath) => {
    return location.pathname.toLowerCase() === linkPath.toLowerCase();
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isTransparent
            ? 'bg-transparent text-white'
            : 'bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-xs text-neutral-900'
        }`}
      >
        {/* ——— Main Single-Row Navbar Container ——— */}
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between"
          aria-label="Main Navigation"
        >
          {/* ============================================================
              1. LEFT: Logo
              ============================================================ */}
          <div className="flex items-center shrink-0">
            <Link
              to="/"
              className={`inline-flex items-center gap-1 group tracking-[0.14em] uppercase focus:outline-none transition-colors rounded ${
                isTransparent ? 'text-white' : 'text-neutral-900'
              }`}
              aria-label="Lankan Vibe Homepage"
            >
              <span className="text-xl sm:text-2xl font-black transition-opacity group-hover:opacity-80">
                LANKAN
              </span>
              <span className="text-xl sm:text-2xl font-light tracking-[0.08em] transition-opacity group-hover:opacity-80">
                VIBE
              </span>
            </Link>
          </div>

          {/* ============================================================
              2. CENTER: Category Navigation Links (hidden below md)
              ============================================================ */}
          <div className="hidden md:flex items-center justify-center space-x-8 lg:space-x-10">
            {CATEGORY_LINKS.map((cat) => {
              const active = isCategoryActive(cat.path);
              return (
                <Link
                  key={cat.slug}
                  to={cat.path}
                  className={`relative py-2 text-xs lg:text-[13px] font-semibold tracking-[0.2em] uppercase transition-colors duration-200 ${
                    active
                      ? isTransparent ? 'text-white font-bold' : 'text-neutral-950 font-bold'
                      : isTransparent
                      ? 'text-white/80 hover:text-white'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {cat.name}
                  {/* Active highlight indicator underline */}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-300 ${
                      active
                        ? isTransparent ? 'w-full bg-white' : 'w-full bg-neutral-950'
                        : 'w-0 bg-transparent group-hover:w-full'
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* ============================================================
              3. RIGHT: Search, Cart, User area + Mobile Toggle
              ============================================================ */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Icon / Toggle */}
            <button
              type="button"
              data-search-toggle
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-full transition-colors duration-200 focus:outline-none ${
                isTransparent
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100'
              }`}
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              aria-expanded={searchOpen}
            >
              <FiSearch className="w-5 h-5 stroke-[1.75]" />
            </button>

            {/* User Area */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`p-2 rounded-full flex items-center transition-colors duration-200 focus:outline-none ${
                    isTransparent
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100'
                  }`}
                  aria-label="Open user account menu"
                  aria-expanded={userDropdownOpen}
                >
                  <FiUser className="w-5 h-5 stroke-[1.75]" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-neutral-200 p-2 shadow-2xl z-50 animate-fade-in text-sm text-neutral-900">
                    <div className="px-3 py-2.5 border-b border-neutral-100 mb-1">
                      <p className="text-xs font-bold text-neutral-900 truncate">
                        {user?.fullName || 'Island Member'}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg transition"
                    >
                      <FiPackage className="text-base text-neutral-900" />
                      <span>My Orders</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      >
                        <FiShield className="text-base" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition text-left mt-1"
                    >
                      <FiLogOut className="text-base" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={`p-2 rounded-full transition-colors duration-200 focus:outline-none ${
                  isTransparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100'
                }`}
                aria-label="Sign in to your account"
              >
                <FiUser className="w-5 h-5 stroke-[1.75]" />
              </Link>
            )}

            {/* Shopping Cart with dynamic count badge */}
            <Link
              to="/cart"
              className={`relative p-2 rounded-full transition-colors duration-200 focus:outline-none ${
                isTransparent
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100'
              }`}
              aria-label={`Shopping Cart with ${cartCount} items`}
            >
              <FiShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {cartCount > 0 && (
                <span className={`absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full font-bold text-[10px] flex items-center justify-center leading-none shadow-sm ${
                  isTransparent ? 'bg-white text-black' : 'bg-neutral-950 text-white'
                }`}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors duration-200 focus:outline-none ${
                isTransparent
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100'
              }`}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open category menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6 stroke-[1.75]" />
              ) : (
                <FiMenu className="w-6 h-6 stroke-[1.75]" />
              )}
            </button>
          </div>
        </nav>

        {/* ——— Dedicated Search Bar Overlay ——— */}
        {searchOpen && (
          <div
            ref={searchContainerRef}
            className="bg-white/98 border-t border-neutral-200 px-4 py-4 sm:py-5 backdrop-blur-xl animate-fade-in shadow-xl text-neutral-900"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-3xl mx-auto flex items-center gap-3"
            >
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-base" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search Lankan Vibe (e.g. Batik, Sarong, Linen, Shirt)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-100 border border-neutral-300 focus:border-neutral-900 text-neutral-900 placeholder-neutral-500 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-lg transition"
                aria-label="Close search"
              >
                <FiX className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* ——— Mobile Slide-in Drawer with Backdrop ——— */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm h-full bg-white border-l border-neutral-200 shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto text-neutral-900">
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-black tracking-[0.14em] uppercase text-neutral-900"
                >
                  LANKAN<span className="font-light"> VIBE</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
                  aria-label="Close mobile navigation menu"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Category Links Navigation */}
              <div className="py-6 space-y-1">
                <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-3 px-3">
                  Categories
                </p>
                {CATEGORY_LINKS.map((cat) => {
                  const active = isCategoryActive(cat.path);
                  return (
                    <Link
                      key={cat.slug}
                      to={cat.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-3.5 rounded-xl text-sm font-semibold tracking-wider uppercase transition ${
                        active
                          ? 'bg-neutral-100 text-neutral-950 font-bold'
                          : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950'
                      }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span>{cat.name}</span>
                      <FiArrowRight className="w-4 h-4 opacity-50" />
                    </Link>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-neutral-100 space-y-1">
                  <Link
                    to="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition"
                  >
                    All Collections
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition"
                  >
                    Our Heritage & Story
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom User / Account Section */}
            <div className="pt-6 border-t border-neutral-200 space-y-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-3 py-1">
                    <p className="text-xs font-semibold text-neutral-900 truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:text-neutral-950 rounded-lg hover:bg-neutral-100 transition"
                  >
                    <FiPackage className="text-neutral-900" />
                    <span>My Orders</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 rounded-lg transition"
                    >
                      <FiShield />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition text-left"
                  >
                    <FiLogOut />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-semibold tracking-wider uppercase rounded-xl border border-neutral-300 text-neutral-900 hover:bg-neutral-100 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-semibold tracking-wider uppercase rounded-xl bg-neutral-900 text-white hover:bg-black transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
