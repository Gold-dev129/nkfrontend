import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiSearch } from 'react-icons/fi';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data.orders);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { 
              ...order, 
              status: response.data.order.status, 
              isDelivered: response.data.order.isDelivered, 
              deliveredAt: response.data.order.deliveredAt 
            } 
          : order
      ));
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const handleToggleFulfillment = async (orderId, currentStatus) => {
    const isCurrentlyFulfilled = currentStatus === 'Delivered';
    const newStatus = isCurrentlyFulfilled ? 'Processing' : 'Delivered';
    await handleStatusChange(orderId, newStatus);
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Delete / Cancel this order? Stock counts will be rolled back for this order if status is not Cancelled.')) {
      try {
        await api.delete(`/orders/${id}`);
        toast.success('Order deleted and stock rolled back');
        fetchOrders();
      } catch (err) {
        toast.error('Failed to delete order');
      }
    }
  };

  // Filters logic
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (order.orderId && order.orderId.toLowerCase().includes(term)) ||
      order._id.toLowerCase().includes(term) ||
      (order.email && order.email.toLowerCase().includes(term)) ||
      (order.user?.email && order.user.email.toLowerCase().includes(term)) ||
      (order.user?.name && order.user.name.toLowerCase().includes(term)) ||
      (order.shippingAddress?.name && order.shippingAddress.name.toLowerCase().includes(term)) ||
      (order.shippingAddress?.phone && order.shippingAddress.phone.toLowerCase().includes(term)) ||
      (order.shippingAddress?.street && order.shippingAddress.street.toLowerCase().includes(term));
      
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    
    let matchesFulfillment = true;
    const isFulfilled = order.isDelivered || order.status === 'Delivered';
    if (fulfillmentFilter === 'fulfilled') {
      matchesFulfillment = isFulfilled;
    } else if (fulfillmentFilter === 'unfulfilled') {
      matchesFulfillment = !isFulfilled;
    }

    return matchesSearch && matchesStatus && matchesFulfillment;
  });

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Header & Controls */}
      <div className="border-b border-luxury-gold/10 pb-4 space-y-4">
        <h2 className="font-serif text-lg text-luxury-black font-semibold">Orders Dashboard</h2>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow font-sans text-xs">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH BY ORDER ID, CUSTOMER NAME, EMAIL, PHONE, ADDRESS..."
              className="w-full bg-white border border-luxury-gold/20 pl-4 pr-10 py-3 uppercase tracking-wider focus:outline-none"
            />
            <span className="absolute right-3 top-3 text-luxury-gray text-lg">
              <FiSearch />
            </span>
          </div>

          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="bg-white border border-luxury-gold/20 px-4 py-3 uppercase tracking-widest font-semibold focus:outline-none w-full sm:w-48 text-[10px]"
          >
            <option value="">All Fulfillment</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="unfulfilled">Unfulfilled</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-luxury-gold/20 px-4 py-3 uppercase tracking-widest font-semibold focus:outline-none w-full sm:w-48 text-[10px]"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders list Table */}
      <div className="bg-white p-6 border border-luxury-gold/25">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(n => <div key={n} className="h-14 skeleton"></div>)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-luxury-gold/20 text-luxury-gray font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const isFulfilled = order.isDelivered || order.status === 'Delivered';
                    return (
                      <tr key={order._id} className="border-b border-luxury-gold/5 hover:bg-luxury-gold/5 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-luxury-black">
                          {order.orderId || `${order._id.substring(0, 8)}...`}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4 space-y-1">
                          <div className="font-bold text-luxury-black text-[13px] uppercase">
                            {order.shippingAddress?.name || order.user?.name || 'Guest'}
                          </div>
                          <div className="text-[12px] text-slate-800">
                            <span className="font-bold text-slate-500">EMAIL:</span> {order.email || order.user?.email || 'N/A'}
                          </div>
                          <div className="text-[12px] text-slate-800">
                            <span className="font-bold text-slate-500">PHONE:</span> {order.shippingAddress?.phone || order.user?.phoneNumber || 'N/A'}
                          </div>
                          {order.shippingAddress?.street && (
                            <div className="text-[12px] text-slate-800 uppercase leading-normal max-w-sm pt-0.5">
                              <span className="font-bold text-slate-500">ADDR:</span> {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.country}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-0.5 font-bold uppercase text-[9px] rounded w-fit ${
                              order.isPaid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {order.isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                            {order.paidAt && (
                              <p className="text-[8px] text-luxury-gray font-semibold mt-0.5">
                                {new Date(order.paidAt).toLocaleDateString()}
                              </p>
                            )}
                            <p className="text-[8px] text-luxury-gray uppercase tracking-widest mt-0.5 font-semibold">{order.paymentMethod}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1.5">
                            <span className={`px-2 py-0.5 font-bold uppercase text-[9px] rounded w-fit ${
                              isFulfilled ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                            }`}>
                              {isFulfilled ? 'Fulfilled' : 'Unfulfilled'}
                            </span>
                            <button
                              onClick={() => handleToggleFulfillment(order._id, order.status)}
                              className={`px-2 py-1 text-[8px] uppercase tracking-wider font-semibold border text-center rounded transition-all cursor-pointer ${
                                isFulfilled
                                  ? 'border-yellow-600/30 text-yellow-700 bg-yellow-50/50 hover:bg-yellow-100'
                                  : 'border-green-600/30 text-green-700 bg-green-50/50 hover:bg-green-100'
                              }`}
                            >
                              {isFulfilled ? 'Mark Unfulfilled' : 'Mark Fulfilled'}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-luxury-black">₦{order.totalPrice.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="bg-transparent border border-luxury-gold/25 px-2 py-1 uppercase text-[10px] font-bold focus:outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="text-red-700 hover:text-red-900 text-lg cursor-pointer"
                            aria-label="Delete / Cancel order"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="py-6 text-center text-luxury-gray italic">No orders match filter query.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
