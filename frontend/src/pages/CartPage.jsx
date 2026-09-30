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
} from 'react-icons/fi';

const CartPage = () => {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const items = cart.items || [];
  const subtotal = cart.totalPrice || items.reduce((acc, it) => acc + (it.subtotal || it.productPrice * it.quantity), 0);
  const FREE_SHIPPING_THRESHOLD = 8000;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0 ? 0 : 350;
  const grandTotal = subtotal + shippingFee;

  const formatLKR = (amount) =>
    new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      {/* Title */}
      <div className="pb-4 border-b border-[#1f233d] flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#c9a84c] uppercase tracking-wider">
            Shopping Bag
          </span>
          <h1 className="text-3xl font-black text-white mt-1">Your Selected Apparel</h1>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-300 font-semibold transition"
          >
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center rounded-3xl bg-[#111424] border border-[#1e233d] space-y-5">
          <div className="w-20 h-20 rounded-full bg-[#1b1f36] flex items-center justify-center mx-auto text-gray-500 text-3xl">
            <FiShoppingBag />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Your Cart is Empty</h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
              You haven't added any Lankan Vibe pieces yet. Explore our handcrafted batik and handloom
              catalog!
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#e94560] to-[#c9a84c] text-white font-bold text-xs shadow-lg shadow-[#e94560]/20 hover:opacity-95 transition"
          >
            <span>Start Shopping</span>
            <FiArrowRight />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Shipping Alert Bar */}
            <div className="p-4 rounded-2xl bg-[#14172a] border border-[#212642] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-gray-300 font-medium">
                  <FiTruck className="text-[#c9a84c]" />
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                    <span className="text-emerald-400 font-bold">
                      🎉 Congratulations! You have unlocked FREE Islandwide Delivery!
                    </span>
                  ) : (
                    <span>
                      Add{' '}
                      <strong className="text-[#c9a84c]">
                        {formatLKR(FREE_SHIPPING_THRESHOLD - subtotal)}
                      </strong>{' '}
                      more to qualify for Free Islandwide Delivery
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1f243d] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#e94560] to-[#c9a84c] rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Items Cards */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#111424] border border-[#1e233d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#2f365d] transition"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        item.imageUrl ||
                        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'
                      }
                      alt={item.productName}
                      className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl bg-[#0b0c16] shrink-0"
                    />
                    <div>
                      <Link
                        to={`/product/${item.productId}`}
                        className="text-sm font-bold text-white hover:text-[#e94560] transition line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Unit Price: {formatLKR(item.productPrice)}
                      </p>
                      <span className="text-xs font-bold text-[#c9a84c] mt-1 block">
                        Subtotal: {formatLKR(item.subtotal || item.productPrice * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1f233d]">
                    {/* Quantity controls */}
                    <div className="flex items-center bg-[#15192c] border border-[#232845] rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 text-gray-400 hover:text-white transition"
                      >
                        <FiMinus className="text-xs" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-gray-400 hover:text-white transition"
                      >
                        <FiPlus className="text-xs" />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Remove Item"
                    >
                      <FiTrash2 className="text-base" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-[#111424] border border-[#1e233d] space-y-5">
              <h3 className="text-base font-bold text-white pb-3 border-b border-[#1f233d]">
                Order Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Cart Items ({cart.totalItems || items.length})</span>
                  <span className="font-semibold text-white">{formatLKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Islandwide Shipping</span>
                  <span className="font-semibold text-white">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-400">FREE</span>
                    ) : (
                      formatLKR(shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Sales Taxes</span>
                  <span className="text-emerald-400">Included</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1f233d] flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total Amount</span>
                <span className="text-2xl font-black text-white">
                  {formatLKR(grandTotal)}
                </span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e94560] to-[#c9a84c] text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-[#e94560]/20 hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                <span>Proceed To Checkout</span>
                <FiArrowRight />
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-gray-400">
                <FiShield className="text-emerald-400 text-sm" />
                <span>Encrypted & Guaranteed Checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
