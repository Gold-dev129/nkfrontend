import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiCheck, FiStar } from 'react-icons/fi';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reviews');
      setReviews(response.data.reviews);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      const response = await api.put(`/reviews/${reviewId}/approve`);
      toast.success(response.data.message);
      
      // Update local state
      setReviews(reviews.map(r => 
        r._id === reviewId ? { ...r, isApproved: true } : r
      ));
    } catch (err) {
      toast.error('Failed to approve review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Delete this review? This will recalculate the product rating.')) {
      try {
        await api.delete(`/reviews/${reviewId}`);
        toast.success('Review deleted successfully');
        fetchReviews();
      } catch (err) {
        toast.error('Failed to delete review');
      }
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      <div className="border-b border-luxury-gold/10 pb-4">
        <h2 className="font-serif text-lg text-luxury-black font-semibold">Review Moderation</h2>
        <span className="text-luxury-gray text-[10px] tracking-wider uppercase">Approve or remove customer testimonials</span>
      </div>

      {/* Reviews List */}
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
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Reviewer</th>
                  <th className="py-3 px-4 text-center">Rating</th>
                  <th className="py-3 px-4">Comment</th>
                  <th className="py-3 px-4 text-center">Approved</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <tr key={rev._id} className="border-b border-luxury-gold/5 hover:bg-luxury-gold/5 transition-colors">
                      <td className="py-3 px-4 font-serif text-sm font-semibold truncate max-w-[150px]">
                        <Link to={`/shop/${rev.product?.slug}`} className="hover:underline hover:text-luxury-gold">
                          {rev.product?.name || 'N/A'}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-luxury-black">{rev.name}</p>
                        <p className="text-[9px] text-luxury-gray">{rev.user?.email || 'N/A'}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center text-luxury-gold">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FiStar key={s} className={s <= rev.rating ? "fill-luxury-gold" : ""} />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[200px] truncate italic">"{rev.comment}"</td>
                      <td className="py-3 px-4 text-center">
                        {rev.isApproved ? (
                          <span className="bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase">Approved</span>
                        ) : (
                          <button
                            onClick={() => handleApprove(rev._id)}
                            className="bg-luxury-gold text-luxury-black font-bold px-2 py-0.5 rounded text-[9px] uppercase border border-luxury-gold hover:bg-transparent hover:text-luxury-gold transition-colors flex items-center gap-1 mx-auto"
                          >
                            <FiCheck /> Approve
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDelete(rev._id)}
                          className="text-red-700 hover:text-red-900 text-lg"
                          aria-label="Delete review"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-luxury-gray italic">No reviews logged in database.</td>
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

export default AdminReviews;
