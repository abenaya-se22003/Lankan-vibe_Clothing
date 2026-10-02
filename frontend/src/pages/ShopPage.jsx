import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams, useLocation, Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import ShopFilters from '../components/ShopFilters';
import { FiSliders, FiSearch, FiX, FiFilter, FiChevronRight } from 'react-icons/fi';

const CATEGORIES = ['All', 'Men', 'Women', 'Unisex', 'Accessories', 'Casual'];

const ShopPage = ({ initialCategory }) => {
  const { slug } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter sidebar visibility
  const [showFilters, setShowFilters] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Active filter state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('featured');
  const [filters, setFilters] = useState({
    availability: [],
    minPrice: 0,
    maxPrice: null,
    sizes: [],
    colors: [],
    genders: [],
    fits: [],
  });

  // Sync route / slug / query params
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    } else if (slug) {
      const match = CATEGORIES.find((c) => c.toLowerCase() === slug.toLowerCase());
      setSelectedCategory(match || slug.charAt(0).toUpperCase() + slug.slice(1));
    } else {
      const pathPart = location.pathname.replace(/^\//, '');
      const matchPath = CATEGORIES.find((c) => c.toLowerCase() === pathPart.toLowerCase());
      if (matchPath) {
        setSelectedCategory(matchPath);
      } else {
        const cat = searchParams.get('category');
        setSelectedCategory(cat || 'All');
      }
    }

    const search = searchParams.get('search');
    if (search) setSearchQuery(search);
  }, [slug, initialCategory, location.pathname, searchParams]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getAll();
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Update specific filter
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      availability: [],
      minPrice: 0,
      maxPrice: null,
      sizes: [],
      colors: [],
      genders: [],
      fits: [],
    });
    setSearchQuery('');
  };

  // Remove specific single filter tag
  const handleRemoveTag = (categoryKey, value) => {
    if (categoryKey === 'maxPrice') {
      setFilters((prev) => ({ ...prev, maxPrice: null }));
    } else if (categoryKey === 'search') {
      setSearchQuery('');
    } else {
      setFilters((prev) => ({
        ...prev,
        [categoryKey]: (prev[categoryKey] || []).filter((item) => item !== value),
      }));
    }
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  // Filter products by all selected criteria
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Category filter (top tabs or URL)
      if (selectedCategory !== 'All') {
        const pCat = (product.category || '').toLowerCase();
        if (pCat !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // 2. Gender filter (checkboxes in sidebar)
      if (filters.genders && filters.genders.length > 0) {
        const pCat = (product.category || '').toLowerCase();
        const matchesGender = filters.genders.some((g) => g.toLowerCase() === pCat);
        if (!matchesGender) return false;
      }

      // 3. Availability filter
      if (filters.availability && filters.availability.length > 0) {
        const stock = product.stockQuantity ?? 0;
        const wantsInStock = filters.availability.includes('in_stock');
        const wantsOutOfStock = filters.availability.includes('out_of_stock');

        if (wantsInStock && !wantsOutOfStock && stock <= 0) return false;
        if (wantsOutOfStock && !wantsInStock && stock > 0) return false;
      }

      // 4. Price filter
      if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
        const price = Number(product.price) || 0;
        if (price > filters.maxPrice) return false;
      }

      // 5. Size filter
      if (filters.sizes && filters.sizes.length > 0) {
        if (!product.size) return false;
        const cleanSize = product.size.replace(/[()]/g, '').toUpperCase();
        const productSizes = cleanSize.split(/[,\s/]+/).filter(Boolean);
        const hasSize = filters.sizes.some((sz) =>
          productSizes.includes(sz.toUpperCase()) || cleanSize.includes(sz.toUpperCase())
        );
        if (!hasSize) return false;
      }

      // 6. Color filter
      if (filters.colors && filters.colors.length > 0) {
        if (!product.color) return false;
        const pColor = product.color.toLowerCase();
        const matchesColor = filters.colors.some((c) => pColor.includes(c.toLowerCase()));
        if (!matchesColor) return false;
      }

      // 7. Fit filter
      if (filters.fits && filters.fits.length > 0) {
        const content = `${product.name} ${product.description || ''}`.toLowerCase();
        const matchesFit = filters.fits.some((fit) => {
          const fitWord = fit.toLowerCase().replace(' fit', '');
          return content.includes(fitWord);
        });
        if (!matchesFit) return false;
      }

      // 8. Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name?.toLowerCase().includes(query);
        const matchesDesc = product.description?.toLowerCase().includes(query);
        const matchesColor = product.color?.toLowerCase().includes(query);
        const matchesCat = product.category?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesColor && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, filters, searchQuery]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'price-low') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'price-high') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return (b.id || 0) - (a.id || 0);
    });
  }, [filteredProducts, sortBy]);

  // Total active filter badges count
  const activeFilterCount =
    (filters.availability?.length || 0) +
    (filters.sizes?.length || 0) +
    (filters.colors?.length || 0) +
    (filters.genders?.length || 0) +
    (filters.fits?.length || 0) +
    (filters.maxPrice ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="bg-white min-h-screen text-neutral-900">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb & Title */}
        <div className="space-y-1">
          <nav className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Link to="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <FiChevronRight className="text-[10px]" />
            <Link to="/shop" className="hover:text-black transition-colors">
              Shop
            </Link>
            {selectedCategory !== 'All' && (
              <>
                <FiChevronRight className="text-[10px]" />
                <span className="text-neutral-900 font-medium">{selectedCategory}</span>
              </>
            )}
          </nav>

          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
            {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Collection`}
          </h1>
        </div>

        {/* Category Pills Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-neutral-100">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Controls Bar: Filter Toggle Button | Product Count | Search | Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* Left: Filter Toggle Button & Product count (As in reference screenshot) */}
          <div className="flex items-center gap-4">
            <button
              id="filter-toggle-button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileFilterOpen(true);
                } else {
                  setShowFilters(!showFilters);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-neutral-300 hover:border-black bg-white text-xs font-bold uppercase tracking-wider text-neutral-900 transition-all shadow-2xs hover:bg-neutral-50"
            >
              <FiSliders className="text-sm" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Product Count (Matching screenshot: "70 products") */}
            <span className="text-xs sm:text-sm text-neutral-500 font-normal">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
            </span>
          </div>

          {/* Right: Search & Sort Dropdown */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-44 sm:w-56">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-50 text-xs text-neutral-900 placeholder-neutral-400 rounded-md pl-8 pr-3 py-2 border border-neutral-200 focus:outline-none focus:border-black focus:bg-white transition"
              />
              <FiSearch className="absolute left-2.5 top-2.5 text-neutral-400 text-xs" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-black"
                >
                  <FiX className="text-xs" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center border border-neutral-200 rounded-md bg-white px-2.5 py-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-medium text-neutral-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="featured">Featured / Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips / Tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Active:
            </span>

            {/* Availability tags */}
            {filters.availability?.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-xs text-neutral-800 border border-neutral-200"
              >
                {item === 'in_stock' ? 'In stock' : 'Out of stock'}
                <button
                  onClick={() => handleRemoveTag('availability', item)}
                  className="hover:text-red-500"
                >
                  <FiX className="text-xs" />
                </button>
              </span>
            ))}

            {/* Size tags */}
            {filters.sizes?.map((sz) => (
              <span
                key={sz}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-xs text-neutral-800 border border-neutral-200"
              >
                Size: {sz}
                <button
                  onClick={() => handleRemoveTag('sizes', sz)}
                  className="hover:text-red-500"
                >
                  <FiX className="text-xs" />
                </button>
              </span>
            ))}

            {/* Color tags */}
            {filters.colors?.map((col) => (
              <span
                key={col}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-xs text-neutral-800 border border-neutral-200"
              >
                Color: {col}
                <button
                  onClick={() => handleRemoveTag('colors', col)}
                  className="hover:text-red-500"
                >
                  <FiX className="text-xs" />
                </button>
              </span>
            ))}

            {/* Gender tags */}
            {filters.genders?.map((g) => (
              <span
                key={g}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-xs text-neutral-800 border border-neutral-200"
              >
                {g}
                <button
                  onClick={() => handleRemoveTag('genders', g)}
                  className="hover:text-red-500"
                >
                  <FiX className="text-xs" />
                </button>
              </span>
            ))}

            {/* Fit tags */}
            {filters.fits?.map((fit) => (
              <span
                key={fit}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-xs text-neutral-800 border border-neutral-200"
              >
                {fit}
                <button
                  onClick={() => handleRemoveTag('fits', fit)}
                  className="hover:text-red-500"
                >
                  <FiX className="text-xs" />
                </button>
              </span>
            ))}

            {/* Max Price tag */}
            {filters.maxPrice && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-xs text-neutral-800 border border-neutral-200">
                Under LKR {filters.maxPrice.toLocaleString()}
                <button
                  onClick={() => handleRemoveTag('maxPrice')}
                  className="hover:text-red-500"
                >
                  <FiX className="text-xs" />
                </button>
              </span>
            )}

            {/* Search tag */}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-xs text-neutral-800 border border-neutral-200">
                "{searchQuery}"
                <button
                  onClick={() => handleRemoveTag('search')}
                  className="hover:text-red-500"
                >
                  <FiX className="text-xs" />
                </button>
              </span>
            )}

            {/* Clear All button */}
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-neutral-500 hover:text-black underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Main Content Area: Filter Sidebar + Products Grid */}
        <div className="flex gap-8 items-start pt-2">
          {/* DESKTOP ACCORDION FILTER SIDEBAR (Visible when showFilters is true) */}
          {showFilters && (
            <div className="w-64 xl:w-72 shrink-0 hidden lg:block sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-3 scrollbar-thin">
              <ShopFilters
                products={products}
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
              />
            </div>
          )}

          {/* PRODUCTS GRID */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div
                className={`grid gap-4 sm:gap-6 ${
                  showFilters
                    ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-3'
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }`}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-96 rounded-xl bg-neutral-100 animate-pulse border border-neutral-200"
                  />
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4 px-4">
                <FiFilter className="mx-auto text-4xl text-neutral-400" />
                <h3 className="text-lg font-bold text-neutral-900">No products found</h3>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                  We couldn't find items matching your active filter criteria. Try adjusting your
                  availability, price, size, or color filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-4 sm:gap-6 transition-all duration-300 ${
                  showFilters
                    ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-3'
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }`}
              >
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE / TABLET FILTER SLIDE-IN DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Filters & Refinements
              </span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-md hover:bg-neutral-100 text-neutral-600"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Scrollable Filter Body */}
            <div className="flex-1 overflow-y-auto p-4">
              <ShopFilters
                products={products}
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                onCloseMobile={() => setMobileFilterOpen(false)}
              />
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-neutral-200 bg-white flex items-center gap-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-md border border-neutral-300 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-md bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black"
              >
                View {sortedProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
