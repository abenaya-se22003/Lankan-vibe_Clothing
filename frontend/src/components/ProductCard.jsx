import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiShoppingBag, FiStar, FiEye } from 'react-icons/fi';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const formattedPrice = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="group relative bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-neutral-400 transition-all duration-300 flex flex-col justify-between hover:shadow-lg text-neutral-900">
      {/* Top Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f4f4f5]">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600';
          }}
        />

        {/* Subtle Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-40"></div>

        {/* Category & Tag Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
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
          <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-md shadow-xs">
            Only {product.stockQuantity} Left
          </div>
        )}
        {product.stockQuantity === 0 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-neutral-900 text-white rounded-md shadow-xs">
            Out of Stock
          </div>
        )}

        {/* Quick View Button Hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-xs">
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
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span className="capitalize">{product.color || 'Artisan Dye'}</span>
            <div className="flex items-center text-amber-500 gap-1 text-[11px]">
              <FiStar className="fill-amber-500 text-amber-500 text-xs" />
              <span>4.9</span>
            </div>
          </div>

          <Link to={`/product/${product.id}`}>
            <h3 className="text-base font-bold text-neutral-900 group-hover:text-black transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description || 'Authentic Sri Lankan handcrafted garment with premium stitching and comfort.'}
          </p>
        </div>

        {/* Pricing & Add To Cart Button */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-neutral-400 block font-medium">Island Price</span>
            <span className="text-lg font-black text-neutral-950 tracking-tight">
              {formattedPrice}
            </span>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stockQuantity === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          >
            <FiShoppingBag className="text-sm" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
