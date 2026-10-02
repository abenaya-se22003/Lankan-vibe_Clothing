import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiX, FiRotateCcw } from 'react-icons/fi';

// Color hex mappings for swatches
const COLOR_PALETTE = {
  black: '#000000',
  white: '#ffffff',
  'jet black': '#0a0a0a',
  'ocean blue': '#0284c7',
  'emerald green': '#059669',
  'off white': '#f4f4f5',
  'sand beige': '#d4b996',
  'sunset coral': '#f87171',
  'maroon & gold': '#831843',
  red: '#dc2626',
  blue: '#2563eb',
  navy: '#1e3a8a',
  green: '#16a34a',
  beige: '#e7d8c9',
  grey: '#6b7280',
  gray: '#6b7280',
  maroon: '#800000',
  gold: '#d97706',
};

const getColorHex = (colorName = '') => {
  const normalized = colorName.toLowerCase().trim();
  for (const [key, hex] of Object.entries(COLOR_PALETTE)) {
    if (normalized.includes(key)) return hex;
  }
  return '#9ca3af'; // default neutral gray
};

const ShopFilters = ({
  products = [],
  filters,
  onFilterChange,
  onResetFilters,
  onCloseMobile,
}) => {
  // Accordion open/close state for each section
  const [openSections, setOpenSections] = useState({
    availability: true,
    price: true,
    size: true,
    color: true,
    gender: true,
    fit: true,
  });

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Format currency
  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // --- COMPUTE COUNTS DYNAMICALLY FROM PRODUCT LIST ---
  // Availability counts
  const inStockCount = products.filter((p) => (p.stockQuantity ?? 0) > 0).length;
  const outOfStockCount = products.filter((p) => (p.stockQuantity ?? 0) === 0).length;

  // Max price in products
  const computedMaxPrice = Math.max(
    ...products.map((p) => Number(p.price) || 0),
    25000
  );

  // Size list & counts
  const KNOWN_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const sizeCounts = {};
  KNOWN_SIZES.forEach((sz) => {
    sizeCounts[sz] = products.filter((p) => {
      if (!p.size) return false;
      const cleanSizeStr = p.size.replace(/[()]/g, '').toUpperCase();
      return (
        cleanSizeStr === sz.toUpperCase() ||
        cleanSizeStr.split(/[,\s/]+/).includes(sz.toUpperCase())
      );
    }).length;
  });

  // Color list & counts
  const colorMap = {};
  products.forEach((p) => {
    if (p.color) {
      // Split if multiple colors like "Red , Blue" and clean parentheses
      const parts = p.color
        .split(/[,/]+/)
        .map((c) => c.replace(/[()]/g, '').trim())
        .filter(Boolean);
      parts.forEach((col) => {
        const key = col.charAt(0).toUpperCase() + col.slice(1).toLowerCase();
        colorMap[key] = (colorMap[key] || 0) + 1;
      });
    }
  });
  const colorOptions = Object.keys(colorMap);

  // Gender counts (Category)
  const GENDER_OPTIONS = ['Men', 'Women', 'Unisex'];
  const genderCounts = {};
  GENDER_OPTIONS.forEach((g) => {
    genderCounts[g] = products.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      return cat === g.toLowerCase();
    }).length;
  });

  // Fit counts
  const FIT_OPTIONS = ['Regular Fit', 'Oversized', 'Slim Fit', 'Relaxed'];
  const fitCounts = {};
  FIT_OPTIONS.forEach((fit) => {
    const fLower = fit.toLowerCase().replace(' fit', '');
    fitCounts[fit] = products.filter((p) => {
      const text = `${p.name} ${p.description || ''}`.toLowerCase();
      return text.includes(fLower);
    }).length;
  });

  // Toggle checkbox handler
  const handleCheckboxToggle = (categoryKey, value) => {
    const currentList = filters[categoryKey] || [];
    const exists = currentList.includes(value);
    const updated = exists
      ? currentList.filter((item) => item !== value)
      : [...currentList, value];
    onFilterChange(categoryKey, updated);
  };

  // Check if any filters are active
  const hasActiveFilters =
    (filters.availability && filters.availability.length > 0) ||
    (filters.sizes && filters.sizes.length > 0) ||
    (filters.colors && filters.colors.length > 0) ||
    (filters.genders && filters.genders.length > 0) ||
    (filters.fits && filters.fits.length > 0) ||
    (filters.maxPrice && filters.maxPrice < computedMaxPrice);

  return (
    <aside className="w-full text-neutral-900 select-none">
      {/* Top Header inside sidebar (visible when mobile drawer or desktop clear button) */}
      <div className="flex items-center justify-between pb-3 mb-1 border-b border-neutral-200">
        <span className="text-[13px] font-bold tracking-[0.12em] uppercase text-neutral-900">
          Filters
        </span>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-black transition-colors"
            >
              <FiRotateCcw className="text-[10px]" />
              <span>Reset</span>
            </button>
          )}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md hover:bg-neutral-100 text-neutral-600 md:hidden"
              aria-label="Close filters"
            >
              <FiX className="text-lg" />
            </button>
          )}
        </div>
      </div>

      {/* 1. AVAILABILITY SECTION */}
      <div className="border-b border-neutral-200">
        <button
          onClick={() => toggleSection('availability')}
          className="w-full py-4 flex items-center justify-between text-left group"
        >
          <span className="text-xs font-bold tracking-[0.08em] uppercase text-neutral-900 group-hover:text-black">
            Availability
          </span>
          {openSections.availability ? (
            <FiChevronUp className="text-sm text-neutral-600" />
          ) : (
            <FiChevronDown className="text-sm text-neutral-600" />
          )}
        </button>

        {openSections.availability && (
          <div className="pb-5 pt-1 space-y-3">
            {/* In stock */}
            <label className="flex items-center justify-between cursor-pointer group text-xs text-neutral-800 hover:text-black">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={(filters.availability || []).includes('in_stock')}
                  onChange={() => handleCheckboxToggle('availability', 'in_stock')}
                  className="w-4 h-4 rounded-xs border-neutral-300 text-black accent-black focus:ring-0 cursor-pointer"
                />
                <span>In stock</span>
              </div>
              <span className="text-neutral-400 font-normal">({inStockCount})</span>
            </label>

            {/* Out of stock */}
            <label className="flex items-center justify-between cursor-pointer group text-xs text-neutral-800 hover:text-black">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={(filters.availability || []).includes('out_of_stock')}
                  onChange={() => handleCheckboxToggle('availability', 'out_of_stock')}
                  className="w-4 h-4 rounded-xs border-neutral-300 text-black accent-black focus:ring-0 cursor-pointer"
                />
                <span>Out of stock</span>
              </div>
              <span className="text-neutral-400 font-normal">({outOfStockCount})</span>
            </label>
          </div>
        )}
      </div>

      {/* 2. PRICE SECTION */}
      <div className="border-b border-neutral-200">
        <button
          onClick={() => toggleSection('price')}
          className="w-full py-4 flex items-center justify-between text-left group"
        >
          <span className="text-xs font-bold tracking-[0.08em] uppercase text-neutral-900 group-hover:text-black">
            Price
          </span>
          {openSections.price ? (
            <FiChevronUp className="text-sm text-neutral-600" />
          ) : (
            <FiChevronDown className="text-sm text-neutral-600" />
          )}
        </button>

        {openSections.price && (
          <div className="pb-5 pt-1 space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-700">
              <div>
                <span className="text-neutral-400">From: </span>
                <span className="font-bold text-neutral-900">{formatPrice(filters.minPrice || 0)}</span>
              </div>
              <div>
                <span className="text-neutral-400">To: </span>
                <span className="font-bold text-neutral-900">
                  {formatPrice(filters.maxPrice || computedMaxPrice)}
                </span>
              </div>
            </div>

            {/* Price Slider Bar matching screenshot */}
            <div className="relative pt-1">
              <input
                type="range"
                min="0"
                max={computedMaxPrice}
                step="250"
                value={filters.maxPrice || computedMaxPrice}
                onChange={(e) => onFilterChange('maxPrice', Number(e.target.value))}
                className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-1.5">
                <span>LKR 0</span>
                <span>{formatPrice(computedMaxPrice)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. SIZE SECTION */}
      <div className="border-b border-neutral-200">
        <button
          onClick={() => toggleSection('size')}
          className="w-full py-4 flex items-center justify-between text-left group"
        >
          <span className="text-xs font-bold tracking-[0.08em] uppercase text-neutral-900 group-hover:text-black">
            Size
          </span>
          {openSections.size ? (
            <FiChevronUp className="text-sm text-neutral-600" />
          ) : (
            <FiChevronDown className="text-sm text-neutral-600" />
          )}
        </button>

        {openSections.size && (
          <div className="pb-5 pt-1 space-y-3 max-h-56 overflow-y-auto pr-1">
            {KNOWN_SIZES.map((sz) => {
              const count = sizeCounts[sz] || 0;
              const isChecked = (filters.sizes || []).includes(sz);
              return (
                <label
                  key={sz}
                  className="flex items-center justify-between cursor-pointer group text-xs text-neutral-800 hover:text-black"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxToggle('sizes', sz)}
                      className="w-4 h-4 rounded-xs border-neutral-300 text-black accent-black focus:ring-0 cursor-pointer"
                    />
                    <span className="font-medium">{sz}</span>
                  </div>
                  <span className="text-neutral-400 font-normal">({count})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. COLOR SECTION */}
      <div className="border-b border-neutral-200">
        <button
          onClick={() => toggleSection('color')}
          className="w-full py-4 flex items-center justify-between text-left group"
        >
          <span className="text-xs font-bold tracking-[0.08em] uppercase text-neutral-900 group-hover:text-black">
            Color
          </span>
          {openSections.color ? (
            <FiChevronUp className="text-sm text-neutral-600" />
          ) : (
            <FiChevronDown className="text-sm text-neutral-600" />
          )}
        </button>

        {openSections.color && (
          <div className="pb-5 pt-1 space-y-3 max-h-56 overflow-y-auto pr-1">
            {colorOptions.length === 0 ? (
              <p className="text-xs text-neutral-400">No color options available</p>
            ) : (
              colorOptions.map((col) => {
                const count = colorMap[col] || 0;
                const isChecked = (filters.colors || []).includes(col);
                const hex = getColorHex(col);
                return (
                  <label
                    key={col}
                    className="flex items-center justify-between cursor-pointer group text-xs text-neutral-800 hover:text-black"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxToggle('colors', col)}
                        className="w-4 h-4 rounded-xs border-neutral-300 text-black accent-black focus:ring-0 cursor-pointer"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      <span>{col}</span>
                    </div>
                    <span className="text-neutral-400 font-normal">({count})</span>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 5. GENDER SECTION */}
      <div className="border-b border-neutral-200">
        <button
          onClick={() => toggleSection('gender')}
          className="w-full py-4 flex items-center justify-between text-left group"
        >
          <span className="text-xs font-bold tracking-[0.08em] uppercase text-neutral-900 group-hover:text-black">
            Gender
          </span>
          {openSections.gender ? (
            <FiChevronUp className="text-sm text-neutral-600" />
          ) : (
            <FiChevronDown className="text-sm text-neutral-600" />
          )}
        </button>

        {openSections.gender && (
          <div className="pb-5 pt-1 space-y-3">
            {GENDER_OPTIONS.map((g) => {
              const count = genderCounts[g] || 0;
              const isChecked = (filters.genders || []).includes(g);
              return (
                <label
                  key={g}
                  className="flex items-center justify-between cursor-pointer group text-xs text-neutral-800 hover:text-black"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxToggle('genders', g)}
                      className="w-4 h-4 rounded-xs border-neutral-300 text-black accent-black focus:ring-0 cursor-pointer"
                    />
                    <span>{g}</span>
                  </div>
                  <span className="text-neutral-400 font-normal">({count})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. FIT SECTION */}
      <div className="border-b border-neutral-200">
        <button
          onClick={() => toggleSection('fit')}
          className="w-full py-4 flex items-center justify-between text-left group"
        >
          <span className="text-xs font-bold tracking-[0.08em] uppercase text-neutral-900 group-hover:text-black">
            Fit
          </span>
          {openSections.fit ? (
            <FiChevronUp className="text-sm text-neutral-600" />
          ) : (
            <FiChevronDown className="text-sm text-neutral-600" />
          )}
        </button>

        {openSections.fit && (
          <div className="pb-5 pt-1 space-y-3">
            {FIT_OPTIONS.map((fit) => {
              const count = fitCounts[fit] || 0;
              const isChecked = (filters.fits || []).includes(fit);
              return (
                <label
                  key={fit}
                  className="flex items-center justify-between cursor-pointer group text-xs text-neutral-800 hover:text-black"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxToggle('fits', fit)}
                      className="w-4 h-4 rounded-xs border-neutral-300 text-black accent-black focus:ring-0 cursor-pointer"
                    />
                    <span>{fit}</span>
                  </div>
                  <span className="text-neutral-400 font-normal">({count})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default ShopFilters;
