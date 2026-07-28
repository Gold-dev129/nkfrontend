import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '../utils/api';
import toast from 'react-hot-toast';
import { setWishlist } from '../redux/slices/wishlistSlice';
import { FiHeart, FiArrowRight, FiShield, FiTruck, FiScissors } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { wishlist } = useSelector((state) => state.wishlist);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const categoryRes = await api.get('/categories');
        setCategories(categoryRes.data.categories);

        const newRes = await api.get('/products?newArrival=true&limit=3');
        setNewArrivals(newRes.data.products);

        const bestRes = await api.get('/products?bestSeller=true&limit=4');
        setBestSellers(bestRes.data.products);

        try {
          const bannerRes = await api.get('/banners');
          setBanners(bannerRes.data.banners || []);
        } catch (bErr) {
          console.error('Error fetching banners:', bErr);
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // Automatic transition for banners with dynamic index reset on manual change
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Transition every 5 seconds
    
    return () => clearInterval(interval);
  }, [banners.length, currentBannerIndex]);

  const handleToggleWishlist = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      // Guest Favourites Toggle
      const localList = localStorage.getItem('guest_wishlist');
      let productsList = localList ? JSON.parse(localList) : [];
      const exists = productsList.some(p => p._id === productId);
      
      if (exists) {
        productsList = productsList.filter(p => p._id !== productId);
        toast.success('Removed from favorites');
      } else {
        const allProducts = [...bestSellers, ...newArrivals];
        const found = allProducts.find(p => p._id === productId);
        if (found) {
          productsList.push(found);
          toast.success('Added to favorites');
        }
      }
      localStorage.setItem('guest_wishlist', JSON.stringify(productsList));
      dispatch(setWishlist({ products: productsList }));
      return;
    }

    try {
      const response = await api.post(`/wishlist/${productId}`);
      dispatch(setWishlist(response.data.wishlist));
      toast.success(response.data.message);
    } catch (err) {
      toast.error('Error updating wishlist');
    }
  };

  const isProductInWishlist = (productId) => {
    return wishlist?.products?.some(p => p._id === productId || p === productId) || false;
  };

  return (
    <div className="space-y-24 pb-24 bg-white text-slate-900 font-sans">
      {/* 1. Minimalist Monochromatic Hero Banner */}
      <section className="px-6 md:px-12 pt-16 pb-20 border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Main Statement */}
          <div className="space-y-6">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-slate-500 text-xs font-bold uppercase tracking-widest block"
            >
              NKYLUXURY
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
              className="text-4xl md:text-6xl font-bold tracking-tight uppercase leading-none text-slate-900"
            >
              THE ART OF <br/>
              LUXURY LIVING
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
              className="text-slate-600 text-sm max-w-md font-light leading-relaxed"
            >
              Discover exceptional jewellery, statement accessories, luxury bags, and timeless watches—expertly crafted for those who appreciate modern elegance and uncompromising quality.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
              className="pt-2"
            >
              <Link
                to="/shop"
                className="bg-slate-900 text-white font-semibold text-xs tracking-wider uppercase px-8 py-4 hover:bg-slate-800 hover:shadow-lg hover:scale-105 transition-all duration-350 inline-block"
              >
                Browse Catalog
              </Link>
            </motion.div>
          </div>

          {/* Solid Geometric Design Placeholders or Dynamic Banners from Database */}
          {banners && banners.length > 0 ? (
            <div className="h-96 border border-slate-200 bg-slate-900 relative overflow-hidden group">
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentBannerIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.0, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full"
                >
                  {/* Ken Burns Zoom Effect */}
                  <motion.img
                    src={getImageUrl(banners[currentBannerIndex].image)}
                    alt={banners[currentBannerIndex].title}
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 6, ease: "easeOut" }}
                    className="w-full h-full object-cover brightness-[0.75]"
                  />
                  
                  {/* Dynamic Staggered Overlay Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 text-white space-y-2 bg-gradient-to-t from-black/75 via-black/30 to-transparent">
                    <motion.span
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.7 }}
                      className="font-mono text-[9px] tracking-widest text-[#D4AF37] uppercase font-bold"
                    >
                      Featured Showcase
                    </motion.span>
                    
                    <motion.h3
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.7 }}
                      className="text-lg md:text-xl font-serif font-bold uppercase tracking-wider text-white"
                    >
                      {banners[currentBannerIndex].title}
                    </motion.h3>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.7 }}
                      className="text-[11px] text-slate-200 font-light max-w-sm leading-relaxed"
                    >
                      {banners[currentBannerIndex].subtitle}
                    </motion.p>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="pt-2"
                    >
                      <Link 
                        to={banners[currentBannerIndex].link || "/shop"} 
                        className="text-xs font-bold uppercase tracking-widest border-b border-[#D4AF37] text-[#D4AF37] hover:text-white hover:border-white transition-colors pb-0.5 inline-block"
                      >
                        Explore Curation
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {banners.length > 1 && (
                <div className="absolute bottom-4 right-4 z-30 flex space-x-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBannerIndex(idx)}
                      className={`h-2 w-2 rounded-full transition-all duration-350 ${
                        currentBannerIndex === idx 
                          ? 'bg-[#D4AF37] scale-125' 
                          : 'bg-white/40 hover:bg-white/85'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 border border-slate-200 bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
              <div className="border border-slate-800/40 p-8 text-center space-y-4 max-w-xs bg-black/35 backdrop-blur-sm z-10">
                <span className="font-mono text-[#D4AF37] text-xs block tracking-widest uppercase mb-2">NKYLUXURY PIECES</span>
                <Link to="/shop" className="text-xs text-[#D4AF37] font-bold underline block pt-2 uppercase tracking-widest">Shop Now</Link>
              </div>
              <div className="absolute top-4 left-4 font-mono text-[10px] text-slate-500">EST. 2026</div>
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 opacity-90 z-0"></div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Simplified Trust Features Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="p-6 border border-slate-200 bg-slate-50 space-y-3"
        >
          <FiShield className="text-2xl text-slate-700" />
          <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-900">Certified Quality</h3>
          <p className="text-slate-600 text-xs font-light leading-relaxed">
            All materials are strictly vetted, certified, and carry full authenticity guarantees.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-6 border border-slate-200 bg-slate-50 space-y-3"
        >
          <FiTruck className="text-2xl text-slate-700" />
          <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-900">Priority Courier</h3>
          <p className="text-slate-600 text-xs font-light leading-relaxed">
            Insured premium courier delivery straight to your doorstep across Nigeria and worldwide.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="p-6 border border-slate-200 bg-slate-50 space-y-3"
        >
          <FiScissors className="text-2xl text-slate-700" />
          <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-900">Tailored Settings</h3>
          <p className="text-slate-600 text-xs font-light leading-relaxed">
            Collaborate directly with our artisans to craft custom jewelry specifications.
          </p>
        </motion.div>
      </section>

      {/* 3. Curated Categories Showcase */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-10">
        <div className="text-center">
          <span className="text-slate-500 text-xs uppercase tracking-widest font-bold block">Curated Collections</span>
          <h2 className="text-2xl font-bold tracking-tight uppercase mt-2">Shop by Category</h2>
          <div className="w-8 h-[1px] bg-slate-900 mx-auto mt-3"></div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-64 skeleton border border-slate-200"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.length > 0 ? (
              categories.map((cat, index) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative h-80 border border-slate-200 bg-slate-50 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/shop?category=${cat.slug}`)}
                >
                  {cat.image ? (
                    <img
                      src={getImageUrl(cat.image)}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 text-white">
                      <span className="font-mono text-[#D4AF37] text-[10px] tracking-widest uppercase block mb-2">NKYLUXURY</span>
                      <h3 className="font-serif text-base uppercase tracking-wider text-center">{cat.name}</h3>
                      <p className="text-[10px] text-slate-400 text-center mt-2 max-w-[180px] line-clamp-2">{cat.description}</p>
                    </div>
                  )}

                  {cat.image && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-6 text-white">
                      <span className="font-mono text-[#D4AF37] text-[9px] tracking-widest uppercase block mb-1">Collection</span>
                      <h3 className="font-serif text-base uppercase tracking-wider">{cat.name}</h3>
                      <p className="text-[10px] text-slate-300 mt-1 line-clamp-2 max-w-[200px] font-light">{cat.description}</p>
                      <div className="pt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[9px] font-bold uppercase tracking-widest border-b border-[#D4AF37] text-[#D4AF37] pb-0.5">Explore pieces</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="col-span-4 text-center py-12 text-slate-400 italic bg-slate-50 border border-slate-200">
                No categories found. Configure categories in the Admin Portal to display.
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. Monochromatic Products Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-10">
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <span className="text-slate-500 text-xs uppercase tracking-widest font-bold">Best Sellers</span>
            <h2 className="text-2xl font-bold tracking-tight uppercase mt-1">The Icons Catalog</h2>
          </div>
          <Link to="/shop" className="text-xs uppercase tracking-widest text-slate-800 font-bold hover:underline flex items-center">
            View All <FiArrowRight className="ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map(n => <div key={n} className="h-72 skeleton"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.length > 0 ? (
              bestSellers.map((prod, index) => (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  isWishlisted={isProductInWishlist(prod._id)}
                  onToggleWishlist={handleToggleWishlist}
                  index={index}
                />
              ))
            ) : (
              <div className="col-span-4 text-center py-12 text-slate-400 italic bg-slate-50 border border-slate-200">
                Catalog empty. Configure products in the Admin Portal to display.
              </div>
            )}
          </div>
        )}
      </section>

      {/* 5. Minimal New Arrivals */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-10">
        <div className="text-center">
          <span className="text-slate-500 text-xs uppercase tracking-widest font-bold block">Fresh Releases</span>
          <h2 className="text-2xl font-bold tracking-tight uppercase mt-2">New Arrivals</h2>
          <div className="w-8 h-[1px] bg-slate-900 mx-auto mt-3"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
          {loading ? (
            [1, 2, 3].map(n => <div key={n} className="h-80 skeleton"></div>)
          ) : newArrivals.length > 0 ? (
            newArrivals.map((prod, index) => (
              <ProductCard
                key={prod._id}
                product={prod}
                isWishlisted={isProductInWishlist(prod._id)}
                onToggleWishlist={handleToggleWishlist}
                index={index}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-slate-400 italic bg-slate-50 border border-slate-200">
              No products found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
