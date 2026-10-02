import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  FiHeart,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink,
  FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { parseOptions, STANDARD_SIZES } from '../utils/productOptions';

/**
 * Generates multiple gallery image URLs from a single source image.
 * Uses Unsplash crop parameters or simple query-string variations
 * to create visually different "angles" of the same product.
 */
const generateGalleryImages = (baseUrl) => {
  if (!baseUrl) {
    const fallback = 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf';
    return [
      { id: 1, url: `${fallback}?w=800&h=1000&fit=crop`, label: 'Front View' },
      { id: 2, url: `${fallback}?w=800&h=1000&fit=crop&crop=top`, label: 'Top Detail' },
      { id: 3, url: `${fallback}?w=800&h=1000&fit=crop&crop=bottom`, label: 'Bottom View' },
      { id: 4, url: `${fallback}?w=800&h=1000&fit=crop&crop=left`, label: 'Side View' },
    ];
  }

  // Check if it's an Unsplash URL — can append crop params
  const isUnsplash = baseUrl.includes('unsplash.com');
  // Check if it's a Cloudinary URL — can append transformations
  const isCloudinary = baseUrl.includes('cloudinary') || baseUrl.includes('res.cloudinary');

  if (isUnsplash) {
    const cleanUrl = baseUrl.split('?')[0];
    return [
      { id: 1, url: `${cleanUrl}?w=800&h=1000&fit=crop`, label: 'Front View' },
      { id: 2, url: `${cleanUrl}?w=800&h=1000&fit=crop&crop=top`, label: 'Top Detail' },
      { id: 3, url: `${cleanUrl}?w=800&h=1000&fit=crop&crop=bottom`, label: 'Bottom View' },
      { id: 4, url: `${cleanUrl}?w=800&h=1000&fit=crop&crop=left`, label: 'Side View' },
    ];
  }

  if (isCloudinary) {
    // Insert transformation before /upload/ or use as-is
    const insertTransform = (tx) => {
      return baseUrl.replace('/upload/', `/upload/${tx}/`);
    };
    return [
      { id: 1, url: baseUrl, label: 'Front View' },
      { id: 2, url: insertTransform('c_crop,g_north,h_1000,w_800'), label: 'Top Detail' },
      { id: 3, url: insertTransform('c_crop,g_south,h_1000,w_800'), label: 'Bottom View' },
      { id: 4, url: insertTransform('c_crop,g_west,h_1000,w_800'), label: 'Side View' },
    ];
  }

  // Generic fallback — just reuse the same image with different labels
  return [
    { id: 1, url: baseUrl, label: 'Front View' },
    { id: 2, url: baseUrl, label: 'Back View' },
    { id: 3, url: baseUrl, label: 'Close-up' },
    { id: 4, url: baseUrl, label: 'Detail Shot' },
  ];
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Gallery state
  const [galleryImages, setGalleryImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Accordion state for description
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  // Image zoom on hover
  const mainImageRef = useRef(null);
  const [zoomStyle, setZoomStyle] = useState({});
  const [isZooming, setIsZooming] = useState(false);

  // Parse available & unavailable sizes
  const parsedSizes = useMemo(() => {
    if (!product) return [];
    if (product.size) {
      const parsed = parseOptions(product.size);
      // If it's a single size and matches a standard size, provide standard sizes with that one available
      if (parsed.length === 1 && STANDARD_SIZES.includes(parsed[0].name)) {
        return STANDARD_SIZES.map((sz) => ({
          name: sz,
          available: sz === parsed[0].name,
          raw: sz === parsed[0].name ? sz : `(${sz})`,
        }));
      }
      return parsed;
    }
    // Default fallback sizes
    return ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => ({
      name: sz,
      available: sz !== 'XL', // default demo matches user reference where XL is crossed out
      raw: sz === 'XL' ? '(XL)' : sz,
    }));
  }, [product]);

  // Parse available & unavailable colors
  const parsedColors = useMemo(() => {
    if (!product || !product.color) return [];
    return parseOptions(product.color);
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getById(id);
        setProduct(data);

        // Auto select first available size
        const sizes = data.size
          ? parseOptions(data.size)
          : ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => ({
              name: sz,
              available: sz !== 'XL',
            }));
        const firstAvailSize = sizes.find((s) => s.available)?.name || sizes[0]?.name || 'M';
        setSelectedSize(firstAvailSize);

        // Auto select first available color
        if (data.color) {
          const colors = parseOptions(data.color);
          const firstAvailColor = colors.find((c) => c.available)?.name || colors[0]?.name || '';
          setSelectedColor(firstAvailColor);
        }

        // Generate gallery images from single imageUrl
        const images = generateGalleryImages(data.imageUrl);
        setGalleryImages(images);
        setActiveImageIndex(0);
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

  // Image zoom handlers
  const handleMouseMove = (e) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)',
    });
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setZoomStyle({});
    setIsZooming(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-[3px] border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-neutral-400 font-medium tracking-wide uppercase">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 min-h-screen text-center space-y-4">
        <h2 className="text-2xl font-bold text-neutral-900">Product Not Found</h2>
        <p className="text-xs text-neutral-500">The product you are looking for might have been removed.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider"
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
    <div className="bg-white min-h-screen text-neutral-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <FiChevronRight className="text-[10px]" />
          <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
          {product.category && (
            <>
              <FiChevronRight className="text-[10px]" />
              <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-black transition-colors">
                {product.category}
              </Link>
            </>
          )}
          <FiChevronRight className="text-[10px]" />
          <span className="text-neutral-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ====== MAIN PRODUCT LAYOUT ====== */}
        {/* Left: scrollable images | Right: sticky product details */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">

          {/* ─── LEFT SIDE: 2-Column Image Grid (scrolls with page) ─── */}
          <div className="w-full lg:w-[60%] xl:w-[62%]">
            {/* 2x2 Image Grid — all same fixed size */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {galleryImages.map((img, index) => (
                <div
                  key={img.id}
                  id={`product-image-${index}`}
                  className="relative w-full overflow-hidden bg-neutral-100 cursor-crosshair"
                  style={{ aspectRatio: '3 / 4' }}
                  onMouseMove={(e) => {
                    if (index === activeImageIndex) handleMouseMove(e);
                  }}
                  onMouseEnter={() => setActiveImageIndex(index)}
                  onMouseLeave={handleMouseLeave}
                  ref={index === activeImageIndex ? mainImageRef : null}
                >
                  <img
                    src={img.url}
                    alt={`${product.name} - ${img.label}`}
                    className="w-full h-full object-cover object-center transition-transform duration-200 ease-out"
                    style={isZooming && activeImageIndex === index ? zoomStyle : {}}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&fit=crop';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ─── RIGHT SIDE: Product Details (sticky - stays in place while scrolling images) ─── */}
          <div className="w-full lg:w-[40%] xl:w-[38%] lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-6">
              {/* Product Name & Price */}
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold uppercase tracking-tight text-neutral-900 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-3">
                  <span className="text-xl sm:text-2xl font-extrabold text-neutral-900">
                    {formattedPrice}
                  </span>
                </div>
              </div>

              {/* Color Selector */}
              {parsedColors.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-900">
                      Select color
                      {selectedColor && (
                        <span className="font-semibold text-neutral-700 ml-1.5">
                          · {selectedColor}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {parsedColors.map((item) => {
                      const isSelected = selectedColor === item.name;
                      const isAvailable = item.available;

                      return (
                        <button
                          key={item.name}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => {
                            if (isAvailable) setSelectedColor(item.name);
                          }}
                          title={
                            !isAvailable
                              ? `${item.name} - Currently Out of Stock`
                              : `Select ${item.name}`
                          }
                          className={`relative min-w-[70px] h-[42px] px-3.5 flex items-center justify-center text-xs font-semibold uppercase tracking-wider transition-all border ${
                            !isAvailable
                              ? 'bg-white text-neutral-400 border-neutral-300 cursor-not-allowed select-none'
                              : isSelected
                              ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                              : 'bg-white text-neutral-900 border-neutral-300 hover:border-neutral-900'
                          }`}
                        >
                          <span className={!isAvailable ? 'text-neutral-400 font-normal' : ''}>
                            {item.name}
                          </span>

                          {/* Diagonal Cross (X) for unavailable color */}
                          {!isAvailable && (
                            <svg
                              className="absolute inset-0 w-full h-full pointer-events-none stroke-neutral-400"
                              preserveAspectRatio="none"
                              viewBox="0 0 100 100"
                            >
                              <line x1="0" y1="0" x2="100" y2="100" strokeWidth="1.2" stroke="currentColor" />
                              <line x1="100" y1="0" x2="0" y2="100" strokeWidth="1.2" stroke="currentColor" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─── Size Selector (Matching user reference image) ─── */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-900">
                    Select size
                  </span>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-xs text-neutral-900 underline underline-offset-4 hover:text-neutral-600 flex items-center gap-1 font-normal transition"
                  >
                    <span>Size guide</span>
                    <FiExternalLink className="text-[11px]" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {parsedSizes.map((item) => {
                    const isSelected = selectedSize === item.name;
                    const isAvailable = item.available;

                    return (
                      <button
                        key={item.name}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => {
                          if (isAvailable) setSelectedSize(item.name);
                        }}
                        title={
                          !isAvailable
                            ? `${item.name} - Currently Out of Stock`
                            : `Select size ${item.name}`
                        }
                        className={`relative min-w-[52px] h-[48px] px-3.5 flex items-center justify-center text-sm font-semibold transition-all border ${
                          !isAvailable
                            ? 'bg-white text-neutral-400 border-neutral-300 cursor-not-allowed select-none'
                            : isSelected
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                            : 'bg-white text-neutral-900 border-neutral-300 hover:border-neutral-900'
                        }`}
                      >
                        {/* Size label */}
                        <span className={!isAvailable ? 'text-neutral-400 font-medium' : ''}>
                          {item.name}
                        </span>

                        {/* Diagonal Cross (X) for unavailable size — matches reference image */}
                        {!isAvailable && (
                          <svg
                            className="absolute inset-0 w-full h-full pointer-events-none stroke-neutral-400"
                            preserveAspectRatio="none"
                            viewBox="0 0 100 100"
                          >
                            <line x1="0" y1="0" x2="100" y2="100" strokeWidth="1.2" stroke="currentColor" />
                            <line x1="100" y1="0" x2="0" y2="100" strokeWidth="1.2" stroke="currentColor" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stock indicator */}
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${product.stockQuantity > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs font-medium text-neutral-700">
                  {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Description Accordion */}
              <div className="border-t border-neutral-200">
                <button
                  onClick={() => setDescriptionOpen(!descriptionOpen)}
                  className="w-full py-4 flex items-center justify-between text-left"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-900">
                    Description
                  </span>
                  {descriptionOpen ? (
                    <FiMinus className="text-sm text-neutral-500" />
                  ) : (
                    <FiPlus className="text-sm text-neutral-500" />
                  )}
                </button>
                {descriptionOpen && (
                  <div className="pb-4 -mt-1">
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {product.description ||
                        'Crafted with pride in Sri Lanka using century-old artisan techniques. Breathable, durable, and naturally soft.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Quantity + Add to Cart Row */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center border border-neutral-300 rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-neutral-600 hover:text-black hover:bg-neutral-50 transition"
                  >
                    <FiMinus className="text-sm" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-neutral-900 select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stockQuantity || 10, quantity + 1))}
                    className="p-3 text-neutral-600 hover:text-black hover:bg-neutral-50 transition"
                  >
                    <FiPlus className="text-sm" />
                  </button>
                </div>

                <button
                  onClick={() => addToCart(product, quantity)}
                  disabled={product.stockQuantity === 0}
                  className="flex-1 py-3.5 rounded-md bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiShoppingBag className="text-sm" />
                  <span>Add To Cart</span>
                </button>
              </div>

              {/* Wishlist Button */}
              <button className="w-full py-3.5 rounded-md border border-neutral-300 text-neutral-900 text-xs font-bold uppercase tracking-widest hover:border-neutral-900 transition flex items-center justify-center gap-2">
                <FiHeart className="text-sm" />
                <span>Add To Wishlist</span>
              </button>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={product.stockQuantity === 0}
                className="w-full py-3.5 rounded-md bg-[#4285f4] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#3275e3] transition flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <FiCheck className="text-sm" />
                <span>Buy Now</span>
              </button>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-neutral-200">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <FiTruck className="text-neutral-500 text-base" />
                  <span className="text-[10px] text-neutral-500 font-medium leading-tight">Islandwide<br/>Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <FiShield className="text-neutral-500 text-base" />
                  <span className="text-[10px] text-neutral-500 font-medium leading-tight">Authentic<br/>Handloom</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <FiRefreshCw className="text-neutral-500 text-base" />
                  <span className="text-[10px] text-neutral-500 font-medium leading-tight">7-Day<br/>Exchange</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <ReviewSection productId={product.id} />
      </div>

      {/* ─── Size Guide Modal ─── */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <h3 className="text-base font-bold text-neutral-900 uppercase tracking-wider">
                  Size Guide
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Standard clothing measurements (Inches)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-black rounded-lg transition"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Measurement Table */}
            <div className="mt-4 overflow-x-auto border border-neutral-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-100 text-neutral-800 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 border-b border-neutral-200">Size</th>
                    <th className="py-2.5 px-3 border-b border-neutral-200">Chest (in)</th>
                    <th className="py-2.5 px-3 border-b border-neutral-200">Waist (in)</th>
                    <th className="py-2.5 px-3 border-b border-neutral-200">Hips (in)</th>
                    <th className="py-2.5 px-3 border-b border-neutral-200">Length (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-700">
                  <tr className="hover:bg-neutral-50">
                    <td className="py-2.5 px-3 font-bold text-neutral-900">XS</td>
                    <td className="py-2.5 px-3">34 - 36</td>
                    <td className="py-2.5 px-3">28 - 30</td>
                    <td className="py-2.5 px-3">35 - 37</td>
                    <td className="py-2.5 px-3">27</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-2.5 px-3 font-bold text-neutral-900">S</td>
                    <td className="py-2.5 px-3">36 - 38</td>
                    <td className="py-2.5 px-3">30 - 32</td>
                    <td className="py-2.5 px-3">37 - 39</td>
                    <td className="py-2.5 px-3">28</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-2.5 px-3 font-bold text-neutral-900">M</td>
                    <td className="py-2.5 px-3">38 - 40</td>
                    <td className="py-2.5 px-3">32 - 34</td>
                    <td className="py-2.5 px-3">39 - 41</td>
                    <td className="py-2.5 px-3">29</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-2.5 px-3 font-bold text-neutral-900">L</td>
                    <td className="py-2.5 px-3">40 - 42</td>
                    <td className="py-2.5 px-3">34 - 36</td>
                    <td className="py-2.5 px-3">41 - 43</td>
                    <td className="py-2.5 px-3">30</td>
                  </tr>
                  <tr className="bg-neutral-50 hover:bg-neutral-100">
                    <td className="py-2.5 px-3 font-bold text-neutral-900">XL</td>
                    <td className="py-2.5 px-3">42 - 44</td>
                    <td className="py-2.5 px-3">36 - 38</td>
                    <td className="py-2.5 px-3">43 - 45</td>
                    <td className="py-2.5 px-3">31</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-2.5 px-3 font-bold text-neutral-900">XXL</td>
                    <td className="py-2.5 px-3">44 - 46</td>
                    <td className="py-2.5 px-3">38 - 40</td>
                    <td className="py-2.5 px-3">45 - 47</td>
                    <td className="py-2.5 px-3">32</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Measuring Tips */}
            <div className="mt-4 p-3.5 bg-neutral-50 rounded-lg text-xs text-neutral-600 space-y-1.5 border border-neutral-200">
              <p className="font-bold text-neutral-900">How to measure:</p>
              <p>• <strong>Chest:</strong> Measure around the fullest part of your chest, keeping tape horizontal.</p>
              <p>• <strong>Waist:</strong> Measure around the narrowest part of your waistline.</p>
              <p>• <strong>Hips:</strong> Stand with feet together and measure around the widest point.</p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                className="px-5 py-2.5 bg-neutral-900 text-white rounded-md text-xs font-bold uppercase tracking-wider hover:bg-black transition"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
