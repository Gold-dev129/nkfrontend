import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from './utils/api';
import { setCart } from './redux/slices/cartSlice';
import { setWishlist } from './redux/slices/wishlistSlice';

// Layouts
import Layout from './layouts/Layout';
import AdminLayout from './layouts/AdminLayout';

// Protection
import ProtectedRoute from './components/ProtectedRoute';

// Client Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserDashboard from './pages/UserDashboard';
import WishlistPage from './pages/WishlistPage';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import ScrollToTop from './components/ScrollToTop';
import Unsubscribe from './pages/Unsubscribe';
import CustomOrder from './pages/CustomOrder';
import RefundPolicy from './pages/RefundPolicy';
import FAQ from './pages/FAQ';

// Admin Pages
import AdminStats from './pages/admin/AdminStats';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminBanners from './pages/admin/AdminBanners';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCustomInquiries from './pages/admin/AdminCustomInquiries';
import AdminCoupons from './pages/admin/AdminCoupons';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Sync cart and wishlist with database when authenticated
  useEffect(() => {
    const syncData = async () => {
      if (isAuthenticated) {
        try {
          const cartRes = await api.get('/cart');
          dispatch(setCart(cartRes.data.cart));

          const wishlistRes = await api.get('/wishlist');
          dispatch(setWishlist(wishlistRes.data.wishlist));
        } catch (err) {
          console.error('Error syncing cart and wishlist:', err);
        }
      } else {
        const guestWish = localStorage.getItem('guest_wishlist');
        if (guestWish) {
          try {
            dispatch(setWishlist({ products: JSON.parse(guestWish) }));
          } catch (e) {
            console.error('Error loading guest wishlist:', e);
          }
        }
      }
    };
    syncData();
  }, [isAuthenticated, dispatch]);

  return (
    <HashRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="shop/:slug" element={<ProductDetails />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="order-history" element={<OrderHistory />} />
          <Route path="bespoke" element={<CustomOrder />} />
          <Route path="refund-policy" element={<RefundPolicy />} />
          <Route path="faq" element={<FAQ />} />
          
          <Route path="checkout" element={<Checkout />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="unsubscribe" element={<Unsubscribe />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminStats />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="custom-inquiries" element={<AdminCustomInquiries />} />
          <Route path="coupons" element={<AdminCoupons />} />
        </Route>

        {/* 404 Route redirect to home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
