import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api, { getImageUrl } from '../utils/api';
import { setCart } from '../redux/slices/cartSlice';
import { setWishlist } from '../redux/slices/wishlistSlice';
import toast from 'react-hot-toast';
import { FiHeart, FiMinus, FiPlus, FiShoppingBag, FiStar, FiVideo, FiMessageSquare, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { formatPrice } from '../utils/currency';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { currentCurrency, exchangeRate } = useSelector((state) => state.currency);

  // States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const [relatedProducts, setRelatedProducts] = useState([]);

  // 360 Rotation Viewer States
  const [is360Mode, setIs360Mode] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);

  // Auto rotation effect
  useEffect(() => {
    if (!autoRotate || !is360Mode || !product || !product.images || product.images.length === 0) return;
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % product.images.length);
    }, 250); // Rotate frame every 250ms
    return () => clearInterval(interval);
  }, [autoRotate, is360Mode, product]);

  const handleStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX);
    setAutoRotate(false); // Stop auto rotation when user drags
  };

  const handleMove = (clientX) => {
    if (!isDragging || !product || !product.images || product.images.length === 0) return;
    const deltaX = clientX - startX;
    const threshold = 15; // Change image frame every 15px dragged
    
    if (Math.abs(deltaX) > threshold) {
      const direction = deltaX > 0 ? -1 : 1; // drag left -> prev frame, drag right -> next frame
      const framesCount = product.images.length;
      setFrameIndex((prev) => (prev + direction + framesCount) % framesCount);
      setStartX(clientX);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/products/${slug}`);
        const prod = response.data.product;
        setProduct(prod);
        setActiveImage(prod.images[0]);
        setQuantity(1);

        // Initialize selected color
        if (prod.colors && prod.colors.length > 0) {
          setSelectedColor(prod.colors[0]);
        } else {
          setSelectedColor('');
        }

        // Fetch related products
        const relRes = await api.get(`/products/related/${prod._id}`);
        setRelatedProducts(relRes.data.products);

        // Fetch approved reviews
        const revRes = await api.get(`/reviews/product/${prod._id}`);
        setReviews(revRes.data.reviews);
      } catch (err) {
        toast.error('Product not found');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [slug, navigate]);

  const handleQuantityChange = (type) => {
    if (type === 'inc') {
      if (quantity < product.stock) {
        setQuantity(quantity + 1);
      } else {
        toast.error(`Only ${product.stock} items available in stock`);
      }
    } else {
      if (quantity > 1) {
        setQuantity(quantity - 1);
      }
    }
  };

  const handleImageNav = (direction) => {
    if (!product || !product.images || product.images.length === 0) return;
    const currentIndex = product.images.indexOf(activeImage);
    let newIndex = currentIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % product.images.length;
    } else {
      newIndex = (currentIndex - 1 + product.images.length) % product.images.length;
    }
    setActiveImage(product.images[newIndex]);
  };

  const handleAddToCart = async () => {
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    if (!isAuthenticated) {
      const guestCart = localStorage.getItem('guest_cart');
      let items = guestCart ? JSON.parse(guestCart) : [];
      const existsIdx = items.findIndex(item => item.product._id === product._id && (item.color || '') === selectedColor);
      
      if (existsIdx > -1) {
        const currentQty = items[existsIdx].quantity;
        if (currentQty + quantity <= product.stock) {
          items[existsIdx].quantity += quantity;
          toast.success(`Increased ${product.name} (${selectedColor || 'Standard'}) quantity in bag!`);
        } else {
          toast.error(`Only ${product.stock} items available in stock`);
          return;
        }
      } else {
        items.push({
          _id: `GUEST_ITEM_${Math.random().toString(36).substring(2, 9)}`,
          product: product,
          quantity: quantity,
          color: selectedColor
        });
        toast.success(`${product.name} (${selectedColor || 'Standard'}) added to bag!`);
      }
      localStorage.setItem('guest_cart', JSON.stringify(items));
      dispatch(setCart({ items }));
      return;
    }

    try {
      const response = await api.post('/cart', {
        product: product._id,
        quantity,
        color: selectedColor
      });
      dispatch(setCart(response.data.cart));
      toast.success(`${product.name} (${selectedColor || 'Standard'}) added to bag!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding to bag');
    }
  };

  const handleToggleWishlist = async (productId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const idToToggle = productId && typeof productId === 'string' ? productId : product._id;
    const targetProduct = productId && typeof productId === 'string' ? relatedProducts.find(p => p._id === productId) || product : product;

    if (!isAuthenticated) {
      // Guest Favourites Toggle
      const localList = localStorage.getItem('guest_wishlist');
      let productsList = localList ? JSON.parse(localList) : [];
      const exists = productsList.some(p => p._id === idToToggle);
      
      if (exists) {
        productsList = productsList.filter(p => p._id !== idToToggle);
        toast.success('Removed from favorites');
      } else {
        productsList.push(targetProduct);
        toast.success('Added to favorites');
      }
      localStorage.setItem('guest_wishlist', JSON.stringify(productsList));
      dispatch(setWishlist({ products: productsList }));
      return;
    }

    try {
      const response = await api.post(`/wishlist/${idToToggle}`);
      dispatch(setWishlist(response.data.wishlist));
      toast.success(response.data.message);
    } catch (err) {
      toast.error('Error updating wishlist');
    }
  };

  const isProductInWishlist = (productId) => {
    const idToCheck = productId && typeof productId === 'string' ? productId : product?._id;
    if (!idToCheck) return false;
    return wishlist?.products?.some(p => p._id === idToCheck || p === idToCheck) || false;
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment) return;

    setSubmittingReview(true);
    try {
      const response = await api.post(`/reviews/${product._id}`, {
        rating: newRating,
        comment: newComment
      });
      toast.success(response.data.message);
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const isVideoUrl = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv', '.wmv'];
    const isVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    return isVideoExtension || url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.includes('/video/upload/');
  };

  const renderVideoPlayer = (url) => {
    const isDirectVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || url.includes('/video/upload/');
    if (isDirectVideo) {
      return (
        <video
          src={url}
          controls
          autoPlay
          muted
          loop
          className="h-full w-full object-cover"
        />
      );
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else {
        videoId = url.split('v=')[1]?.split('&')[0];
      }
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`}
          title="Product Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full object-cover"
        />
      );
    } else if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1`}
          title="Product Video"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="h-full w-full object-cover"
        />
      );
    }
    return <p className="text-center py-20 text-luxury-gray">Unsupported video format</p>;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-96 skeleton border border-luxury-gold/10"></div>
          <div className="space-y-6">
            <div className="h-8 w-3/4 skeleton"></div>
            <div className="h-6 w-1/4 skeleton"></div>
            <div className="h-24 w-full skeleton"></div>
            <div className="h-12 w-1/2 skeleton"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">
      {/* 1. Main Showcase */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images Columns */}
        <div className="space-y-4">
          <div className="h-[450px] w-full overflow-hidden border border-luxury-gold/10 bg-white relative select-none">
            {is360Mode ? (
              <div
                className="relative h-full w-full bg-white flex items-center justify-center cursor-ew-resize select-none"
                onMouseDown={(e) => handleStart(e.clientX)}
                onMouseMove={(e) => handleMove(e.clientX)}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={(e) => handleStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                onTouchEnd={handleEnd}
              >
                <img
                  src={getImageUrl(product.images[frameIndex])}
                  alt={`${product.name} 360 rotation view frame`}
                  className="h-full w-full object-cover pointer-events-none"
                />

                {/* 360 Badge Overlay */}
                <div className="absolute top-4 left-4 bg-luxury-black/90 text-luxury-gold text-[9px] font-bold px-3 py-1.5 uppercase tracking-widest border border-luxury-gold/30 flex items-center gap-2 backdrop-blur-sm z-20">
                  <span className="w-1.5 h-1.5 bg-luxury-gold rounded-full animate-ping"></span>
                  <span>Interactive 360° View</span>
                </div>

                {/* Instructions Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-luxury-black/80 border border-luxury-gold/10 text-white px-4 py-2.5 text-[9px] uppercase tracking-widest font-semibold font-sans backdrop-blur-sm z-20">
                  <span className="text-slate-300">Drag horizontally to rotate</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAutoRotate(!autoRotate);
                    }}
                    className="text-luxury-gold hover:text-white transition-colors tracking-widest font-bold font-sans cursor-pointer"
                  >
                    {autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
                  </button>
                </div>
              </div>
            ) : isVideoUrl(activeImage) ? (
              renderVideoPlayer(activeImage)
            ) : (
              <div className="relative h-full w-full group">
                <img
                  src={getImageUrl(activeImage)}
                  alt={product.name}
                  className="h-full w-full object-cover zoom-image"
                />
                {product.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleImageNav('prev')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/45 text-white p-2 hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-center cursor-pointer z-10 rounded-full"
                      aria-label="Previous Image"
                    >
                      <FiChevronLeft className="text-lg" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleImageNav('next')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/45 text-white p-2 hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-center cursor-pointer z-10 rounded-full"
                      aria-label="Next Image"
                    >
                      <FiChevronRight className="text-lg" />
                    </button>
                  </>
                )}
              </div>
            )}
            {product.discountPrice > 0 && product.price > 0 && (
              <span className="absolute top-4 right-4 z-25 bg-luxury-black text-white border border-luxury-gold/50 text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                Up To {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% Off
              </span>
            )}
          </div>
          
          {/* Thumbnails Row */}
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {product.images.map((imgUrl, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveImage(imgUrl);
                  setIs360Mode(false);
                }}
                className={`h-20 w-20 border flex-shrink-0 bg-white ${
                  activeImage === imgUrl && !is360Mode ? 'border-luxury-gold' : 'border-luxury-gold/10 hover:border-luxury-gold/45'
                }`}
                aria-label={`Thumbnail ${i + 1}`}
              >
                <img src={getImageUrl(imgUrl)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
            {product.video && (
              <button
                onClick={() => {
                  setActiveImage(product.video);
                  setIs360Mode(false);
                }}
                className={`h-20 w-20 border flex-shrink-0 bg-slate-900 text-luxury-gold flex flex-col items-center justify-center space-y-1 relative ${
                  activeImage === product.video && !is360Mode ? 'border-luxury-gold' : 'border-luxury-gold/10 hover:border-luxury-gold/45'
                }`}
                aria-label="Product Video Thumbnail"
              >
                <FiVideo className="text-xl animate-pulse" />
                <span className="text-[8px] uppercase tracking-wider font-semibold">Play Video</span>
              </button>
            )}
            {product.images.length >= 4 && (
              <button
                onClick={() => {
                  setIs360Mode(true);
                  setFrameIndex(0);
                }}
                className={`h-20 w-20 border flex-shrink-0 bg-luxury-black text-white flex flex-col items-center justify-center space-y-1 relative ${
                  is360Mode ? 'border-luxury-gold' : 'border-luxury-gold/10 hover:border-luxury-gold/45'
                }`}
                aria-label="Interactive 360 View Thumbnail"
              >
                <FiRefreshCw className="text-xl animate-spin" style={{ animationDuration: '6s' }} />
                <span className="text-[8px] uppercase tracking-wider font-semibold">360° View</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Details Columns */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="font-sans text-[10px] uppercase text-luxury-gold tracking-widest font-semibold">
              {product.category?.name} | {product.material}
            </span>
            <h1 className="font-serif text-3xl text-luxury-black font-bold">{product.name}</h1>
            
            {/* Rating Stars Summary */}
            <div className="flex items-center space-x-2 text-xs font-sans text-luxury-gray">
              <div className="flex text-luxury-gold">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar key={s} className={s <= product.averageRating ? "fill-luxury-gold" : ""} />
                ))}
              </div>
              <span className="font-semibold text-luxury-black">({product.averageRating.toFixed(1)})</span>
              <span>•</span>
              <span>{product.totalReviews} Reviews</span>
            </div>

            {/* Price section */}
            <div className="flex items-center space-x-3 border-y border-luxury-gold/10 py-4 font-sans">
              {product.discountPrice > 0 ? (
                <>
                  <span className="text-luxury-gray line-through text-sm">{formatPrice(product.price, currentCurrency, exchangeRate)}</span>
                  <span className="text-luxury-gold font-bold text-2xl">{formatPrice(product.discountPrice, currentCurrency, exchangeRate)}</span>
                </>
              ) : (
                <span className="text-luxury-black font-bold text-2xl">{formatPrice(product.price, currentCurrency, exchangeRate)}</span>
              )}
            </div>

            <p className="font-sans text-xs text-luxury-gray leading-relaxed">{product.shortDescription}</p>

            {/* Specifications list */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-b border-luxury-gold/10 pb-6 font-sans text-xs">
              <div>
                <span className="text-luxury-gray uppercase block font-semibold text-[10px]">SKU Number</span>
                <span className="text-luxury-black font-medium">{product.sku}</span>
              </div>
              <div>
                <span className="text-luxury-gray uppercase block font-semibold text-[10px]">Material Type</span>
                <span className="text-luxury-black font-medium">{product.material}</span>
              </div>
              {product.weight && (
                <div>
                  <span className="text-luxury-gray uppercase block font-semibold text-[10px]">Weight</span>
                  <span className="text-luxury-black font-medium">{product.weight}</span>
                </div>
              )}
              <div>
                <span className="text-luxury-gray uppercase block font-semibold text-[10px]">Availability</span>
                <span className={`font-semibold ${product.isCustom ? 'text-luxury-gold' : product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {product.isCustom ? 'Custom Order (Made to Order)' : product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          {product.isCustom ? (
            <div className="space-y-4 pt-4 font-sans text-xs">
              <div className="bg-slate-50 border-l border-luxury-gold p-4 text-[10px] space-y-2 text-slate-800 leading-relaxed font-sans">
                <p className="font-bold uppercase tracking-wider text-slate-900">Custom Made Selection</p>
                <p>• Custom-made designs require personalized consultation and detail discussions via WhatsApp.</p>
                <p>• <strong>Delivery timeline:</strong> Communicated directly to you once your bespoke piece is ready.</p>
              </div>

              <div className="flex gap-4">
                <a
                  href={`https://wa.me/2347051530996?text=${encodeURIComponent(
                    'Hello NKYLUXURY Private Concierge, I would like to inquire about fine jewelry designs and custom pieces.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-grow bg-luxury-black text-white border border-luxury-gold py-4 uppercase tracking-luxury font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer text-center"
                >
                  <FiMessageSquare />
                  <span>Order Custom Made via WhatsApp</span>
                </a>

                <button
                  onClick={handleToggleWishlist}
                  className="border border-luxury-gold/30 p-4 hover:text-red-500 bg-white hover:border-luxury-gold transition-all"
                  aria-label="Add to Wishlist"
                >
                  <FiHeart className={isProductInWishlist() ? "fill-red-500 text-red-500" : "text-luxury-black"} />
                </button>
              </div>
            </div>
          ) : (
            product.stock > 0 && (
              <div className="space-y-4 pt-4 font-sans text-xs">
                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-3 pb-2 border-b border-luxury-gold/10 font-sans">
                    <span className="font-semibold uppercase tracking-wider text-luxury-gray text-xs block">Choose Color:</span>
                    <div className="flex flex-wrap gap-2.5">
                      {product.colors.map((colorName) => (
                        <button
                          key={colorName}
                          type="button"
                          onClick={() => setSelectedColor(colorName)}
                          className={`px-4 py-2 border text-[10px] tracking-wider uppercase font-bold transition-all duration-200 cursor-pointer ${
                            selectedColor === colorName
                              ? 'border-luxury-gold bg-luxury-black text-white'
                              : 'border-luxury-gold/25 text-luxury-gray hover:border-luxury-gold/50 bg-white'
                          }`}
                        >
                          {colorName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-6">
                  <span className="font-semibold uppercase tracking-wider text-luxury-gray">Quantity:</span>
                  <div className="flex items-center border border-luxury-gold/20 bg-white">
                    <button onClick={() => handleQuantityChange('dec')} className="p-3 text-luxury-black hover:text-luxury-gold" aria-label="Decrease quantity">
                      <FiMinus />
                    </button>
                    <span className="px-4 text-sm font-semibold">{quantity}</span>
                    <button onClick={() => handleQuantityChange('inc')} className="p-3 text-luxury-black hover:text-luxury-gold" aria-label="Increase quantity">
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border-l border-luxury-gold/50 p-4 text-[10px] space-y-1 text-slate-800 leading-relaxed font-sans">
                  <p>• <strong>Delivery timeline:</strong> Standard delivery takes 3-10 days.</p>
                  <p>• Delivery fee is paid directly to the courier agent upon arrival.</p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-grow bg-luxury-black text-white border border-luxury-gold py-4 uppercase tracking-luxury font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <FiShoppingBag />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    onClick={handleToggleWishlist}
                    className="border border-luxury-gold/30 p-4 hover:text-red-500 bg-white hover:border-luxury-gold transition-all"
                    aria-label="Add to Wishlist"
                  >
                    <FiHeart className={isProductInWishlist() ? "fill-red-500 text-red-500" : "text-luxury-black"} />
                  </button>
                </div>

                <a
                  href={`https://wa.me/2347051530996?text=${encodeURIComponent(
                    'Hello NKYLUXURY Private Concierge, I would like to inquire about fine jewelry designs and custom pieces.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full border border-luxury-black text-luxury-black bg-transparent py-4 uppercase tracking-widest font-semibold hover:bg-luxury-black hover:text-white transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer text-center"
                >
                  <FiMessageSquare />
                  <span>Inquire via WhatsApp</span>
                </a>
              </div>
            )
          )}
        </div>
      </section>

      {/* 2. Full Description Section */}
      <section className="bg-white p-8 border border-luxury-gold/15">
        <h3 className="font-serif text-lg text-luxury-black border-b border-luxury-gold/20 pb-2 mb-4">Detailed Description</h3>
        <p className="font-sans text-xs text-luxury-gray leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </section>

      {/* 3. Review Management (Public List & protected Submit form) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-luxury-gold/10 font-sans text-xs">
        {/* Reviews List */}
        <div className="space-y-6">
          <h3 className="font-serif text-lg text-luxury-black">Client Reviews ({reviews.length})</h3>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev._id} className="bg-white p-4 border border-luxury-gold/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-luxury-black">{rev.name}</span>
                    <span className="text-[10px] text-luxury-gray">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-luxury-gold">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FiStar key={s} className={s <= rev.rating ? "fill-luxury-gold text-xs" : "text-xs"} />
                    ))}
                  </div>
                  <p className="text-luxury-gray text-xs italic">"{rev.comment}"</p>
                </div>
              ))
            ) : (
              <p className="text-luxury-gray text-xs italic">No reviews have been written for this product yet.</p>
            )}
          </div>
        </div>

        {/* Review Submission Form */}
        <div>
          {isAuthenticated ? (
            <div className="bg-white p-6 border border-luxury-gold/20">
              <h3 className="font-serif text-md text-luxury-black mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-luxury-gray font-semibold mb-2">Rating</label>
                  <div className="flex space-x-2 text-xl">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewRating(s)}
                        className="text-luxury-gold"
                        aria-label={`Rate ${s} stars`}
                      >
                        <FiStar className={s <= newRating ? "fill-luxury-gold" : ""} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-luxury-gray font-semibold mb-2">Comment</label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows="3"
                    className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none focus:border-luxury-gold resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-luxury-black text-white px-6 py-3 border border-luxury-gold font-semibold uppercase tracking-widest text-[10px] hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-luxury-gold/5 p-6 border border-dashed border-luxury-gold/30 text-center">
              <p className="font-serif text-sm text-luxury-black">Share Your Experience</p>
              <p className="font-sans text-xs text-luxury-gray mt-2">Only registered buyers can leave product reviews.</p>
              <Link to="/login" className="mt-4 bg-luxury-black text-white px-4 py-2 border border-luxury-gold inline-block uppercase tracking-widest text-[10px] font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-colors">
                Sign In to Review
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 4. Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-luxury-gold/10">
          <h3 className="font-serif text-lg text-luxury-black mb-8 text-center">You May Also Exquisite</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {relatedProducts.map((prod, index) => (
              <ProductCard
                key={prod._id}
                product={prod}
                isWishlisted={isProductInWishlist(prod._id)}
                onToggleWishlist={handleToggleWishlist}
                index={index}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
