import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api';
import { updateProfileSuccess, updateAddressesSuccess, logout } from '../redux/slices/authSlice';
import { setWishlist } from '../redux/slices/wishlistSlice';
import toast from 'react-hot-toast';
import { FiUser, FiShoppingBag, FiHeart, FiMapPin, FiPlus, FiTrash2, FiStar, FiLock, FiLogOut } from 'react-icons/fi';

const UserDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { user } = useSelector((state) => state.auth);
  const { wishlist } = useSelector((state) => state.wishlist);

  const activeTab = searchParams.get('tab') || 'profile';

  // State bindings
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [processingPayment, setProcessingPayment] = useState(null);

  // Profile Edit fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Update fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Address fields
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZip, setNewZip] = useState('');

  // Dynamically load Paystack Inline SDK script
  useEffect(() => {
    if (window.PaystackPop) return;
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      console.log('Paystack Inline SDK loaded in UserDashboard');
    };
    script.onerror = () => {
      console.error('Failed to load Paystack Inline SDK in UserDashboard');
    };
    document.body.appendChild(script);
  }, []);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
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
      fetchMyOrders();
    }
  }, [activeTab]);

  // Sync profile details if user state updates
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phoneNumber || '');
      setAddresses(user.addresses || []);
    }
  }, [user]);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const response = await api.put('/auth/profile', { name, phoneNumber: phone });
      dispatch(updateProfileSuccess(response.data.user));
      toast.success('Profile details updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.put('/auth/updatepassword', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error changing password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newState) return;

    try {
      const response = await api.post('/auth/address', {
        street: newStreet,
        city: newCity,
        state: newState,
        zipCode: newZip
      });
      dispatch(updateAddressesSuccess(response.data.addresses));
      setAddresses(response.data.addresses);
      setShowAddressForm(false);
      setNewStreet('');
      setNewCity('');
      setNewState('');
      setNewZip('');
      toast.success('Address added successfully');
    } catch (err) {
      toast.error('Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Delete this address?')) {
      try {
        const response = await api.delete(`/auth/address/${addressId}`);
        dispatch(updateAddressesSuccess(response.data.addresses));
        setAddresses(response.data.addresses);
        toast.success('Address deleted');
      } catch (err) {
        toast.error('Failed to delete address');
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await api.put(`/auth/address/${addressId}/default`);
      dispatch(updateAddressesSuccess(response.data.addresses));
      setAddresses(response.data.addresses);
      toast.success('Default address updated');
    } catch (err) {
      toast.error('Failed to set default address');
    }
  };

  const handleRemoveWishlist = async (productId, e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/wishlist/${productId}`);
      dispatch(setWishlist(response.data.wishlist));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const initiatePaystackPayment = async (order) => {
    setProcessingPayment(order._id);
    try {
      // 1. Fetch Paystack Public Key
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
        
        // Refresh orders list
        const refreshedOrders = await api.get('/orders/myorders');
        setOrders(refreshedOrders.data.orders);
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
                return api.get('/orders/myorders');
              })
              .then((refreshedOrders) => {
                setOrders(refreshedOrders.data.orders);
              })
              .catch((err) => {
                toast.error(err.response?.data?.message || 'Transaction verification failed');
              })
              .finally(() => {
                setProcessingPayment(null);
              });
          },
          onClose: function () {
            toast.closeAll && toast.closeAll();
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
                return api.get('/orders/myorders');
              })
              .then((refreshedOrders) => {
                setOrders(refreshedOrders.data.orders);
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 font-sans text-xs">
      {/* Header Banner */}
      <div className="border-b border-luxury-gold/10 pb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <h1 className="font-serif text-3xl text-luxury-black font-bold">My Account</h1>
          <p className="font-sans text-[10px] text-luxury-gray uppercase tracking-widest font-semibold mt-1">
            Private Client Member Since {user ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 border border-red-700 text-red-700 bg-transparent px-4 py-2 hover:bg-red-800 hover:text-white transition-colors uppercase tracking-widest font-semibold"
        >
          <FiLogOut /> Log Out
        </button>
      </div>

      {/* Tabs and Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Sidebar Tabs */}
        <div className="flex flex-col space-y-1 bg-white p-4 border border-luxury-gold/10 h-fit">
          {[
            { id: 'profile', label: 'My Profile', icon: <FiUser /> },
            { id: 'orders', label: 'Order History', icon: <FiShoppingBag /> },
            { id: 'addresses', label: 'Shipping Addresses', icon: <FiMapPin /> },
            { id: 'wishlist', label: 'My Wishlist', icon: <FiHeart /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center space-x-3 px-4 py-3 uppercase tracking-widest font-semibold text-left transition-all ${
                activeTab === tab.id
                  ? 'bg-luxury-gold text-luxury-black font-bold'
                  : 'hover:bg-luxury-gold/10 hover:text-luxury-gold text-luxury-black'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Tab Contents */}
        <div className="md:col-span-3">
          
          {/* A. Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile details edit */}
              <div className="bg-white p-6 border border-luxury-gold/10 space-y-4">
                <h3 className="font-serif text-md text-luxury-black border-b border-luxury-gold/10 pb-2">Personal Information</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-luxury-gray font-semibold mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none focus:border-luxury-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-luxury-gray font-semibold mb-2">Email Address</label>
                    <input
                      type="email"
                      value={user?.email}
                      className="w-full bg-luxury-lightgray border border-luxury-gold/20 px-3 py-2 text-luxury-gray focus:outline-none cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-luxury-gray font-semibold mb-2">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none focus:border-luxury-gold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="bg-luxury-black text-white border border-luxury-gold px-6 py-3 uppercase tracking-widest font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                  >
                    {updatingProfile ? 'Saving...' : 'Update details'}
                  </button>
                </form>
              </div>

              {/* Password update */}
              <div className="bg-white p-6 border border-luxury-gold/10 space-y-4">
                <h3 className="font-serif text-md text-luxury-black border-b border-luxury-gold/10 pb-2">Change Password</h3>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-luxury-gray font-semibold mb-2">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-luxury-gray font-semibold mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-luxury-gray font-semibold mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="bg-luxury-black text-white border border-luxury-gold px-6 py-3 uppercase tracking-widest font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                  >
                    {updatingPassword ? 'Updating...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* B. Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white p-6 border border-luxury-gold/10 space-y-6">
              <h3 className="font-serif text-md text-luxury-black border-b border-luxury-gold/10 pb-2">Order History</h3>
              
              {loadingOrders ? (
                <div className="space-y-4">
                  {[1, 2].map(n => <div key={n} className="h-24 skeleton"></div>)}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-luxury-gold/15 p-4 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] text-luxury-gray font-semibold uppercase tracking-wider gap-2">
                        <div>
                          <span>Order Date: </span>
                          <strong className="text-luxury-black">{new Date(order.createdAt).toLocaleDateString()}</strong>
                        </div>
                        <div>
                          <span>ID: </span>
                          <strong className="text-luxury-black">{order._id}</strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        {/* Order items images */}
                        <div className="flex -space-x-3 overflow-hidden">
                          {order.orderItems.map((item, idx) => (
                            <img
                              key={idx}
                              src={item.image}
                              alt=""
                              className="h-12 w-12 rounded-full border border-luxury-gold/20 object-cover bg-white"
                            />
                          ))}
                        </div>
                        {/* Payment / Delivery Statuses */}
                        <div className="space-y-1">
                          <p>
                            <span>Payment: </span>
                            <strong className={order.isPaid ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
                              {order.isPaid ? 'Paid' : 'Unpaid'}
                            </strong>
                            {!order.isPaid && order.paymentMethod === 'Card' && (
                              <button
                                onClick={() => initiatePaystackPayment(order)}
                                disabled={processingPayment === order._id}
                                className="mt-2 bg-luxury-black text-white border border-luxury-gold px-3 py-1 font-semibold uppercase tracking-wider text-[9px] hover:bg-luxury-gold hover:text-luxury-black transition-colors block cursor-pointer"
                              >
                                {processingPayment === order._id ? 'Processing...' : 'Pay Now'}
                              </button>
                            )}
                          </p>
                          <p>
                            <span>Status: </span>
                            <strong className="text-luxury-black font-bold uppercase tracking-widest">{order.status}</strong>
                          </p>
                        </div>
                        {/* Total Cost */}
                        <div className="text-left sm:text-right">
                          <span className="text-luxury-gray">Total Cost</span>
                          <p className="text-sm font-bold text-luxury-gold">₦{order.totalPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-luxury-cream border border-luxury-gold/10">
                  <FiShoppingBag className="text-3xl text-luxury-gold mx-auto mb-2" />
                  <p className="text-luxury-gray italic">You haven't placed any orders yet.</p>
                  <Link to="/shop" className="mt-4 bg-luxury-black text-white border border-luxury-gold px-4 py-2 text-[10px] uppercase font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-colors inline-block">
                    Explore Shop
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* C. Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="bg-white p-6 border border-luxury-gold/10 space-y-6">
              <div className="flex justify-between items-center border-b border-luxury-gold/10 pb-2">
                <h3 className="font-serif text-md text-luxury-black">Saved Shipping Addresses</h3>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="font-sans text-[10px] text-luxury-gold hover:underline flex items-center gap-1 uppercase tracking-wider font-semibold"
                  >
                    <FiPlus /> Add New
                  </button>
                )}
              </div>

              {showAddressForm ? (
                /* Address Add Form */
                <form onSubmit={handleAddAddress} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-luxury-gray font-semibold mb-2">Street Address</label>
                    <input
                      type="text"
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-luxury-gray font-semibold mb-2">City</label>
                      <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-luxury-gray font-semibold mb-2">State</label>
                      <input
                        type="text"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-luxury-gray font-semibold mb-2">Zip Code</label>
                      <input
                        type="text"
                        value={newZip}
                        onChange={(e) => setNewZip(e.target.value)}
                        className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-luxury-black text-white border border-luxury-gold py-2 font-semibold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="text-luxury-gray hover:underline uppercase text-[10px] tracking-wider font-semibold block"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                /* Address List */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {addresses.length > 0 ? (
                    addresses.map((addr) => (
                      <div key={addr._id} className="border border-luxury-gold/15 p-4 flex flex-col justify-between space-y-4">
                        <div>
                          <p className="font-semibold text-luxury-black uppercase tracking-wider">{addr.street}</p>
                          <p className="text-luxury-gray mt-1">{addr.city}, {addr.state}, {addr.country}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-luxury-gold/10 pt-3">
                          {addr.isDefault ? (
                            <span className="text-[9px] bg-luxury-gold/25 text-luxury-gold font-bold px-2 py-0.5 uppercase">Default Address</span>
                          ) : (
                            <button
                              onClick={() => handleSetDefaultAddress(addr._id)}
                              className="text-luxury-gray hover:text-luxury-gold text-[10px] uppercase font-semibold"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="text-red-700 hover:text-red-900"
                            aria-label="Delete Address"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-6 text-luxury-gray italic">
                      No addresses saved. Add one above.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* D. Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="bg-white p-6 border border-luxury-gold/10 space-y-6">
              <h3 className="font-serif text-md text-luxury-black border-b border-luxury-gold/10 pb-2">My Favorite Masterpieces</h3>
              
              {wishlist?.products?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {wishlist.products.map((prod) => (
                    <div key={prod._id} className="border border-luxury-gold/15 p-4 flex flex-col justify-between bg-white relative">
                      <Link to={`/shop/${prod.slug}`} className="block h-40 overflow-hidden">
                        <img src={prod.images[0]} alt="" className="h-full w-full object-cover" />
                      </Link>
                      <div className="mt-3 text-center space-y-1">
                        <h4 className="font-serif text-xs font-semibold text-luxury-black truncate">
                          <Link to={`/shop/${prod.slug}`}>{prod.name}</Link>
                        </h4>
                        <p className="font-bold text-luxury-gold">₦{prod.price.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={(e) => handleRemoveWishlist(prod._id, e)}
                        className="absolute top-2 right-2 text-red-500 bg-white p-1 rounded-full border border-luxury-gold/10 shadow hover:bg-red-50"
                        aria-label="Remove wishlist"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-luxury-cream border border-luxury-gold/10">
                  <FiHeart className="text-3xl text-luxury-gold mx-auto mb-2" />
                  <p className="text-luxury-gray italic">Your wishlist is empty.</p>
                  <Link to="/shop" className="mt-4 bg-luxury-black text-white border border-luxury-gold px-4 py-2 text-[10px] uppercase font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-colors inline-block">
                    Browse Jewels
                  </Link>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
