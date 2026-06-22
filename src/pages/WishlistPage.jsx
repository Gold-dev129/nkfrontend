import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setWishlist } from '../redux/slices/wishlistSlice';
import { setCart } from '../redux/slices/cartSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiTrash2, FiShoppingBag, FiHeart, FiArrowRight } from 'react-icons/fi';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleRemove = async (productId, e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      // Guest Remove
      const localList = localStorage.getItem('guest_wishlist');
      let productsList = localList ? JSON.parse(localList) : [];
      productsList = productsList.filter(p => p._id !== productId);
      localStorage.setItem('guest_wishlist', JSON.stringify(productsList));
      dispatch(setWishlist({ products: productsList }));
      toast.success('Removed from favorites');
      return;
    }

    try {
      const response = await api.post(`/wishlist/${productId}`);
      dispatch(setWishlist(response.data.wishlist));
      toast.success('Removed from favorites');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your cart.');
      return;
    }

    try {
      const response = await api.post('/cart', {
        product: product._id,
        quantity: 1
      });
      dispatch(setCart(response.data.cart));
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding to cart');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 font-sans text-xs min-h-[60vh]">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <span className="font-mono text-[9px] uppercase tracking-widest text-luxury-gold font-bold">My Curation</span>
        <h1 className="font-serif text-3xl md:text-5xl text-luxury-black font-bold uppercase">Favorite Masterpieces</h1>
        <div className="w-12 h-[1px] bg-luxury-gold mx-auto"></div>
      </div>

      {wishlist?.products?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {wishlist.products.map((prod, index) => (
            <motion.div
              key={prod._id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
              className="group relative bg-white border border-luxury-gold/15 p-4 flex flex-col justify-between hover:shadow-[0_0_20px_rgba(212,175,55,0.12)] hover:border-luxury-gold/35 transition-all duration-300 h-full"
            >
              {/* Product Image */}
              <Link to={`/shop/${prod.slug}`} className="block relative overflow-hidden h-60 bg-luxury-cream/10">
                <img
                  src={prod.images && prod.images[0]}
                  alt={prod.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
                
                <button
                  onClick={(e) => handleRemove(prod._id, e)}
                  className="absolute top-3 right-3 text-red-500 bg-white/95 p-2 rounded-full border border-luxury-gold/20 shadow hover:bg-red-50 hover:scale-105 transition-all flex items-center justify-center cursor-pointer z-20"
                  title="Remove from Favorites"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              </Link>

              {/* Product Details */}
              <div className="pt-4 text-center space-y-1">
                <span className="text-[8px] uppercase tracking-widest text-luxury-gray font-bold">{prod.material}</span>
                <h4 className="font-serif text-xs font-semibold text-luxury-black truncate">
                  <Link to={`/shop/${prod.slug}`}>{prod.name}</Link>
                </h4>
                <p className="font-bold text-luxury-gold font-sans text-xs">₦{prod.price.toLocaleString()}</p>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-2 border-t border-luxury-gold/10">
                <button
                  onClick={() => handleAddToCart(prod)}
                  className="w-full bg-luxury-black text-white border border-luxury-gold py-3 uppercase tracking-widest font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300 flex items-center justify-center space-x-2 text-[10px]"
                >
                  <FiShoppingBag />
                  <span>Add to Bag</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-luxury-cream/5 border border-dashed border-luxury-gold/20 max-w-lg mx-auto">
          <FiHeart className="text-4xl text-luxury-gold mx-auto mb-4 animate-pulse" />
          <h3 className="font-serif text-lg text-luxury-black">Your Favorites list is empty</h3>
          <p className="text-luxury-gray text-xs mt-2 max-w-xs mx-auto">
            Explore our diamond and horology curation to save your favorite luxury masterpieces.
          </p>
          <Link
            to="/shop"
            className="mt-6 bg-luxury-black text-white border border-luxury-gold px-6 py-3 text-[10px] uppercase font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300 inline-block tracking-widest"
          >
            Explore Catalog <FiArrowRight className="inline ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
