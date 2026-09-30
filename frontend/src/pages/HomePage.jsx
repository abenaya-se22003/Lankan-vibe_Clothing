import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import NewArrivals from '../components/home/NewArrivals';
import { FiArrowRight } from 'react-icons/fi';

const HERO_VIDEO_URL =
  'https://res.cloudinary.com/dprastyf2/video/upload/v1790776157/gemini_generated_video_fbf97709.mp4';

const HomePage = () => {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const videoRef = useRef(null);

  return (
    <div className="w-full">
      {/* ============================================================
          1. HERO SECTION — Full viewport video background
          ============================================================ */}
      <section className="hero-video-section relative w-full h-screen overflow-hidden">
        {/* Background Video */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            heroLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          src={HERO_VIDEO_URL}
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={() => setHeroLoaded(true)}
        />

        {/* Dark overlay gradients for CARNAGE look */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/50 pointer-events-none" />

        {/* Fallback loading shimmer */}
        {!heroLoaded && (
          <div className="absolute inset-0 bg-[#0b0c16] flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-white/40 border-t-transparent animate-spin" />
          </div>
        )}

        {/* Hero Content — bottom-left positioned like CARNAGE reference */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex flex-col justify-end pb-14 sm:pb-18 lg:pb-20">
          <div className="max-w-3xl text-left animate-hero-fade-up">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black italic uppercase text-white tracking-tight leading-[0.92] mb-3 drop-shadow-2xl">
              BE BETTER EVERYDAY
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-white/90 font-normal tracking-wide mb-6">
              Explore our Collection
            </p>

            <div className="flex items-center">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-3.5 bg-black hover:bg-white text-white hover:text-black text-xs sm:text-sm font-bold tracking-[0.2em] uppercase transition-all duration-200 border border-white/20 hover:border-white shadow-2xl"
              >
                All Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. NEW ARRIVALS — Auto-Scrolling Marquee Section
          ============================================================ */}
      <NewArrivals />

      {/* ============================================================
          3. EDITORIAL CAMPAIGN BANNER (Cloudinary Image)
          ============================================================ */}
      <section className="relative w-full my-6 sm:my-10 overflow-hidden">
        <Link
          to="/shop"
          className="group block relative w-full h-[55vh] sm:h-[70vh] lg:h-[85vh] overflow-hidden"
          aria-label="Explore The Streetwear Edit"
        >
          <img
            src="https://res.cloudinary.com/dprastyf2/image/upload/v1790787417/pexels-cottonbro-6069980.jpg"
            alt="Lankan Vibe Streetwear Editorial"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20 pointer-events-none" />

          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-14 lg:p-20 text-left">
            <div className="max-w-2xl space-y-3">
              <span className="inline-block text-[11px] font-bold tracking-[0.25em] uppercase text-white/80 border-b border-white/40 pb-1">
                Editorial Campaign
              </span>
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black italic uppercase tracking-tight text-white leading-none drop-shadow-xl">
                THE STREETWEAR EDIT
              </h2>
              <p className="text-sm sm:text-base text-white/90 max-w-lg font-normal drop-shadow">
                Bold silhouettes, premium craft, and authentic island spirit. Engineered for everyday distinction.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center justify-center px-8 sm:px-10 py-3.5 bg-white text-black font-bold text-xs sm:text-sm tracking-[0.2em] uppercase transition-all duration-300 group-hover:bg-black group-hover:text-white group-hover:border group-hover:border-white shadow-2xl">
                  Shop The Edit
                </span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* ============================================================
          4. BRAND STORY & TEES SPLIT SECTION (CARNAGE / LCY Style)
          ============================================================ */}
      <section className="relative w-full mt-10 sm:mt-16 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px] lg:min-h-[580px] bg-[#54504b]">
          {/* LEFT: Business Story & Modern Society Brand Statement (White Mix Ash Studio Theme) */}
          <div className="flex flex-col justify-center px-8 sm:px-14 lg:px-20 py-12 sm:py-16 text-left text-white bg-gradient-to-b from-[#68635e] via-[#5d5953] to-[#54504b]">
            <div className="max-w-xl space-y-5">
              <span className="inline-block text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-white/80">
                LANKAN VIBE | PRINTED & BRANDED TEES
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15] drop-shadow-sm">
                It’s not just what you wear.
                <br />
                It’s how it lets you feel.
              </h2>

              <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
                Engineered for the modern society, our signature printed and branded T-shirts blend contemporary urban street culture with authentic Sri Lankan craftsmanship. Built with high-density combed Ceylon cotton, clean silhouette cuts, and resilient graphic prints that deliver effortless confidence and breathable comfort in every movement.
              </p>

              <div className="pt-3">
                <Link
                  to="/shop?category=Casual"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-white hover:text-white/80 transition-colors border-b-2 border-white pb-1"
                >
                  <span>Explore Branded Tees</span>
                  <FiArrowRight className="text-sm" />
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT: Cloudinary High-Fashion Studio Image */}
          <div className="relative w-full h-[400px] md:h-auto min-h-[420px] overflow-hidden group">
            <img
              src="https://res.cloudinary.com/dprastyf2/image/upload/v1790787412/pexels-itsbrunoagain-29087298.jpg"
              alt="Lankan Vibe Branded Modern Society T-shirt"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
