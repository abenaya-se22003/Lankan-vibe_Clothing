import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiHeart, FiGlobe, FiUsers, FiAward } from 'react-icons/fi';

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 min-h-screen">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#171a2e] via-[#241728] to-[#171a2e] p-8 sm:p-14 lg:p-16 border border-[#2b3052] text-center space-y-6">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/40 text-[#f1cb68] text-xs font-bold uppercase tracking-wider">
          The Lankan Vibe Story
        </span>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-3xl mx-auto">
          Honoring Sri Lankan Heritage. Designing for the Modern World.
        </h1>
        <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Born out of love for the tropical teardrop island in the Indian Ocean, Lankan Vibe merges
          centuries-old textile mastery with contemporary island lifestyle apparel.
        </p>
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-[#111424] border border-[#1e233d] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#e94560]/10 border border-[#e94560]/30 text-[#e94560] flex items-center justify-center text-2xl">
            <FiUsers />
          </div>
          <h3 className="text-xl font-bold text-white">Artisan Empowerment</h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            We partner directly with traditional weaving families across Galle, Matale, and Kandy.
            By eliminating intermediaries, our weavers earn fair, dignified wages for their craft.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#111424] border border-[#1e233d] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] flex items-center justify-center text-2xl">
            <FiAward />
          </div>
          <h3 className="text-xl font-bold text-white">Pure Handloom & Wax Batik</h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            No synthetic mass prints. Every batik pattern is painstakingly applied by wax stylus,
            and our cottons are woven on authentic wooden handlooms for unbeatable breathability.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#111424] border border-[#1e233d] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl">
            <FiGlobe />
          </div>
          <h3 className="text-xl font-bold text-white">Eco & Island-Conscious</h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            We prioritize non-hazardous plant and AZO-free dyes, natural coconut shell buttons, and
            biodegradable packaging to protect Sri Lanka’s lush oceans and rainforests.
          </p>
        </div>
      </div>

      {/* Flagship Showroom & Studio */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#111424] border border-[#1e233d] flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <span className="text-xs font-bold text-[#e94560] uppercase tracking-wider">
            Flagship Atelier
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Visit Our Colombo Studio</h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Experience the tactile sensation of raw Ceylon handloom and pure silks. Located facing
            the Indian Ocean breeze along Marine Drive, Colombo 03.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#e94560] to-[#c9a84c] text-white font-bold text-xs shadow-lg shadow-[#e94560]/20 hover:opacity-95 transition"
            >
              <span>Explore The Store</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>

        <div className="w-full md:w-80 aspect-square rounded-2xl overflow-hidden border border-[#2b3052] shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600"
            alt="Lankan Vibe Studio"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
