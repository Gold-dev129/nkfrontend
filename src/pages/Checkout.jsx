import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api';
import { setCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';
import { FiCreditCard, FiInbox, FiTruck, FiPlus, FiCheckCircle } from 'react-icons/fi';
import { formatPrice } from '../utils/currency';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { currentCurrency, exchangeRate } = useSelector((state) => state.currency);

  const cartItems = cart?.items || [];

  // Form states
  const [shippingName, setShippingName] = useState(user?.name || '');
  const [shippingPhone, setShippingPhone] = useState(user?.phoneNumber || '');
  const [shippingEmail, setShippingEmail] = useState(user?.email || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  
  // Checkout process states
  const [processing, setProcessing] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);
  const [paymentStep, setPaymentStep] = useState(false);
  const [paystackKey, setPaystackKey] = useState('');
  const [loadingKey, setLoadingKey] = useState(false);

  // Dynamically load Paystack Inline SDK script
  useEffect(() => {
    if (window.PaystackPop) return;

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      console.log('Paystack Inline SDK loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Paystack Inline SDK');
    };
    document.body.appendChild(script);
  }, []);

  // Fetch Paystack Public Key from Backend when entering payment step
  useEffect(() => {
    if (paymentStep) {
      const fetchPaystackKey = async () => {
        setLoadingKey(true);
        try {
          const response = await api.get('/orders/config/paystack');
          if (response.data?.publicKey) {
            setPaystackKey(response.data.publicKey);
          }
        } catch (err) {
          console.error('Failed to load Paystack configuration', err);
        } finally {
          setLoadingKey(false);
        }
      };
      fetchPaystackKey();
    }
  }, [paymentStep]);

  // Prepopulate form when user profile loads
  useEffect(() => {
    if (user) {
      if (!shippingName) setShippingName(user.name || '');
      if (!shippingPhone) setShippingPhone(user.phoneNumber || '');
      if (!shippingEmail) setShippingEmail(user.email || '');
      
      const defaultAddr = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
      if (defaultAddr) {
        if (!shippingAddress) setShippingAddress(defaultAddr.street || '');
        if (!shippingCity) setShippingCity(defaultAddr.city || '');
        if (!shippingState) setShippingState(defaultAddr.state || '');
      }
    }
  }, [user]);

  // Calculations
  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
      return acc + price * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();

  // Coupon promo code states & handlers
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('applied_coupon');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        revalidateCoupon(parsed.code);
      } catch (e) {
        sessionStorage.removeItem('applied_coupon');
      }
    }
  }, [subtotal]);

  const revalidateCoupon = async (code) => {
    if (!code) return;
    try {
      const response = await api.post('/coupons/validate', { code, subtotal });
      setAppliedCoupon(response.data);
      setCouponCodeInput(response.data.code);
      sessionStorage.setItem('applied_coupon', JSON.stringify(response.data));
    } catch (err) {
      sessionStorage.removeItem('applied_coupon');
      setAppliedCoupon(null);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCodeInput) return;
    setValidatingCoupon(true);
    try {
      const response = await api.post('/coupons/validate', { code: couponCodeInput, subtotal });
      setAppliedCoupon(response.data);
      sessionStorage.setItem('applied_coupon', JSON.stringify(response.data));
      toast.success('Coupon applied successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired coupon code');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    sessionStorage.removeItem('applied_coupon');
    setAppliedCoupon(null);
    setCouponCodeInput('');
    toast.success('Coupon removed');
  };

  const shippingFee = 0; // Delivery fee is paid directly on delivery
  const discountAmount = appliedCoupon ? appliedCoupon.discountCalculated : 0;
  const grandTotal = orderCreated ? orderCreated.totalPrice : (subtotal - discountAmount);

  const handlePlaceOrder = async () => {
    if (!shippingName || !shippingPhone || !shippingEmail || !shippingAddress || !shippingCity || !shippingState) {
      toast.error('Please fill out all contact and shipping details.');
      return;
    }

    const orderAddress = {
      name: shippingName,
      street: shippingAddress,
      city: shippingCity,
      state: shippingState,
      country: 'Nigeria'
    };

    setProcessing(true);
    try {
      // 1. Post Order to Backend
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          image: item.product.images[0],
          price: item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price
        })),
        shippingAddress: orderAddress,
        paymentMethod: 'Card', // Implicitly Card
        itemsPrice: subtotal,
        shippingPrice: shippingFee,
        totalPrice: grandTotal,
        email: shippingEmail,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined
      };

      const response = await api.post('/orders', orderData);
      const created = response.data.order;
      setOrderCreated(created);

      // 2. Clear shopping cart
      if (isAuthenticated) {
        await api.delete('/cart');
      } else {
        localStorage.removeItem('guest_cart');
      }
      dispatch(setCart({ items: [] }));
      sessionStorage.removeItem('applied_coupon');

      // 3. Enter payment step directly
      setPaymentStep(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error placing order');
    } finally {
      setProcessing(false);
    }
  };

  // Paystack SDK inline window loader
  const handlePaystackPayment = () => {
    if (!window.PaystackPop) {
      toast.error('Paystack SDK is still loading, please retry in a second.');
      return;
    }

    setProcessing(true);
    try {
      const email = shippingEmail;
      const amountKobo = Math.round(grandTotal * 100);
      const referenceCode = `NKY_${orderCreated._id}_${Date.now()}`;

      // Handle older legacy SDK (v1) setup
      if (typeof window.PaystackPop.setup === 'function') {
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: email.toLowerCase(),
          amount: amountKobo,
          currency: 'NGN',
          ref: referenceCode,
          callback: function (response) {
            setProcessing(true);
            api.put(`/orders/${orderCreated._id}/pay`, { reference: response.reference })
              .then(() => {
                toast.success('Payment verified successfully!');
                setPaymentStep(false);
                navigate(`/order-confirmation/${orderCreated._id}`);
              })
              .catch((err) => {
                toast.error(err.response?.data?.message || 'Transaction verification failed');
                navigate(`/order-confirmation/${orderCreated._id}`);
              })
              .finally(() => {
                setProcessing(false);
              });
          },
          onClose: function () {
            toast.closeAll && toast.closeAll();
            toast.error('Payment window closed.');
            setProcessing(false);
            navigate(`/order-confirmation/${orderCreated._id}`);
          }
        });
        handler.openIframe();
      } else {
        // Handle modern class-based SDK (v2)
        const paystack = new window.PaystackPop();
        paystack.newTransaction({
          key: paystackKey,
          email: email.toLowerCase(),
          amount: amountKobo,
          currency: 'NGN',
          ref: referenceCode,
          onSuccess: function (response) {
            setProcessing(true);
            api.put(`/orders/${orderCreated._id}/pay`, { reference: response.reference })
              .then(() => {
                toast.success('Payment verified successfully!');
                setPaymentStep(false);
                navigate(`/order-confirmation/${orderCreated._id}`);
              })
              .catch((err) => {
                toast.error(err.response?.data?.message || 'Transaction verification failed');
                navigate(`/order-confirmation/${orderCreated._id}`);
              })
              .finally(() => {
                setProcessing(false);
              });
          },
          onCancel: function () {
            toast.closeAll && toast.closeAll();
            toast.error('Payment window closed.');
            setProcessing(false);
            navigate(`/order-confirmation/${orderCreated._id}`);
          }
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(`Could not initialize Paystack: ${err.message || 'Unknown error'}`);
      setProcessing(false);
    }
  };

  const handleSimulatePayment = async () => {
    setProcessing(true);
    try {
      const paymentDetails = {
        id: `PAYSTACK_MOCK_TXN_${Math.floor(Math.random() * 1000000)}`,
        status: 'success',
        reference: `NKY_${orderCreated._id.substring(0, 8)}`
      };
      
      await api.put(`/orders/${orderCreated._id}/pay`, paymentDetails);
      toast.success('Payment verified successfully (Mock Mode)!');
      
      setPaymentStep(false);
      navigate(`/order-confirmation/${orderCreated._id}`);
    } catch (err) {
      toast.error('Payment authorization failed');
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0 && !orderCreated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 bg-white border border-luxury-gold/10 max-w-lg mx-auto my-12 py-12">
        <h2 className="font-serif text-2xl text-luxury-black uppercase tracking-widest">Your bag is empty</h2>
        <p className="font-sans text-xs text-luxury-gray mt-2">Cannot check out without masterpieces in your bag.</p>
        <Link
          to="/shop"
          className="mt-6 bg-luxury-black text-white border border-luxury-gold px-8 py-3 text-[10px] uppercase font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-colors tracking-widest inline-block"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 font-sans text-xs">
      {/* Page Header */}
      <div className="border-b border-luxury-gold/10 pb-6 text-center md:text-left">
        <h1 className="font-serif text-3xl text-luxury-black font-bold uppercase tracking-wide">Checkout</h1>
        <p className="font-sans text-[9px] text-luxury-gray uppercase tracking-widest font-semibold mt-1">
          {paymentStep ? 'Secure Payment Verification' : 'Confirm Order Details'}
        </p>
      </div>

      {paymentStep ? (
        /* Secure Payment Step UI */
        <div className="max-w-md mx-auto bg-white p-8 border border-luxury-gold/20 shadow-xl space-y-6 text-center">
          <FiCheckCircle className="text-4xl text-luxury-gold mx-auto animate-pulse" />
          <div className="space-y-2">
            <h2 className="font-serif text-lg text-luxury-black font-bold uppercase tracking-wide">Finalize Purchase</h2>
            <p className="text-luxury-gray leading-relaxed text-[11px]">
              Your order has been registered. Complete the Paystack secure checkout transaction to verify and process delivery.
            </p>
            <div className="bg-luxury-cream/15 border border-luxury-gold/10 p-3 mt-4">
              <span className="text-[10px] uppercase text-luxury-gray tracking-wider block font-semibold">Total Amount</span>
              <span className="text-lg font-bold text-luxury-gold">{formatPrice(grandTotal, currentCurrency, exchangeRate)}</span>
            </div>
          </div>

          {paystackKey ? (
            <div className="space-y-3">
              <button
                onClick={handlePaystackPayment}
                disabled={processing}
                className="w-full bg-luxury-black text-white border border-luxury-gold py-4 uppercase tracking-widest font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all cursor-pointer"
              >
                {processing ? 'Launching Secure Gateway...' : 'Pay with Paystack'}
              </button>
              <button
                onClick={() => navigate(`/order-confirmation/${orderCreated._id}`)}
                className="w-full bg-transparent text-luxury-black border border-luxury-black py-3 uppercase tracking-widest font-semibold text-[10px] tracking-widest"
              >
                Finish Checkout / View Summary
              </button>
            </div>
          ) : (
            <>
              <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/50 p-3 leading-relaxed">
                Note: No Paystack Public Key detected in the system configuration. Running in sandbox simulation mode.
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleSimulatePayment}
                  disabled={processing}
                  className="w-full bg-luxury-black text-white border border-luxury-gold py-4 uppercase tracking-widest font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all cursor-pointer"
                >
                  {processing ? 'Authorizing transaction...' : 'Authorize Mock Payment'}
                </button>
                <button
                  onClick={() => navigate(`/order-confirmation/${orderCreated._id}`)}
                  className="w-full bg-transparent text-luxury-black border border-luxury-black py-3 uppercase tracking-widest font-semibold text-[10px]"
                >
                  Finish Checkout / View Summary
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Core Address / Shipping & Method Selection Page */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 border border-luxury-gold/10 space-y-6">
              <h3 className="font-serif text-md text-luxury-black border-b border-luxury-gold/10 pb-2 uppercase tracking-wider font-semibold">
                Shipping Details
              </h3>

              <div className="space-y-4 font-sans text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-luxury-gray font-semibold mb-2">Name</label>
                    <input
                      type="text"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      placeholder="Name"
                      className="w-full bg-transparent border border-luxury-gold/20 px-4 py-3 focus:outline-none focus:border-luxury-gold text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-luxury-gray font-semibold mb-2">Number</label>
                    <input
                      type="text"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      placeholder="Number"
                      className="w-full bg-transparent border border-luxury-gold/20 px-4 py-3 focus:outline-none focus:border-luxury-gold text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-luxury-gray font-semibold mb-2">Email</label>
                  <input
                    type="text"
                    value={shippingEmail}
                    onChange={(e) => setShippingEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full bg-transparent border border-luxury-gold/20 px-4 py-3 focus:outline-none focus:border-luxury-gold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-luxury-gray font-semibold mb-2">Address</label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Address"
                    className="w-full bg-transparent border border-luxury-gold/20 px-4 py-3 focus:outline-none focus:border-luxury-gold text-slate-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-luxury-gray font-semibold mb-2">Town</label>
                    <input
                      type="text"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      placeholder="Town"
                      className="w-full bg-transparent border border-luxury-gold/20 px-4 py-3 focus:outline-none focus:border-luxury-gold text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-luxury-gray font-semibold mb-2">State</label>
                    <input
                      type="text"
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      placeholder="State"
                      className="w-full bg-transparent border border-luxury-gold/20 px-4 py-3 focus:outline-none focus:border-luxury-gold text-slate-900"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Bag Summary Column */}
          <div className="bg-white p-6 border border-luxury-gold/10 h-fit space-y-6">
            <h3 className="font-serif text-md text-luxury-black border-b border-luxury-gold/10 pb-2">Bag Summary</h3>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const itemPrice = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
                return (
                  <div key={item._id} className="flex justify-between items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden flex-shrink-0 bg-slate-50 border border-luxury-gold/10">
                      <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-semibold text-luxury-black uppercase tracking-wide truncate">{item.product.name}</h4>
                      <p className="text-[10px] text-luxury-gray mt-0.5">QTY: {item.quantity} | {formatPrice(itemPrice, currentCurrency, exchangeRate)}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-luxury-black">{formatPrice(itemPrice * item.quantity, currentCurrency, exchangeRate)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Promo Code Input */}
            <div className="border-t border-luxury-gold/10 pt-4 space-y-2">
              <label className="block text-[9px] uppercase tracking-wider font-semibold text-luxury-gray">Promo / Coupon Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ENTER CODE"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase().trim())}
                  disabled={appliedCoupon !== null}
                  className="flex-grow bg-slate-50 border border-slate-200 px-3 py-2 uppercase font-semibold focus:outline-none focus:border-luxury-gold disabled:opacity-50 text-slate-800 text-[11px]"
                />
                {appliedCoupon ? (
                  <button
                    onClick={handleRemoveCoupon}
                    type="button"
                    className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 hover:bg-red-700 hover:text-white transition-colors font-bold uppercase tracking-wider text-[9px] cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    type="button"
                    disabled={validatingCoupon || !couponCodeInput}
                    className="bg-luxury-black text-white hover:bg-luxury-gold hover:text-luxury-black border border-luxury-gold px-4 py-2 transition-all font-bold uppercase tracking-wider text-[9px] cursor-pointer disabled:bg-slate-300 disabled:border-slate-300 disabled:text-slate-500"
                  >
                    {validatingCoupon ? '...' : 'Apply'}
                  </button>
                )}
              </div>
              {appliedCoupon && (
                <p className="text-[10px] text-green-700 font-semibold uppercase">
                  ✓ Coupon "{appliedCoupon.code}" applied!
                </p>
              )}
            </div>

            <div className="border-t border-luxury-gold/10 pt-4 space-y-3 font-semibold">
              <div className="flex justify-between text-luxury-gray font-semibold">
                <span>Items Subtotal</span>
                <span>{formatPrice(subtotal, currentCurrency, exchangeRate)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-{formatPrice(appliedCoupon.discountCalculated, currentCurrency, exchangeRate)}</span>
                </div>
              )}
              <div className="flex justify-between text-luxury-gray items-center font-semibold">
                <span>Delivery Fee</span>
                <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 border border-slate-200/50 uppercase font-bold tracking-wider">Paid on Delivery</span>
              </div>
              <div className="flex justify-between text-luxury-black text-sm border-t border-dashed border-slate-200 pt-3 font-bold">
                <span>Total Cost</span>
                <span className="text-luxury-gold">{formatPrice(grandTotal, currentCurrency, exchangeRate)}</span>
              </div>
            </div>

            {/* Store Policies */}
            <div className="bg-slate-50 border-l border-luxury-gold/50 p-4 text-[10px] space-y-2 text-slate-800 leading-relaxed font-sans">
              <p className="font-bold uppercase tracking-wider text-slate-900">Store Policies</p>
              <p>• <strong>No Refund Policy:</strong> All sales are final. We do not offer refunds.</p>
              <p>• <strong>Delivery Timeframe:</strong> Standard delivery takes 3-10 days. For custom-made orders, the timeline will be communicated directly to you once it is ready.</p>
              <p>• <strong>Delivery Fee:</strong> Paid directly to the courier agent. The exact fee is calculated and communicated once the item is ready for shipment.</p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={processing}
              className="w-full bg-luxury-black text-white border border-luxury-gold py-4 uppercase tracking-widest font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all cursor-pointer text-[10px] tracking-widest"
            >
              {processing ? 'Processing...' : 'Proceed to Payment'}
            </button>

            <Link
              to="/cart"
              className="block text-center text-luxury-gray hover:text-luxury-gold hover:underline uppercase text-[9px] tracking-widest font-semibold pt-1"
            >
              Modify Shopping Bag
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
