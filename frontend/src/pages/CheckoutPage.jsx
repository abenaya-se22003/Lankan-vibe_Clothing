import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiCheckCircle,
  FiTruck,
  FiCreditCard,
  FiDollarSign,
  FiArrowRight,
  FiLock,
  FiShoppingBag,
} from 'react-icons/fi';

const CheckoutPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [city, setCity] = useState('Colombo');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const items = cart.items || [];
  const subtotal = cart.totalPrice || items.reduce((acc, it) => acc + (it.subtotal || it.productPrice * it.quantity), 0);
  const shippingFee = subtotal >= 8000 || items.length === 0 ? 0 : 350;
  const grandTotal = subtotal + shippingFee;

  const formatLKR = (amount) =>
    new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(amount);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!shippingAddress.trim() || !city.trim() || !phone.trim()) {
      toast.error('Please complete all required shipping fields');
      return;
    }

    try {
      setSubmitting(true);
      const orderPayload = {
        shippingAddress: shippingAddress.trim(),
        city: city.trim(),
        postalCode: postalCode.trim() || '00100',
        phone: phone.trim(),
        paymentMethod: paymentMethod,
      };

      const createdOrder = await orderAPI.createOrder(orderPayload);
      setCompletedOrder(createdOrder);
      await clearCart();
      toast.success('Your order has been placed successfully!');
    } catch (err) {
      console.error('Order creation error:', err);
      toast.error(err.response?.data?.message || 'Could not place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If user is not logged in, prompt authentication
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 min-h-screen">
        <div className="p-8 rounded-3xl bg-[#111424] border border-[#1e233d] text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#1b1f36] flex items-center justify-center mx-auto text-[#c9a84c] text-2xl">
            <FiLock />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Sign In to Complete Checkout</h2>
            <p className="text-xs text-gray-400 mt-2">
              Please sign in with your Lankan Vibe account so we can track and safeguard your Ceylon apparel order.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              to="/login?redirect=/checkout"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#e94560] to-[#c9a84c] text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition"
            >
              <span>Sign In</span>
              <FiArrowRight />
            </Link>
            <Link
              to="/register?redirect=/checkout"
              className="w-full py-3 rounded-xl bg-[#16192e] border border-[#2b3054] text-gray-300 font-semibold text-xs flex items-center justify-center hover:text-white transition"
            >
              <span>Create New Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If order was successfully completed
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 min-h-screen">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#111424] border border-emerald-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-4xl flex items-center justify-center mx-auto animate-bounce">
            <FiCheckCircle />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Order Confirmed & Received
            </span>
            <h1 className="text-3xl font-black text-white">
              Ayubowan! Thank You, {user?.fullName?.split(' ')[0]}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
              Your Lankan Vibe handcrafted order is now in our artisan queue. We will notify you when
              the island courier is on its way.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c0e1a] border border-[#1d223b] text-left text-xs space-y-2.5 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-gray-400">Order Reference ID:</span>
              <span className="font-bold text-[#c9a84c]">#{completedOrder.id || 'LV-2026-01'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Payment Method:</span>
              <span className="font-bold text-white">{completedOrder.paymentMethod || paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Delivery Destination:</span>
              <span className="font-medium text-white">{shippingAddress}, {city}</span>
            </div>
            <div className="flex justify-between border-t border-[#1f243d] pt-2">
              <span className="font-bold text-white">Total Amount:</span>
              <span className="font-black text-white text-sm">
                {formatLKR(completedOrder.totalAmount || grandTotal)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/orders"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#e94560] to-[#c9a84c] text-white text-xs font-bold hover:opacity-90 transition"
            >
              Track In My Orders
            </Link>
            <Link
              to="/shop"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#171a2d] border border-[#2b3052] text-gray-300 text-xs font-semibold hover:text-white transition"
            >
              Continue Exploring
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 min-h-screen text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">No items to checkout</h2>
        <p className="text-xs text-gray-400">Your cart is currently empty. Add items from our catalog.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#e94560] text-white text-xs font-semibold"
        >
          <FiShoppingBag /> Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      <div className="pb-4 border-b border-[#1f233d]">
        <span className="text-xs font-bold text-[#c9a84c] uppercase tracking-wider">
          Secure Order Finalization
        </span>
        <h1 className="text-3xl font-black text-white mt-1">Checkout & Delivery Details</h1>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111424] border border-[#1e233d] space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FiTruck className="text-[#e94560]" />
              <span>Sri Lanka Delivery Destination</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Recipient Full Name
                </label>
                <input
                  type="text"
                  value={user?.fullName || ''}
                  disabled
                  className="w-full bg-[#0c0e1a] text-xs text-gray-400 rounded-xl p-3 border border-[#232742] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +94 77 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-[#0c0e1a] text-xs text-white placeholder-gray-500 rounded-xl p-3 border border-[#232742] focus:outline-none focus:border-[#e94560]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Street Address & House / Flat No. *
                </label>
                <input
                  type="text"
                  placeholder="e.g. No. 45, Marine Drive, Kollupitiya"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                  className="w-full bg-[#0c0e1a] text-xs text-white placeholder-gray-500 rounded-xl p-3 border border-[#232742] focus:outline-none focus:border-[#e94560]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  City / District *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#0c0e1a] text-xs text-white rounded-xl p-3 border border-[#232742] focus:outline-none focus:border-[#e94560] cursor-pointer"
                >
                  <option value="Colombo">Colombo</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                  <option value="Negombo">Negombo</option>
                  <option value="Matara">Matara</option>
                  <option value="Kurunegala">Kurunegala</option>
                  <option value="Jaffna">Jaffna</option>
                  <option value="Kalutara">Kalutara</option>
                  <option value="Gampaha">Gampaha</option>
                  <option value="Batticaloa">Batticaloa</option>
                  <option value="Other">Other Island Location</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 00300"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-[#0c0e1a] text-xs text-white placeholder-gray-500 rounded-xl p-3 border border-[#232742] focus:outline-none focus:border-[#e94560]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111424] border border-[#1e233d] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FiCreditCard className="text-[#c9a84c]" />
              <span>Select Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'bg-[#181d36] border-[#e94560] shadow-md shadow-[#e94560]/10'
                    : 'bg-[#0c0e1a] border-[#202542] hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <FiDollarSign className="text-xl text-[#c9a84c]" />
                  <input
                    type="radio"
                    name="payment"
                    value="CASH_ON_DELIVERY"
                    checked={paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                    className="accent-[#e94560]"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Cash on Delivery</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Pay courier on arrival</p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'CARD'
                    ? 'bg-[#181d36] border-[#e94560] shadow-md shadow-[#e94560]/10'
                    : 'bg-[#0c0e1a] border-[#202542] hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <FiCreditCard className="text-xl text-[#e94560]" />
                  <input
                    type="radio"
                    name="payment"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="accent-[#e94560]"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Card Payment</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Visa / Mastercard gateway</p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'bg-[#181d36] border-[#e94560] shadow-md shadow-[#e94560]/10'
                    : 'bg-[#0c0e1a] border-[#202542] hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <FiLock className="text-xl text-emerald-400" />
                  <input
                    type="radio"
                    name="payment"
                    value="BANK_TRANSFER"
                    checked={paymentMethod === 'BANK_TRANSFER'}
                    onChange={() => setPaymentMethod('BANK_TRANSFER')}
                    className="accent-[#e94560]"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Direct Bank Transfer</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Commercial / Sampath Bank</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary & Submit button */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[#111424] border border-[#1e233d] space-y-5">
            <h3 className="text-base font-bold text-white pb-3 border-b border-[#1f233d]">
              Review Items ({items.length})
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <img
                      src={it.imageUrl || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'}
                      alt=""
                      className="w-8 h-10 object-cover rounded bg-[#0b0c16] shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-white truncate">{it.productName}</p>
                      <p className="text-[10px] text-gray-400">Qty: {it.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-200">
                    {formatLKR(it.subtotal || it.productPrice * it.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 pt-3 border-t border-[#1f233d] text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span className="font-semibold text-white">{formatLKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Courier Delivery</span>
                <span className="font-semibold text-white">
                  {shippingFee === 0 ? <span className="text-emerald-400">FREE</span> : formatLKR(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#1f233d]">
                <span className="text-sm font-bold text-white">Total Due</span>
                <span className="text-xl font-black text-white">
                  {formatLKR(grandTotal)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e94560] to-[#c9a84c] text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-[#e94560]/20 hover:opacity-95 transition disabled:opacity-50"
            >
              {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
