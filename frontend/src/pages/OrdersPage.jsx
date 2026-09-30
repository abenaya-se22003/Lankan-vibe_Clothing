import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiPackage,
  FiClock,
  FiMapPin,
  FiShoppingBag,
  FiCheckCircle,
  FiTruck,
  FiXCircle,
} from 'react-icons/fi';

const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderAPI.getMyOrders();
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const formatLKR = (amount) =>
    new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(amount);

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <FiCheckCircle /> Delivered
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <FiTruck /> Shipped & In Transit
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <FiClock /> In Production / Processing
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
            <FiXCircle /> Cancelled
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
            <FiClock /> Pending Confirmation
          </span>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 min-h-screen text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Please Sign In</h2>
        <p className="text-xs text-gray-400">Sign in to view your order history and tracking details.</p>
        <Link
          to="/login?redirect=/orders"
          className="inline-flex px-6 py-2.5 rounded-xl bg-[#e94560] text-white text-xs font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      <div className="pb-4 border-b border-[#1f233d]">
        <span className="text-xs font-bold text-[#c9a84c] uppercase tracking-wider">
          Order Tracking
        </span>
        <h1 className="text-3xl font-black text-white mt-1">My Orders & Receipts</h1>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">
          Loading your order history...
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#111424] border border-[#1e233d] space-y-4">
          <FiPackage className="mx-auto text-4xl text-gray-600" />
          <h3 className="text-lg font-bold text-white">No Orders Placed Yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Once you order handloom shirts, batik dresses, or sarongs, their real-time delivery status will appear here.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#e94560] to-[#c9a84c] text-white font-bold text-xs shadow-md shadow-[#e94560]/20 hover:opacity-95 transition"
          >
            <FiShoppingBag /> Explore Collections
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-6 rounded-3xl bg-[#111424] border border-[#1e233d] space-y-4 hover:border-[#2b3052] transition shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1e233d]">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#181d33] rounded-2xl text-[#c9a84c]">
                    <FiPackage className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Order #{order.id}</h3>
                    <p className="text-[11px] text-gray-400">
                      Placed on{' '}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-LK', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Recent'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                {order.items?.map((it) => (
                  <div key={it.id} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-3">
                      <img
                        src={it.imageUrl || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'}
                        alt=""
                        className="w-12 h-14 object-cover rounded-xl bg-[#0b0c16]"
                      />
                      <div>
                        <p className="font-semibold text-white">{it.productName}</p>
                        <p className="text-gray-400 text-[11px]">
                          Qty: {it.quantity} × {formatLKR(it.unitPrice)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-white">{formatLKR(it.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Order Footer Details */}
              <div className="pt-3 border-t border-[#1e233d] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-400 gap-2">
                <div className="flex items-center gap-1.5">
                  <FiMapPin className="text-[#e94560]" />
                  <span>
                    {order.shippingAddress}, {order.city}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Total Paid ({order.paymentMethod || 'COD'}):</span>
                  <span className="text-base font-black text-white">
                    {formatLKR(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
