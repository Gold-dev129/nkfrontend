import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api';
import { setCart, clearCartState } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { formatPrice } from '../utils/currency';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { cart, loading } = useSelector((state) => state.cart);
  const { currentCurrency, exchangeRate } = useSelector((state) => state.currency);

  const cartItems = cart?.items || [];

  // Calculate Subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
      return acc + price * item.quantity;
    }, 0);
  };

  const handleQuantityUpdate = async (productId, currentQty, stockLimit, direction) => {
    let newQty = direction === 'inc' ? currentQty + 1 : currentQty - 1;
    
    if (newQty < 1) return;
    if (newQty > stockLimit) {
      toast.error(`Only ${stockLimit} items left in stock`);
      return;
    }

    if (!isAuthenticated) {
      const guestCart = localStorage.getItem('guest_cart');
      let items = guestCart ? JSON.parse(guestCart) : [];
      items = items.map(item => item.product._id === productId ? { ...item, quantity: newQty } : item);
      localStorage.setItem('guest_cart', JSON.stringify(items));
      dispatch(setCart({ items }));
      return;
    }

    try {
      const response = await api.put(`/cart/item/${productId}`, { quantity: newQty });
      dispatch(setCart(response.data.cart));
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!isAuthenticated) {
      const guestCart = localStorage.getItem('guest_cart');
      let items = guestCart ? JSON.parse(guestCart) : [];
      items = items.filter(item => item.product._id !== productId);
      localStorage.setItem('guest_cart', JSON.stringify(items));
      dispatch(setCart({ items }));
      toast.success('Item removed from cart');
      return;
    }

    try {
      const response = await api.delete(`/cart/item/${productId}`);
      dispatch(setCart(response.data.cart));
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      if (!isAuthenticated) {
        localStorage.removeItem('guest_cart');
        dispatch(setCart({ items: [] }));
        toast.success('Cart cleared');
        return;
      }

      try {
        const response = await api.delete('/cart');
        dispatch(setCart(response.data.cart));
        toast.success('Cart cleared');
      } catch (err) {
        toast.error('Failed to clear cart');
      }
    }
  };

  const subtotal = calculateSubtotal();
  const shippingFee = 0;
  const grandTotal = subtotal;

  // Guest cart is supported, no redirect needed here.

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-luxury-gold/10 pb-6 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-3xl text-luxury-black">Shopping Bag</h1>
          <p className="font-sans text-xs text-luxury-gray mt-1 uppercase tracking-widest font-semibold">
            {cartItems.length} Unique Masterpieces Selected
          </p>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={handleClearCart}
            className="font-sans text-xs uppercase tracking-widest text-red-700 hover:underline font-semibold flex items-center gap-1"
          >
            <FiTrash2 /> Clear Bag
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white border border-luxury-gold/10">
          <FiShoppingBag className="text-4xl text-luxury-gold mx-auto mb-4" />
          <h3 className="font-serif text-lg text-luxury-black">Your bag is empty</h3>
          <p className="font-sans text-xs text-luxury-gray mt-2">Explore our collections and add products to start shopping.</p>
          <Link to="/shop" className="mt-6 bg-luxury-black text-white border border-luxury-gold px-6 py-3 uppercase tracking-widest text-xs font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-colors inline-block">
            Go to Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 font-sans text-xs">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => {
              const product = item.product;
              if (!product) return null;
              
              const itemPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

              return (
                <div key={item._id} className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 border border-luxury-gold/10 gap-6">
                  {/* Image & Title */}
                  <div className="flex items-center space-x-6 w-full sm:w-auto">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-24 w-24 object-cover border border-luxury-gold/10"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] text-luxury-gold uppercase tracking-wider font-semibold">
                        {product.material}
                      </span>
                      <h3 className="font-serif text-sm text-luxury-black font-semibold hover:text-luxury-gold">
                        <Link to={`/shop/${product.slug}`}>{product.name}</Link>
                      </h3>
                      <p className="text-[10px] text-luxury-gray uppercase">SKU: {product.sku}</p>
                    </div>
                  </div>

                  {/* Quantity & Price Controls */}
                  <div className="flex justify-between sm:justify-start items-center gap-10 w-full sm:w-auto">
                    {/* Quantity selectors */}
                    <div className="flex items-center border border-luxury-gold/20 bg-white">
                      <button
                        onClick={() => handleQuantityUpdate(product._id, item.quantity, product.stock, 'dec')}
                        disabled={item.quantity <= 1}
                        className="p-2 text-luxury-black hover:text-luxury-gold disabled:opacity-30"
                        aria-label="Decrease quantity"
                      >
                        <FiMinus />
                      </button>
                      <span className="px-3 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityUpdate(product._id, item.quantity, product.stock, 'inc')}
                        className="p-2 text-luxury-black hover:text-luxury-gold"
                        aria-label="Increase quantity"
                      >
                        <FiPlus />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold text-sm text-luxury-black">
                        {formatPrice(itemPrice * item.quantity, currentCurrency, exchangeRate)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-luxury-gray">
                          {formatPrice(itemPrice, currentCurrency, exchangeRate)} each
                        </p>
                      )}
                    </div>

                    {/* Delete Icon */}
                    <button
                      onClick={() => handleRemoveItem(product._id)}
                      className="text-luxury-gray hover:text-red-500 text-sm p-1"
                      aria-label="Remove item"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Box Sidebar */}
          <div className="bg-white p-6 border border-luxury-gold/20 h-fit space-y-6">
            <h3 className="font-serif text-lg text-luxury-black border-b border-luxury-gold/10 pb-3">Order Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-luxury-gray font-semibold">
                <span>Subtotal</span>
                <span className="text-luxury-black font-bold">{formatPrice(subtotal, currentCurrency, exchangeRate)}</span>
              </div>
              <div className="flex justify-between text-luxury-gray items-center font-semibold">
                <span>Delivery Fee</span>
                <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 border border-slate-200/50 uppercase font-bold tracking-wider font-mono">Paid on Delivery</span>
              </div>
              
              <hr className="border-luxury-gold/10" />
              
              <div className="flex justify-between text-luxury-black font-semibold text-sm">
                <span>Total Cost</span>
                <span className="text-luxury-gold font-bold text-lg">{formatPrice(grandTotal, currentCurrency, exchangeRate)}</span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <Link
                to="/checkout"
                className="w-full bg-luxury-black text-white border border-luxury-gold py-4 uppercase tracking-luxury font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <FiArrowRight />
              </Link>
              <Link
                to="/shop"
                className="w-full bg-transparent text-luxury-black py-4 uppercase tracking-widest font-semibold border border-luxury-black hover:border-luxury-gold hover:text-luxury-gold text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
