import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiShoppingBag, FiUsers, FiPackage, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/stats');
        setStats(response.data.stats);
        setRecentOrders(response.data.recentOrders);
      } catch (err) {
        console.error('Error fetching admin statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Delete / Cancel this order? Stock counts will be rolled back for this order if status is not Cancelled.')) {
      try {
        await api.delete(`/orders/${id}`);
        toast.success('Order deleted and stock rolled back');
        
        // Reload stats and recent orders list
        const response = await api.get('/admin/stats');
        setStats(response.data.stats);
        setRecentOrders(response.data.recentOrders);
      } catch (err) {
        toast.error('Failed to delete order');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => <div key={n} className="h-28 skeleton"></div>)}
        </div>
        <div className="h-80 skeleton"></div>
      </div>
    );
  }

  const cards = [
    { name: 'Total Orders', value: stats?.ordersCount || 0, icon: <FiShoppingBag />, color: 'bg-blue-50 text-blue-700' },
    { name: 'Total Customers', value: stats?.usersCount || 0, icon: <FiUsers />, color: 'bg-purple-50 text-purple-700' },
    { name: 'Total Products', value: stats?.productsCount || 0, icon: <FiPackage />, color: 'bg-amber-50 text-amber-700' }
  ];

  return (
    <div className="space-y-10 font-sans text-xs">
      {/* Overview Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 border border-luxury-gold/15 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-luxury-gray uppercase tracking-widest font-semibold">{card.name}</span>
              <p className="text-xl font-bold text-luxury-black font-sans">{card.value}</p>
            </div>
            <div className={`p-3 rounded-full text-lg ${card.color}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </section>

      {/* Recent Orders table */}
      <section className="bg-white p-6 border border-luxury-gold/20">
        <h3 className="font-serif text-sm uppercase tracking-widest text-luxury-black font-semibold border-b border-luxury-gold/10 pb-3 mb-4">
          Recent Placed Orders
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-luxury-gold/20 text-luxury-gray font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Paid Status</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4 text-right">Value</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-luxury-gold/5 hover:bg-luxury-gold/5 transition-colors">
                    <td className="py-3 px-4 font-semibold text-luxury-black">{order._id.substring(0, 8)}...</td>
                    <td className="py-3 px-4">{order.user?.name || 'Guest'}</td>
                    <td className="py-3 px-4">{order.paymentMethod}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 font-bold uppercase text-[9px] rounded ${
                        order.isPaid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-luxury-black uppercase tracking-widest">{order.status}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-luxury-gold">₦{order.totalPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="text-red-700 hover:text-red-900 text-sm cursor-pointer"
                        aria-label="Delete order"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-luxury-gray italic">No orders logged in store database yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminStats;
