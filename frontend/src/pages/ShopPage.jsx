import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { FiFilter, FiSearch, FiSliders } from 'react-icons/fi';

const categories = ['All', 'Men', 'Women', 'Unisex', 'Accessories', 'Casual'];

const ShopPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    if (slug) {
      const match = categories.find((c) => c.toLowerCase() === slug.toLowerCase());
      setSelectedCategory(match || slug.charAt(0).toUpperCase() + slug.slice(1));
    } else {
      const cat = searchParams.get('category');
      setSelectedCategory(cat || 'All');
    }
    const search = searchParams.get('search');
    if (search) setSearchQuery(search);
  }, [slug, searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getAll();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  // Filter and sort products
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (product.category &&
        product.category.toLowerCase() === selectedCategory.toLowerCase());

    const matchesSearch =
      !searchQuery ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.color?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return b.id - a.id; // newest first by default
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1f233d]">
        <div>
          <span className="text-xs font-bold text-[#c9a84c] uppercase tracking-wider">
            Ceylon Apparel Store
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
            {selectedCategory === 'All' ? 'All Collections' : `${selectedCategory} Collection`}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Showing {sortedProducts.length} authentic islandwear handcrafted pieces
          </p>
        </div>

        {/* Search Bar in shop */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search fabrics, colors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#131627] text-xs text-white placeholder-gray-500 rounded-xl pl-9 pr-3 py-2.5 border border-[#222744] focus:outline-none focus:border-[#e94560]"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-500 text-xs" />
          </div>

          <div className="flex items-center gap-2 bg-[#131627] border border-[#222744] rounded-xl px-3 py-1.5">
            <FiSliders className="text-gray-400 text-xs" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-[#131627]">Newest First</option>
              <option value="price-low" className="bg-[#131627]">Price: Low to High</option>
              <option value="price-high" className="bg-[#131627]">Price: High to Low</option>
              <option value="name" className="bg-[#131627]">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? 'bg-gradient-to-r from-[#e94560] to-[#c9a84c] text-white shadow-lg shadow-[#e94560]/20'
                : 'bg-[#131627] text-gray-400 hover:text-white border border-[#202542]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="h-96 rounded-2xl bg-[#131627] animate-pulse border border-[#1f233d]"
            ></div>
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#111424] border border-[#1e233d] space-y-4">
          <FiFilter className="mx-auto text-4xl text-gray-600" />
          <h3 className="text-lg font-bold text-white">No products found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            We couldn't find items matching your current filters. Try changing your search query or
            category selection.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              searchParams.delete('category');
              searchParams.delete('search');
              setSearchParams(searchParams);
            }}
            className="px-5 py-2 rounded-xl bg-[#191d33] border border-[#292f52] text-xs font-semibold text-gray-200 hover:text-white hover:border-[#e94560] transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopPage;
