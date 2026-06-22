import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiShoppingBag, FiPackage, FiCheckCircle, FiCreditCard, FiAlertCircle, FiArrowRight, FiClock, FiMapPin } from 'react-icons/fi';
import { formatPrice } from '../utils/currency';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { currentCurrency, exchangeRate } = useSelector((state) => state.currency);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Dynamically load Paystack Inline SDK script
  useEffect(() => {
    if (window.PaystackPop) return;
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const fetchMyOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await api.get('/orders/myorders');
      setOrders(response.data.orders);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyOrders();
    }
  }, [isAuthenticated]);

  const initiatePaystackPayment = async (order) => {
    setProcessingPayment(order._id);
    try {
      const keyResponse = await api.get('/orders/config/paystack');
      const publicKey = keyResponse.data?.publicKey;

      if (!publicKey) {
        // Fallback to Mock Payment if no Paystack key is set in .env
        const paymentDetails = {
          id: `PAYSTACK_MOCK_TXN_${Math.floor(Math.random() * 1000000)}`,
          status: 'success',
          reference: `NKY_${order._id.substring(0, 8)}`
        };
        await api.put(`/orders/${order._id}/pay`, paymentDetails);
        toast.success('Payment authorized successfully (Mock Mode)!');
        fetchMyOrders();
        return;
      }

      if (!window.PaystackPop) {
        toast.error('Paystack SDK is still loading, please retry in a second.');
        return;
      }

      const amountKobo = Math.round(order.totalPrice * 100);
      const referenceCode = `NKY_${order._id}_${Date.now()}`;

      // Handle older legacy SDK (v1) setup
      if (typeof window.PaystackPop.setup === 'function') {
        const handler = window.PaystackPop.setup({
          key: publicKey,
          email: user.email,
          amount: amountKobo,
          currency: 'NGN',
          ref: referenceCode,
          callback: function (response) {
            setProcessingPayment(order._id);
            api.put(`/orders/${order._id}/pay`, { reference: response.reference })
              .then(() => {
                toast.success('Payment authorized and verified! Order completed.');
                fetchMyOrders();
              })
              .catch((err) => {
                toast.error(err.response?.data?.message || 'Transaction verification failed');
              })
              .finally(() => {
                setProcessingPayment(null);
              });
          },
          onClose: function () {
            toast.error('Payment window closed.');
            setProcessingPayment(null);
          }
        });
        handler.openIframe();
      } else {
        // Handle modern class-based SDK (v2)
        const paystack = new window.PaystackPop();
        paystack.newTransaction({
          key: publicKey,
          email: user.email,
          amount: amountKobo,
          currency: 'NGN',
          ref: referenceCode,
          onSuccess: function (response) {
            setProcessingPayment(order._id);
            api.put(`/orders/${order._id}/pay`, { reference: response.reference })
              .then(() => {
                toast.success('Payment authorized and verified! Order completed.');
                fetchMyOrders();
              })
              .catch((err) => {
                toast.error(err.response?.data?.message || 'Transaction verification failed');
              })
              .finally(() => {
                setProcessingPayment(null);
              });
          },
          onCancel: function () {
            toast.closeAll && toast.closeAll();
            toast.error('Payment window closed.');
            setProcessingPayment(null);
          }
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not initialize Paystack payment');
    } finally {
      setProcessingPayment(null);
    }
  };

  const toggleExpandOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 my-12 bg-white border border-luxury-gold/15 text-center space-y-6 shadow-sm">
        <FiShoppingBag className="text-5xl text-luxury-gold mx-auto animate-pulse" />
        <h1 className="font-serif text-2xl text-luxury-black font-bold uppercase tracking-wider">Order History</h1>
        <p className="text-luxury-gray text-xs leading-relaxed max-w-sm mx-auto">
          Please log in to view your order history. If you checked out as a guest, create an account using the <strong>same email address</strong> you used during purchase to automatically link and view your past orders.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <Link
            to="/login?redirect=order-history"
            className="bg-luxury-black text-white border border-luxury-gold px-6 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-luxury-gold hover:text-luxury-black transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register?redirect=order-history"
            className="bg-white text-luxury-black border border-luxury-black px-6 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-luxury-black hover:text-white transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8 font-sans text-xs">
      <div className="border-b border-luxury-gold/15 pb-6 text-center md:text-left">
        <h1 className="font-serif text-3xl text-luxury-black font-bold uppercase tracking-wide">Order History</h1>
        <p className="font-sans text-[9px] text-luxury-gray uppercase tracking-widest font-semibold mt-1">
          Review and manage your custom jewelry & timepiece orders
        </p>
      </div>

      {loadingOrders ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 skeleton max-w-full"></div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const isUnpaidCard = !order.isPaid && order.paymentMethod === 'Card';
            return (
              <div
                key={order._id}
                className="bg-white border border-luxury-gold/10 hover:border-luxury-gold/30 transition-all shadow-sm overflow-hidden"
              >
                {/* Order Header Summary Row */}
                <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-slate-400">ORDER ID: {order._id}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-luxury-gray text-[10px] font-semibold uppercase tracking-wider">
                      <span>Date: <strong className="text-luxury-black">{new Date(order.createdAt).toLocaleDateString()}</strong></span>
                      <span>Total: <strong className="text-luxury-gold">{formatPrice(order.totalPrice, currentCurrency, exchangeRate)}</strong></span>
                      <span>Method: <strong className="text-luxury-black">{order.paymentMethod}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {/* Payment badge */}
                    <span
                      className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${
                        order.isPaid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>

                    {/* Delivery status badge */}
                    <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {order.status}
                    </span>

                    {/* Pay button or details toggle */}
                    <button
                      onClick={() => toggleExpandOrder(order._id)}
                      className="text-luxury-gold hover:text-luxury-black font-semibold uppercase tracking-wider text-[10px] ml-auto sm:ml-0 cursor-pointer"
                    >
                      {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>

                {/* Unpaid Card Order CTA bar */}
                {isUnpaidCard && (
                  <div className="bg-amber-50/30 border-t border-b border-amber-100 px-5 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-amber-800 text-[10px] font-semibold">
                      <FiAlertCircle className="text-base flex-shrink-0" />
                      <span>This order requires payment verification. Secure Paystack payment is pending.</span>
                    </div>
                    <button
                      onClick={() => initiatePaystackPayment(order)}
                      disabled={processingPayment === order._id}
                      className="bg-luxury-black text-white border border-luxury-gold px-4 py-2 text-[9px] uppercase font-bold tracking-widest hover:bg-luxury-gold hover:text-luxury-black transition-colors disabled:opacity-50 cursor-pointer w-full sm:w-auto text-center"
                    >
                      {processingPayment === order._id ? 'Launching Gateway...' : 'Verify / Pay Now'}
                    </button>
                  </div>
                )}

                {/* Expanded Details Section */}
                {expandedOrder === order._id && (
                  <div className="p-5 border-t border-luxury-gold/5 space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Items Ordered */}
                      <div className="space-y-4">
                        <h4 className="font-serif text-[11px] text-luxury-black uppercase tracking-wider border-b border-luxury-gold/10 pb-1.5 flex items-center gap-2">
                          <FiPackage className="text-luxury-gold" />
                          <span>Purchased Items ({order.orderItems.length})</span>
                        </h4>
                        <div className="space-y-3">
                          {order.orderItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-0 pb-2">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-12 w-12 object-cover border border-luxury-gold/10 bg-white"
                                />
                                <div>
                                  <h5 className="font-semibold text-luxury-black uppercase tracking-wide truncate max-w-[200px]">
                                    {item.name}
                                  </h5>
                                  <p className="text-luxury-gray text-[9px]">
                                    QTY: {item.quantity} | {formatPrice(item.price, currentCurrency, exchangeRate)}
                                  </p>
                                </div>
                              </div>
                              <span className="font-bold text-luxury-black">
                                {formatPrice(item.price * item.quantity, currentCurrency, exchangeRate)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address & Summary info */}
                      <div className="space-y-6">
                        {/* Delivery Info */}
                        <div className="space-y-2">
                          <h4 className="font-serif text-[11px] text-luxury-black uppercase tracking-wider border-b border-luxury-gold/10 pb-1.5 flex items-center gap-2">
                            <FiMapPin className="text-luxury-gold" />
                            <span>Delivery Details</span>
                          </h4>
                          <div className="text-luxury-gray leading-relaxed text-[11px] space-y-0.5">
                            <p className="font-bold text-luxury-black uppercase tracking-wider">
                              {order.shippingAddress.name || 'Valued Client'}
                            </p>
                            <p>{order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                            <p>{order.shippingAddress.country} {order.shippingAddress.zipCode ? `- ${order.shippingAddress.zipCode}` : ''}</p>
                          </div>
                        </div>

                        {/* Order breakdown */}
                        <div className="bg-slate-50/50 p-4 border border-luxury-gold/5 space-y-2 text-[10px] font-semibold text-luxury-gray">
                          <div className="flex justify-between">
                            <span>Items Subtotal</span>
                            <span>{formatPrice(order.itemsPrice, currentCurrency, exchangeRate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping Fee</span>
                            <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 border border-slate-200/50 uppercase font-bold tracking-wider">Paid on Delivery</span>
                          </div>
                          <div className="flex justify-between text-luxury-black text-xs font-bold border-t border-dashed border-slate-200 pt-2 mt-2">
                            <span>Total Price</span>
                            <span className="text-luxury-gold">{formatPrice(order.totalPrice, currentCurrency, exchangeRate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-luxury-gold/10">
          <FiShoppingBag className="text-4xl text-luxury-gold mx-auto mb-3" />
          <h2 className="font-serif text-lg text-luxury-black font-bold uppercase tracking-wide">No orders found</h2>
          <p className="text-luxury-gray text-xs mt-1 max-w-xs mx-auto leading-relaxed">
            You have not placed any orders under this account email address yet.
          </p>
          <Link
            to="/shop"
            className="mt-6 bg-luxury-black text-white border border-luxury-gold px-8 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-luxury-gold hover:text-luxury-black transition-colors inline-block"
          >
            Explore Collections
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
