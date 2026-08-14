import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { FiCheckCircle, FiPackage, FiShoppingBag, FiTruck, FiCreditCard, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { formatPrice } from '../utils/currency';
import toast from 'react-hot-toast';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { currentCurrency, exchangeRate } = useSelector((state) => state.currency);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Dynamically load Paystack Inline SDK script
  useEffect(() => {
    if (window.PaystackPop) return;
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const initiatePaystackPayment = (targetOrder) => {
    setProcessingPayment(true);
    api.get('/orders/config/paystack')
      .then((keyResponse) => {
        const publicKey = keyResponse.data?.publicKey;

        if (!publicKey) {
          // Fallback to Mock Payment
          const paymentDetails = {
            id: `PAYSTACK_MOCK_TXN_${Math.floor(Math.random() * 1000000)}`,
            status: 'success',
            reference: `NKY_${targetOrder._id.substring(0, 8)}`
          };
          return api.put(`/orders/${targetOrder._id}/pay`, paymentDetails)
            .then(() => {
              toast.success('Payment authorized successfully (Mock Mode)!');
              return api.get(`/orders/${orderId}`);
            })
            .then((res) => {
              setOrder(res.data.order);
            });
        }

        if (!window.PaystackPop) {
          toast.error('Paystack SDK is still loading, please retry in a second.');
          return;
        }

        const amountKobo = Math.round(targetOrder.totalPrice * 100);
        const referenceCode = `NKY_${targetOrder._id}_${Date.now()}`;

        // Handle legacy setup
        if (typeof window.PaystackPop.setup === 'function') {
          const handler = window.PaystackPop.setup({
            key: publicKey,
            email: targetOrder.email,
            amount: amountKobo,
            currency: 'NGN',
            ref: referenceCode,
            callback: function (response) {
              setProcessingPayment(true);
              api.put(`/orders/${targetOrder._id}/pay`, { reference: response.reference })
                .then(() => {
                  toast.success('Payment verified successfully!');
                  return api.get(`/orders/${orderId}`);
                })
                .then((res) => {
                  setOrder(res.data.order);
                })
                .catch((err) => {
                  toast.error(err.response?.data?.message || 'Transaction verification failed');
                })
                .finally(() => {
                  setProcessingPayment(false);
                });
            },
            onClose: function () {
              toast.error('Payment window closed.');
              setProcessingPayment(false);
            }
          });
          handler.openIframe();
        } else {
          // Handle modern newTransaction
          const paystack = new window.PaystackPop();
          paystack.newTransaction({
            key: publicKey,
            email: targetOrder.email,
            amount: amountKobo,
            currency: 'NGN',
            ref: referenceCode,
            onSuccess: function (response) {
              setProcessingPayment(true);
              api.put(`/orders/${targetOrder._id}/pay`, { reference: response.reference })
                .then(() => {
                  toast.success('Payment verified successfully!');
                  return api.get(`/orders/${orderId}`);
                })
                .then((res) => {
                  setOrder(res.data.order);
                })
                .catch((err) => {
                  toast.error(err.response?.data?.message || 'Transaction verification failed');
                })
                .finally(() => {
                  setProcessingPayment(false);
                });
            },
            onCancel: function () {
              toast.closeAll && toast.closeAll();
              toast.error('Payment window closed.');
              setProcessingPayment(false);
            }
          });
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Could not initialize Paystack payment');
      })
      .finally(() => {
        setProcessingPayment(false);
      });
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data.order);
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-4">
        <div className="h-40 skeleton max-w-lg mx-auto"></div>
        <div className="h-60 skeleton max-w-lg mx-auto"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-6">
        <h2 className="font-serif text-2xl text-luxury-black font-bold">Order Not Found</h2>
        <p className="text-luxury-gray text-xs">We could not retrieve the details for this order. Please verify your reference or check your email.</p>
        <Link to="/shop" className="bg-luxury-black text-white px-6 py-3 border border-luxury-gold text-xs font-semibold uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-black transition-colors inline-block">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-12 font-sans text-xs">
      {/* 1. Success Message Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`text-center p-8 space-y-4 rounded border ${
          order.isPaid
            ? 'bg-green-50/20 border-green-200/35'
            : 'bg-amber-50/20 border-amber-200/35'
        }`}
      >
        {order.isPaid ? (
          <>
            <FiCheckCircle className="text-5xl text-green-700 mx-auto animate-bounce" />
            <h1 className="font-serif text-3xl text-luxury-black font-bold uppercase tracking-wide">Order Confirmed!</h1>
            <p className="text-luxury-gray max-w-md mx-auto leading-relaxed text-xs">
              Thank you for your purchase. We have received your order and sent a confirmation email to <strong className="text-luxury-black font-semibold">{order.email}</strong>.
            </p>
          </>
        ) : (
          <>
            <FiClock className="text-5xl text-amber-600 mx-auto animate-pulse" />
            <h1 className="font-serif text-3xl text-luxury-black font-bold uppercase tracking-wide">Payment Pending</h1>
            <p className="text-luxury-gray max-w-md mx-auto leading-relaxed text-xs">
              Your order has been registered, but payment verification is pending. Please complete your transaction to process delivery.
            </p>
            {/* Pay Now Button directly on page */}
            <div className="pt-2">
              <button
                onClick={() => initiatePaystackPayment(order)}
                disabled={processingPayment}
                className="bg-luxury-black text-white border border-luxury-gold px-6 py-2.5 text-[9px] uppercase font-bold tracking-widest hover:bg-luxury-gold hover:text-luxury-black transition-colors inline-block cursor-pointer"
              >
                {processingPayment ? 'Launching Gateway...' : 'Pay with Paystack'}
              </button>
            </div>
          </>
        )}
        <p className="text-[10px] text-slate-400 font-mono">
          Order ID: {order.orderId || order._id} | Status: <span className="font-bold text-luxury-gold uppercase tracking-wider">{order.status}</span>
        </p>
      </motion.div>

      {/* 2. Order Summary Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left Side: Items list */}
        <div className="bg-white p-6 border border-luxury-gold/10 space-y-6">
          <h3 className="font-serif text-md text-luxury-black border-b border-luxury-gold/10 pb-2 flex items-center gap-2">
            <FiPackage className="text-luxury-gold text-base" />
            <span>Items Purchased</span>
          </h3>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {order.orderItems.map((item) => (
              <div key={item._id} className="flex gap-4 items-center border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div className="h-16 w-16 overflow-hidden flex-shrink-0 bg-slate-50 border border-luxury-gold/10">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-grow space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-luxury-black uppercase tracking-wide truncate max-w-[180px]">{item.name}</h4>
                    {item.color && (
                      <span className="text-[8px] bg-luxury-gold/15 text-luxury-gold px-1.5 py-0.5 border border-luxury-gold/25 uppercase font-bold rounded">
                        {item.color}
                      </span>
                    )}
                  </div>
                  <p className="text-luxury-gray text-[10px]">QTY: {item.quantity} | {formatPrice(item.price, currentCurrency, exchangeRate)}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-luxury-black">{formatPrice(item.price * item.quantity, currentCurrency, exchangeRate)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-luxury-gold/10 pt-4 space-y-2 font-semibold">
            <div className="flex justify-between text-luxury-gray">
              <span>Items Total</span>
              <span>{formatPrice(order.itemsPrice, currentCurrency, exchangeRate)}</span>
            </div>
            <div className="flex justify-between text-luxury-gray items-center">
              <span>Delivery Fee</span>
              <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 border border-slate-200/50 uppercase font-bold tracking-wider">Paid on Delivery</span>
            </div>
            <div className="flex justify-between text-luxury-black text-sm border-t border-dashed border-slate-200 pt-2 font-bold">
              <span>Total Paid</span>
              <span className="text-luxury-gold">{formatPrice(order.totalPrice, currentCurrency, exchangeRate)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Shipping & Payment summary */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white p-6 border border-luxury-gold/10 space-y-4">
            <h3 className="font-serif text-md text-luxury-black border-b border-luxury-gold/10 pb-2 flex items-center gap-2">
              <FiTruck className="text-luxury-gold text-base" />
              <span>Delivery Details</span>
            </h3>
            <div className="space-y-1 text-luxury-gray leading-relaxed">
              <p className="font-bold text-luxury-black uppercase tracking-wider">{order.shippingAddress.name || 'Valued Guest Client'}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p>{order.shippingAddress.country} {order.shippingAddress.zipCode ? `- ${order.shippingAddress.zipCode}` : ''}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 border border-luxury-gold/10 space-y-4">
            <h3 className="font-serif text-md text-luxury-black border-b border-luxury-gold/10 pb-2 flex items-center gap-2">
              <FiCreditCard className="text-luxury-gold text-base" />
              <span>Payment Summary</span>
            </h3>
            <div className="space-y-2 text-luxury-gray">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-semibold text-luxury-black">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Status:</span>
                <span className={`px-2 py-0.5 font-bold uppercase text-[9px] ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {order.isPaid ? `Paid (${new Date(order.paidAt).toLocaleDateString()})` : 'Unpaid'}
                </span>
              </div>
              {order.paymentResult && order.paymentResult.reference && (
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-mono text-[9px]">{order.paymentResult.reference}</span>
                </div>
              )}
            </div>
          </div>

          {/* Store Policies */}
          <div className="bg-slate-50 border-l border-luxury-gold/50 p-4 text-[10px] space-y-2 text-slate-800 leading-relaxed font-sans">
            <p className="font-bold uppercase tracking-wider text-slate-900">Store Policies</p>
            <p>• <strong>Return & Refund Policy:</strong> Returns or exchanges are accepted within 7 days. See our <a href="/refund-policy" target="_blank" className="text-luxury-gold underline">Refund & Return Policy</a>.</p>
            <p>• <strong>Delivery Timeframe:</strong> Standard delivery takes 3-10 days. For custom-made orders, the timeline will be communicated directly to you once it is ready.</p>
            <p>• <strong>Delivery Fee:</strong> Paid directly to the courier agent. The exact fee is calculated and communicated once the item is ready for shipment.</p>
          </div>
        </div>

      </div>

      {!order.user && (
        <div className="bg-amber-50/20 border border-luxury-gold/20 p-6 text-center space-y-3 max-w-xl mx-auto rounded">
          <p className="font-serif font-bold text-luxury-black uppercase tracking-wider text-xs">Guest Checkout Notification</p>
          <p className="text-luxury-gray text-[11px] leading-relaxed">
            You placed this order as a guest. Register an account using your order email <strong className="text-luxury-black font-semibold">{order.email}</strong> to automatically sync this and any past orders to your private dashboard.
          </p>
          <Link
            to={`/register?email=${encodeURIComponent(order.email)}&redirect=order-history`}
            className="inline-block bg-luxury-black text-white border border-luxury-gold px-6 py-2.5 text-[9px] uppercase font-bold tracking-widest hover:bg-luxury-gold hover:text-luxury-black transition-colors"
          >
            Create Account Now
          </Link>
        </div>
      )}

      {/* 3. Actions Button CTA */}
      <div className="flex gap-4 justify-center">
        <Link to="/shop" className="bg-luxury-black text-white border border-luxury-gold px-8 py-4 font-semibold uppercase tracking-widest text-[10px] hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300 flex items-center gap-2">
          <FiShoppingBag /> Continue Shopping
        </Link>
        {order.user ? (
          <Link to="/order-history" className="bg-white text-luxury-black border border-luxury-black px-8 py-4 font-semibold uppercase tracking-widest text-[10px] hover:bg-luxury-black hover:text-white transition-all duration-300">
            View My Orders
          </Link>
        ) : (
          <Link to={`/register?email=${encodeURIComponent(order.email)}&redirect=order-history`} className="bg-white text-luxury-black border border-luxury-black px-8 py-4 font-semibold uppercase tracking-widest text-[10px] hover:bg-luxury-black hover:text-white transition-all duration-300">
            Track Order History
          </Link>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation;
