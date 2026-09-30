import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { Product } from '../../types/product';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * Fallback curated new arrival items matching the CARNAGE aesthetic
 */
const FALLBACK_ARRIVALS: Product[] = [
  {
    id: 1,
    name: "Core Seamless Women's Tank",
    color: "Jet Black",
    price: 4550,
    category: "Women",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&auto=format&fit=crop&q=80",
    swatches: ["#171717", "#52525b"],
  },
  {
    id: 2,
    name: "Astro Tee V2 - Oversize - Unisex",
    color: "Butter Yellow",
    price: 4850,
    category: "Unisex",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&auto=format&fit=crop&q=80",
    swatches: ["#eab308", "#171717", "#15803d", "#991b1b", "#71717a", "#ffffff"],
  },
  {
    id: 3,
    name: "Aero-X Active Tank",
    color: "Olive / White",
    price: 3350,
    category: "Men",
    imageUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=700&auto=format&fit=crop&q=80",
    swatches: ["#3f4f3c", "#171717", "#ffffff"],
  },
  {
    id: 4,
    name: "Aero-X Crew Neck Tee",
    color: "Black / White",
    price: 3350,
    category: "Men",
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&auto=format&fit=crop&q=80",
    swatches: ["#171717", "#71717a", "#ffffff"],
  },
  {
    id: 5,
    name: "Signature Handloom Sarong",
    color: "Black & Natural Cotton",
    price: 3950,
    category: "Unisex",
    imageUrl: "https://res.cloudinary.com/dprastyf2/image/upload/v1790662211/OIP.webp",
    swatches: ["#171717", "#a1a1aa", "#f5f5f5"],
  },
  {
    id: 6,
    name: "Ceylon Silk Resort Wrap",
    color: "Palm Botanical",
    price: 8900,
    category: "Women",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700&auto=format&fit=crop&q=80",
    swatches: ["#262626", "#525252", "#ffffff"],
  },
];

const formatLKR = (amount: number | string): string => {
  const num = Number(amount) || 0;
  return `LKR ${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getSwatchesForProduct = (product: Product, index: number): string[] => {
  if (product.swatches && product.swatches.length > 0) {
    return product.swatches;
  }
  const defaultSets = [
    ['#171717', '#52525b', '#ffffff'],
    ['#eab308', '#171717', '#71717a', '#ffffff'],
    ['#3f4f3c', '#171717', '#ffffff'],
    ['#171717', '#a1a1aa', '#ffffff'],
  ];
  return defaultSets[index % defaultSets.length];
};

/**
 * NewArrivals Component (TypeScript) — Clean White Background Theme
 */
export const NewArrivals: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getAll();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setProducts([...data].reverse());
          } else {
            setProducts(FALLBACK_ARRIVALS);
          }
        }
      } catch (err) {
        console.warn('Backend unavailable, using fallback:', err);
        if (isMounted) setProducts(FALLBACK_ARRIVALS);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNewArrivals();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const displayItems = products.length >= 4 ? products : [...products, ...FALLBACK_ARRIVALS];
  const marqueeItems = [...displayItems, ...displayItems];

  return (
    <section className="relative w-full py-14 sm:py-20 bg-white text-neutral-900 overflow-hidden border-b border-neutral-200">
      {/* ——— Section Header (CARNAGE Clean White Style) ——— */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black italic uppercase tracking-tight text-neutral-950 flex items-center gap-3">
            SHOP THE LATEST STYLES
          </h2>
          <div className="h-[2px] w-12 bg-neutral-950 mt-2" />
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/shop?sort=newest"
            className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-neutral-900 hover:opacity-70 transition-opacity border-b border-transparent hover:border-neutral-900 pb-0.5"
          >
            SHOP ALL
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleManualScroll('left')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-950 hover:text-white hover:border-neutral-950 flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
              aria-label="Scroll left"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleManualScroll('right')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-950 hover:text-white hover:border-neutral-950 flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
              aria-label="Scroll right"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ——— Horizontally Scrolling Cards Container ——— */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing px-5 sm:px-8 lg:px-12"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {loading ? (
          <div className="flex gap-4 sm:gap-6 w-max">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-[240px] sm:w-[280px] md:w-[310px] shrink-0 space-y-3 animate-pulse"
              >
                <div className="w-full aspect-[3/4] bg-neutral-200 rounded-none" />
                <div className="flex gap-1.5 pt-1">
                  <div className="w-3 h-3 bg-neutral-200 rounded-none" />
                  <div className="w-3 h-3 bg-neutral-200 rounded-none" />
                  <div className="w-3 h-3 bg-neutral-200 rounded-none" />
                </div>
                <div className="h-4 bg-neutral-200 rounded-none w-3/4" />
                <div className="h-3 bg-neutral-100 rounded-none w-1/2" />
                <div className="h-4 bg-neutral-200 rounded-none w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`flex gap-4 sm:gap-6 ${
              isPaused ? 'pause-marquee' : 'animate-marquee-scroll'
            }`}
          >
            {marqueeItems.map((product, idx) => {
              const swatches = getSwatchesForProduct(product, idx);
              return (
                <div
                  key={`${product.id}-${idx}`}
                  className="w-[240px] sm:w-[280px] md:w-[310px] shrink-0 group flex flex-col justify-between select-none"
                >
                  <Link to={`/product/${product.id}`} className="block group">
                    <div className="relative aspect-[3/4] w-full bg-[#f4f4f5] overflow-hidden rounded-none border border-neutral-200/80 group-hover:border-neutral-400 transition-colors">
                      <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 bg-black text-white text-[9px] font-black tracking-widest uppercase shadow-sm">
                        NEW
                      </span>

                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&auto=format&fit=crop&q=80';
                        }}
                      />

                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>

                    <div className="pt-3 pb-1 space-y-1">
                      <div className="flex items-center gap-1.5 py-0.5">
                        {swatches.map((colorHex, cIdx) => (
                          <span
                            key={cIdx}
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-none border border-neutral-300 transition-transform hover:scale-125"
                            style={{ backgroundColor: colorHex }}
                          />
                        ))}
                      </div>

                      <h3 className="text-[13px] sm:text-[14px] font-bold text-neutral-900 tracking-tight uppercase line-clamp-1 group-hover:text-black transition-colors">
                        {product.name}
                      </h3>

                      <p className="text-[11px] text-neutral-500 font-normal truncate">
                        {product.color || 'Ceylon Artisan Finish'}
                      </p>

                      <p className="text-[12px] sm:text-[13px] font-bold text-neutral-900 tracking-wider pt-0.5">
                        {formatLKR(product.price)}
                      </p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
