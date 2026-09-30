import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import ReviewSection from '../components/ReviewSection';
import {
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiArrowLeft,
  FiCheck,
  FiMinus,
  FiPlus,
  FiShare2,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getById(id);
        setProduct(data);
        if (data.size) setSelectedSize(data.size);
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Product link copied to clipboard!');
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 min-h-screen text-center text-gray-400">
        <div className="w-12 h-12 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm">Loading Lankan Vibe creation...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 min-h-screen text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
        <p className="text-xs text-gray-400">The product you are looking for might have been retired.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#e94560] text-white text-xs font-semibold"
        >
          <FiArrowLeft /> Back to Shop
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <Link
          to="/shop"
          className="flex items-center gap-2 hover:text-[#e94560] transition"
        >
          <FiArrowLeft /> <span>Back to All Collections</span>
        </Link>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-white transition"
          title="Share product"
        >
          <FiShare2 /> <span>Share</span>
        </button>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Product Image */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-[#0c0e1a] border border-[#20243d] shadow-2xl">
            <img
              src={product.imageUrl || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600';
              }}
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-xl bg-[#0c0e1a]/80 backdrop-blur-md border border-[#c9a84c]/30 text-xs font-bold text-[#c9a84c] uppercase tracking-wider">
                {product.category || 'Ceylon Artisan'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Product Actions & Specs */}
        <div className="space-y-6 flex flex-col justify-center">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#e94560] uppercase tracking-wider">
              {product.color ? `${product.color} Motif` : 'Heritage Craft'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 pt-2">
              <span className="text-3xl font-black text-white tracking-tight">
                {formattedPrice}
              </span>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of Stock'}
              </span>
            </div>
          </div>

          <div className="border-t border-b border-[#1e233d] py-5 space-y-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              {product.description ||
                'Crafted with pride in Sri Lanka using century-old loom and wax-resist dyeing techniques. Breathable, durable, and naturally soft.'}
            </p>

            {/* Size selection */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Available Size
              </label>
              <div className="flex items-center gap-2">
                {['S', 'M', 'L', 'XL', 'Free Size'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      selectedSize === sz
                        ? 'bg-[#e94560] text-white shadow-md shadow-[#e94560]/20'
                        : 'bg-[#14172a] text-gray-300 border border-[#232845] hover:border-gray-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#14172a] border border-[#232845] rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 text-gray-300 hover:text-white transition"
                  >
                    <FiMinus className="text-xs" />
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stockQuantity || 10, quantity + 1))}
                    className="p-2.5 text-gray-300 hover:text-white transition"
                  >
                    <FiPlus className="text-xs" />
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  Total: {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(product.price * quantity)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => addToCart(product, quantity)}
              disabled={product.stockQuantity === 0}
              className="w-full sm:flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#e94560] to-[#c9a84c] text-white font-bold text-sm tracking-wide shadow-xl shadow-[#e94560]/20 hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiShoppingBag className="text-base" />
              <span>Add To Cart</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stockQuantity === 0}
              className="w-full sm:flex-1 py-4 rounded-2xl bg-[#14172a] border border-[#2b3052] text-white font-bold text-sm hover:border-[#c9a84c] transition flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <FiCheck className="text-base text-[#c9a84c]" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Guarantees Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#0c0e1a] border border-[#1b1f36]">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <FiTruck className="text-[#e94560] text-sm shrink-0" />
              <span>Islandwide Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <FiShield className="text-[#c9a84c] text-sm shrink-0" />
              <span>Authentic Handloom</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <FiRefreshCw className="text-emerald-400 text-sm shrink-0" />
              <span>7-Day Exchange</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews Section (Fully Integrated!) */}
      <ReviewSection productId={product.id} />
    </div>
  );
};

export default ProductDetailPage;
