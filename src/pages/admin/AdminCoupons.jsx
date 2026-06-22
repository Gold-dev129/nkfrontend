import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiPlus, FiPercent, FiCalendar, FiUserCheck, FiDollarSign } from 'react-icons/fi';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountAmount: '',
    endDate: '',
    maxUses: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await api.get('/coupons');
      setCoupons(response.data.coupons || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
      toast.error('Failed to load coupon codes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'code') {
      setFormData({ ...formData, code: value.toUpperCase().trim() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountType || !formData.discountAmount || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const postData = {
        code: formData.code,
        discountType: formData.discountType,
        discountAmount: Number(formData.discountAmount),
        endDate: formData.endDate,
        maxUses: formData.maxUses ? Number(formData.maxUses) : null
      };

      const response = await api.post('/coupons', postData);
      toast.success(response.data.message || 'Coupon created successfully!');
      
      // Reset form and reload
      setFormData({
        code: '',
        discountType: 'percentage',
        discountAmount: '',
        endDate: '',
        maxUses: ''
      });
      fetchCoupons();
    } catch (err) {
      console.error('Failed to create coupon:', err);
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (window.confirm(`Are you sure you want to delete coupon "${code}"?`)) {
      try {
        await api.delete(`/coupons/${id}`);
        toast.success(`Coupon "${code}" deleted successfully`);
        setCoupons(coupons.filter(c => c._id !== id));
      } catch (err) {
        console.error('Failed to delete coupon:', err);
        toast.error('Failed to delete coupon');
      }
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Header */}
      <div className="border-b border-luxury-gold/10 pb-4">
        <h2 className="font-serif text-lg text-luxury-black font-semibold">Coupon & Promo Manager</h2>
        <p className="text-[10px] text-luxury-gray">Create flat rate or percentage discount coupons, specify expiries, and set usage limits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coupon creation form */}
        <div className="bg-white p-6 border border-luxury-gold/25 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-luxury-gold/30"></div>
          <h3 className="font-serif text-sm text-luxury-black font-semibold mb-4 uppercase tracking-wide flex items-center gap-1.5">
            <FiPlus className="text-luxury-gold" /> Create Promo Code
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Promo Code Input */}
            <div className="space-y-1">
              <label className="block text-luxury-gray uppercase tracking-wider font-semibold">Coupon Code *</label>
              <input
                type="text"
                name="code"
                required
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g. LUXURY20"
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-none font-sans text-xs focus:outline-none focus:border-luxury-gold uppercase tracking-wider font-bold"
              />
            </div>

            {/* Discount Type */}
            <div className="space-y-1">
              <label className="block text-luxury-gray uppercase tracking-wider font-semibold">Discount Type *</label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-none font-sans text-xs focus:outline-none focus:border-luxury-gold cursor-pointer"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Cash Value ($ / ₦)</option>
              </select>
            </div>

            {/* Discount Amount */}
            <div className="space-y-1">
              <label className="block text-luxury-gray uppercase tracking-wider font-semibold">
                {formData.discountType === 'percentage' ? 'Percentage Value (%) *' : 'Flat Discount Amount *'}
              </label>
              <div className="relative font-sans text-xs">
                <span className="absolute left-3 top-3 text-luxury-gray">
                  {formData.discountType === 'percentage' ? <FiPercent /> : <FiDollarSign />}
                </span>
                <input
                  type="number"
                  name="discountAmount"
                  required
                  min="1"
                  value={formData.discountAmount}
                  onChange={handleInputChange}
                  placeholder={formData.discountType === 'percentage' ? 'e.g. 15' : 'e.g. 5000'}
                  className="w-full bg-slate-50 border border-slate-200 pl-8 pr-3 py-2.5 rounded-none font-sans text-xs focus:outline-none focus:border-luxury-gold"
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-1">
              <label className="block text-luxury-gray uppercase tracking-wider font-semibold">Expiry Date *</label>
              <div className="relative font-sans text-xs">
                <span className="absolute left-3 top-3 text-luxury-gray">
                  <FiCalendar />
                </span>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 pl-8 pr-3 py-2.5 rounded-none font-sans text-xs focus:outline-none focus:border-luxury-gold cursor-pointer"
                />
              </div>
            </div>

            {/* Max Uses */}
            <div className="space-y-1">
              <label className="block text-luxury-gray uppercase tracking-wider font-semibold">Usage Limit (Optional)</label>
              <div className="relative font-sans text-xs">
                <span className="absolute left-3 top-3 text-luxury-gray">
                  <FiUserCheck />
                </span>
                <input
                  type="number"
                  name="maxUses"
                  min="1"
                  value={formData.maxUses}
                  onChange={handleInputChange}
                  placeholder="e.g. 100 (Leave blank for unlimited)"
                  className="w-full bg-slate-50 border border-slate-200 pl-8 pr-3 py-2.5 rounded-none font-sans text-xs focus:outline-none focus:border-luxury-gold"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-luxury-black text-white border border-luxury-gold py-3 uppercase tracking-widest font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all cursor-pointer disabled:bg-slate-300 disabled:border-slate-300 disabled:text-slate-500 flex items-center justify-center gap-1.5"
            >
              {submitting ? 'Creating Code...' : 'Activate Coupon'}
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="lg:col-span-2 bg-white p-6 border border-luxury-gold/25">
          <h3 className="font-serif text-sm text-luxury-black font-semibold mb-4 uppercase tracking-wide">
            Active Promo Codes
          </h3>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(n => <div key={n} className="h-14 bg-slate-50 border border-slate-100 animate-pulse"></div>)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-luxury-gold/20 text-luxury-gray font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Coupon Info</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4 text-center">Usage Details</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.length > 0 ? (
                    coupons.map((coupon) => {
                      const isExpired = new Date() > new Date(coupon.endDate);
                      const isLimitReached = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;
                      const isValid = coupon.isActive && !isExpired && !isLimitReached;

                      return (
                        <tr key={coupon._id} className="border-b border-luxury-gold/5 hover:bg-luxury-gold/5 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-bold text-luxury-black tracking-wider uppercase">{coupon.code}</p>
                            <span className={`inline-block px-1.5 py-0.5 text-[7px] uppercase font-bold tracking-widest border ${
                              isValid 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {isValid ? 'Active' : isExpired ? 'Expired' : isLimitReached ? 'Limit Reached' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-luxury-black">
                            {coupon.discountType === 'percentage' 
                              ? `${coupon.discountAmount}%` 
                              : `₦${coupon.discountAmount.toLocaleString()}`}
                          </td>
                          <td className={`py-3 px-4 text-[10px] whitespace-nowrap ${isExpired ? 'text-red-600 line-through' : ''}`}>
                            {new Date(coupon.endDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-mono text-luxury-black font-semibold">{coupon.usedCount}</span>
                            <span className="text-luxury-gray">
                              {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ' / ♾️'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                              className="text-red-700 hover:text-red-950 text-base p-1 cursor-pointer"
                              title="Delete Coupon"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-luxury-gray italic">No coupons found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
