import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiArrowRight,
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiChevronRight,
  FiArrowLeft,
} from 'react-icons/fi';

const CartPage = () => {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const items = cart.items || [];

  // Helper to safely get the unit price
  const getItemUnitPrice = (it) => {
    const rawPrice = it.unitPrice ?? it.productPrice;
    if (rawPrice !== undefined && rawPrice !== null && !isNaN(Number(rawPrice))) {
      return Number(rawPrice);
    }
    if (it.subtotal && it.quantity) {
      return Number(it.subtotal) / Number(it.quantity);
    }
    return 0;
  };

  // Helper to safely get item subtotal
  const getItemSubtotal = (it) => {
    if (it.subtotal !== undefined && it.subtotal !== null && !isNaN(Number(it.subtotal))) {
      return Number(it.subtotal);
    }
    const unit = getItemUnitPrice(it);
    return unit * (it.quantity || 1);
  };

  const subtotal =
    cart.totalPrice && !isNaN(Number(cart.totalPrice))
      ? Number(cart.totalPrice)
      : items.reduce((acc, it) => acc + getItemSubtotal(it), 0);

  const FREE_SHIPPING_THRESHOLD = 8000;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0;
  const shippingFee = isFreeShipping ? 0 : 350;
  const grandTotal = subtotal + shippingFee;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const formatLKR = (amount) => {
    const num = Number(amount);
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(isNaN(num) ? 0 : num);
  };

  const totalItemCount = cart.totalItems || items.reduce((acc, it) => acc + (it.quantity || 1), 0);

  return (
    <div className="bg-white min-h-screen text-neutral-900">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <FiChevronRight className="text-[10px]" />
          <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
          <FiChevronRight className="text-[10px]" />
          <span className="text-neutral-900 font-medium">Shopping Bag</span>
        </nav>

        {/* Page Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
              Shopping Bag
            </h1>
            <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">
              {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in your bag
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-neutral-400 hover:text-black underline underline-offset-4 transition self-start sm:self-auto"
            >
              Clear Bag
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State - Minimalist */
          <div className="py-24 px-4 text-center max-w-lg mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full border border-neutral-200 flex items-center justify-center mx-auto text-neutral-400 text-2xl">
              <FiShoppingBag strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
                Your Bag Is Currently Empty
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
                Explore our handcrafted Sri Lankan batik shirts, wrap dresses, and island essentials.
              </p>
            </div>
            <div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition rounded-md"
              >
                <span>Continue Shopping</span>
                <FiArrowRight />
              </Link>
            </div>
          </div>
        ) : (
          /* Main Cart Content */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Cart Items (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Minimalist Free Delivery Progress Bar */}
              <div className="p-4 sm:p-5 border border-neutral-200 rounded-lg bg-neutral-50/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-neutral-800">
                    <FiTruck className="text-neutral-900 text-sm" />
                    {isFreeShipping ? (
                      <span className="font-semibold text-neutral-900">
                        You have unlocked complimentary Islandwide Delivery!
                      </span>
                    ) : (
                      <span>
                        Add{' '}
                        <strong className="text-neutral-900 font-bold">
                          {formatLKR(remainingForFreeShipping)}
                        </strong>{' '}
                        more to qualify for <span className="font-semibold">Free Islandwide Delivery</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-neutral-600">
                    {progressPercent}%
                  </span>
                </div>
                
                {/* Thin sleek progress bar */}
                <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="border-t border-neutral-200 divide-y divide-neutral-200">
                {items.map((item) => {
                  const unitPrice = getItemUnitPrice(item);
                  const itemSubtotal = getItemSubtotal(item);

                  return (
                    <div
                      key={item.id}
                      className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 group"
                    >
                      {/* Product Image + Details */}
                      <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
                        <Link
                          to={`/product/${item.productId}`}
                          className="w-20 h-24 sm:w-24 sm:h-32 bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200 rounded-sm"
                        >
                          <img
                            src={
                              item.imageUrl ||
                              'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'
                            }
                            alt={item.productName}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600';
                            }}
                          />
                        </Link>

                        <div className="space-y-1.5 min-w-0">
                          <Link
                            to={`/product/${item.productId}`}
                            className="text-sm font-bold uppercase tracking-tight text-neutral-900 hover:text-neutral-600 transition block truncate"
                          >
                            {item.productName}
                          </Link>

                          {/* Unit price */}
                          <p className="text-xs text-neutral-500">
                            Unit Price: <span className="font-medium text-neutral-800">{formatLKR(unitPrice)}</span>
                          </p>

                          {/* Subtotal on mobile */}
                          <p className="text-xs font-bold text-neutral-900 sm:hidden pt-1">
                            Total: {formatLKR(itemSubtotal)}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls & Line Total */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-neutral-300 rounded-sm bg-white overflow-hidden shadow-xs">
                          <button
                            type="button"
                            id={`decrease-qty-${item.id ?? item.productId}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const currentQty = Number(item.quantity) || 1;
                              updateQuantity(item.id ?? item.productId, currentQty - 1);
                            }}
                            className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-black hover:bg-neutral-100 active:bg-neutral-200 active:scale-95 transition cursor-pointer select-none"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus className="text-xs" />
                          </button>
                          <span className="w-9 text-center text-xs font-bold text-neutral-900 select-none tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            id={`increase-qty-${item.id ?? item.productId}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const currentQty = Number(item.quantity) || 1;
                              updateQuantity(item.id ?? item.productId, currentQty + 1);
                            }}
                            className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-black hover:bg-neutral-100 active:bg-neutral-200 active:scale-95 transition cursor-pointer select-none"
                            aria-label="Increase quantity"
                          >
                            <FiPlus className="text-xs" />
                          </button>
                        </div>

                        {/* Subtotal (Desktop) */}
                        <div className="hidden sm:block text-right min-w-[100px]">
                          <span className="text-sm font-bold text-neutral-900">
                            {formatLKR(itemSubtotal)}
                          </span>
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          id={`remove-item-${item.id ?? item.productId}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeItem(item.id ?? item.productId);
                          }}
                          className="p-2 text-neutral-400 hover:text-red-600 active:scale-90 transition cursor-pointer"
                          title="Remove item"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Back to Shop Link */}
              <div className="pt-2">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 text-xs font-bold text-neutral-900 uppercase tracking-wider underline underline-offset-4 hover:text-neutral-600 transition"
                >
                  <FiArrowLeft className="text-sm" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary (4 cols) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="border border-neutral-200 rounded-lg p-6 sm:p-7 bg-neutral-50/70 space-y-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 pb-3 border-b border-neutral-200">
                  Order Summary
                </h2>

                <div className="space-y-3.5 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Items ({totalItemCount})</span>
                    <span className="font-semibold text-neutral-900">{formatLKR(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Islandwide Shipping</span>
                    <span className="font-semibold text-neutral-900">
                      {isFreeShipping ? (
                        <span className="text-emerald-700 font-bold uppercase tracking-wider text-[11px]">Free</span>
                      ) : (
                        formatLKR(shippingFee)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estimated Taxes</span>
                    <span className="text-neutral-500">Included</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="pt-4 border-t border-neutral-200 flex justify-between items-baseline">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">Total</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-neutral-900">
                    {formatLKR(grandTotal)}
                  </span>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-neutral-900 text-white rounded-md text-xs font-bold uppercase tracking-widest hover:bg-black active:scale-[0.99] transition shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Proceed To Checkout</span>
                  <FiArrowRight className="text-sm" />
                </button>

                {/* Assurances */}
                <div className="pt-4 border-t border-neutral-200 space-y-2.5 text-[11px] text-neutral-500">
                  <div className="flex items-center gap-2.5">
                    <FiShield className="text-neutral-700 text-xs shrink-0" />
                    <span>Encrypted & safe checkout</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FiTruck className="text-neutral-700 text-xs shrink-0" />
                    <span>Islandwide delivery within 2–4 business days</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FiRefreshCw className="text-neutral-700 text-xs shrink-0" />
                    <span>7-day return and exchange policy</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CartPage;
