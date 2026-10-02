import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiShoppingBag, FiEye } from 'react-icons/fi';

/**
 * Generate an alternate "hover" image URL from the base product image.
 * Uses Unsplash crop params or Cloudinary transforms to show a different
 * angle/crop so that hovering the card swaps to a second view.
 */
const getHoverImage = (baseUrl) => {
  if (!baseUrl) return null;

  if (baseUrl.includes('unsplash.com')) {
    const clean = baseUrl.split('?')[0];
    // Return a different crop of the same image
    return `${clean}?w=600&h=800&fit=crop&crop=top`;
  }

  if (baseUrl.includes('cloudinary') || baseUrl.includes('res.cloudinary')) {
    // Cloudinary: insert a different gravity crop
    return baseUrl.replace('/upload/', '/upload/c_crop,g_north,h_800,w_600/');
  }

  // For any other URL, just return the same (no alternate available)
  return baseUrl;
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const primaryImage = product.imageUrl || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600';
  const hoverImage = useMemo(() => getHoverImage(product.imageUrl), [product.imageUrl]);

  return (
    <div
      className="group relative bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-neutral-400 transition-all duration-300 flex flex-col justify-between hover:shadow-lg text-neutral-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Image Container — two images stacked, crossfade on hover */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f4f4f5]">
        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={product.name}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ease-in-out ${
            isHovered && hoverImage ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600';
          }}
        />

        {/* Hover/Alternate Image (preloaded, fades in on hover) */}
        {hoverImage && (
          <img
            src={hoverImage}
            alt={`${product.name} - alternate view`}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ease-in-out ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = primaryImage;
            }}
          />
        )}

        {/* Category & Tag Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-neutral-900 border border-neutral-200 rounded-md shadow-xs">
            {product.category || 'Ceylon Exclusive'}
          </span>
          {product.size && (
            <span className="px-2 py-1 text-[10px] font-semibold bg-neutral-100 text-neutral-700 rounded-md">
              {product.size}
            </span>
          )}
        </div>

        {/* Stock Badge */}
        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-md shadow-xs z-10">
            Only {product.stockQuantity} Left
          </div>
        )}
        {product.stockQuantity === 0 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-neutral-900 text-white rounded-md shadow-xs z-10">
            Out of Stock
          </div>
        )}

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <Link
            to={`/product/${product.id}`}
            className="p-3 rounded-full bg-white text-neutral-900 hover:bg-neutral-100 hover:scale-110 shadow-lg transition"
            title="View Details"
          >
            <FiEye className="text-lg" />
          </Link>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 space-y-2.5">
        <div>
          {/* Color Swatch Squares */}
          <div className="flex items-center gap-1.5 mb-2">
            <span
              className="w-3.5 h-3.5 rounded-[2px] border border-neutral-300 shadow-2xs"
              style={{
                backgroundColor:
                  product.color?.toLowerCase().includes('white') ? '#ffffff' :
                  product.color?.toLowerCase().includes('blue') ? '#0284c7' :
                  product.color?.toLowerCase().includes('green') ? '#059669' :
                  product.color?.toLowerCase().includes('coral') ? '#f87171' :
                  product.color?.toLowerCase().includes('beige') ? '#d4b996' :
                  product.color?.toLowerCase().includes('red') ? '#dc2626' : '#171717',
              }}
              title={product.color || 'Colorway'}
            />
            <span
              className="w-3.5 h-3.5 rounded-[2px] border border-neutral-200 bg-white"
              title="Alternate Colorway"
            />
          </div>

          <Link to={`/product/${product.id}`}>
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-black transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
            {product.color || product.category || 'Ceylon Exclusive'}
          </p>
        </div>

        {/* Pricing & Add To Cart Button */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-sm sm:text-base font-black text-neutral-950 tracking-tight">
              {formattedPrice}
            </span>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stockQuantity === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-black active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          >
            <FiShoppingBag className="text-xs" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
