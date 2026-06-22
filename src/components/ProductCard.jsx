import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '../redux/slices/cartSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/currency';

const ProductCard = ({ product, isWishlisted, onToggleWishlist, index }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { currentCurrency, exchangeRate } = useSelector((state) => state.currency);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - (box.width / 2);
    const y = e.clientY - box.top - (box.height / 2);
    // Dynamic tilt (max 8 degrees)
    const rotateX = -(y / (box.height / 2)) * 8;
    const rotateY = (x / (box.width / 2)) * 8;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    if (!isAuthenticated) {
      const guestCart = localStorage.getItem('guest_cart');
      let items = guestCart ? JSON.parse(guestCart) : [];
      const existsIdx = items.findIndex(item => item.product._id === product._id);
      
      if (existsIdx > -1) {
        const currentQty = items[existsIdx].quantity;
        if (currentQty < product.stock) {
          items[existsIdx].quantity += 1;
          toast.success(`Increased ${product.name} quantity in bag!`);
        } else {
          toast.error(`Only ${product.stock} items available in stock`);
          return;
        }
      } else {
        items.push({
          _id: `GUEST_ITEM_${Math.random().toString(36).substring(2, 9)}`,
          product: product,
          quantity: 1
        });
        toast.success(`${product.name} added to bag!`);
      }
      localStorage.setItem('guest_cart', JSON.stringify(items));
      dispatch(setCart({ items }));
      return;
    }

    try {
      const response = await api.post('/cart', {
        product: product._id,
        quantity: 1
      });
      dispatch(setCart(response.data.cart));
      toast.success(`${product.name} added to bag!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding to bag');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s ease-out'
      }}
      className="group relative bg-white border border-luxury-gold/10 flex flex-col justify-between h-full hover:border-luxury-gold/45 hover:shadow-[0_0_25px_rgba(212,175,55,0.18)] transition-all duration-300"
    >
      <Link 
        to={`/shop/${product.slug}`} 
        className="block relative overflow-hidden h-72 bg-luxury-cream/5"
        style={{ transform: 'translateZ(20px)' }}
      >
        <motion.img
          src={product.images && product.images[0]}
          alt={product.name}
          whileHover={{ scale: 1.05, y: -4 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="h-full w-full object-cover"
        />

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist(product._id, e);
          }}
          className="absolute top-4 right-4 z-20 bg-white/90 p-2 rounded-full border border-luxury-gold/20 shadow-md text-luxury-black hover:text-red-500 hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer"
          aria-label="Toggle Wishlist"
        >
          <FiHeart className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
        </button>

        {product.discountPrice > 0 && (
          <span className="absolute top-4 left-4 z-20 bg-luxury-gold text-luxury-black text-[9px] font-bold px-2 py-1 uppercase tracking-wider">
            Sale
          </span>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
            <span className="text-luxury-gold font-serif tracking-widest uppercase font-semibold text-[10px] border border-luxury-gold/50 px-4 py-2">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div 
        className="p-6 text-center"
        style={{ transform: 'translateZ(10px)' }}
      >
        <p className="font-sans text-[9px] uppercase text-luxury-gray tracking-widest font-bold">{product.material}</p>
        <h3 className="font-serif text-xs mt-2 text-luxury-black font-bold uppercase tracking-wide truncate group-hover:text-luxury-gold transition-colors">
          <Link to={`/shop/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="mt-2 flex justify-center items-center space-x-2">
          {product.discountPrice > 0 ? (
            <>
              <span className="font-sans text-xs line-through text-luxury-gray">{formatPrice(product.price, currentCurrency, exchangeRate)}</span>
              <span className="font-sans text-xs font-bold text-luxury-gold">{formatPrice(product.discountPrice, currentCurrency, exchangeRate)}</span>
            </>
          ) : (
            <span className="font-sans text-xs font-bold text-luxury-black">{formatPrice(product.price, currentCurrency, exchangeRate)}</span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="mt-4 w-full bg-luxury-black text-white border border-luxury-gold py-2.5 text-[9px] uppercase tracking-widest font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:hover:bg-luxury-black disabled:hover:text-white flex items-center justify-center gap-1.5"
        >
          <FiShoppingBag className="text-xs" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
