import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { setWishlist } from '../redux/slices/wishlistSlice';
import { FiHeart, FiSearch, FiSliders, FiX } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { currentCurrency } = useSelector((state) => state.currency);

  // States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filter bindings
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Load Categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await api.get('/categories');
        setCategories(catRes.data.categories);
      } catch (err) {
        console.error('Error loading filters:', err);
      }
    };
    fetchCategories();
  }, []);

  // Synchronize state when URL search params change
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSort(searchParams.get('sort') || '-createdAt');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  // Fetch products on query parameters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        const urlSearch = searchParams.get('search');
        const urlCategory = searchParams.get('category');
        const urlMin = searchParams.get('minPrice');
        const urlMax = searchParams.get('maxPrice');
        const urlSort = searchParams.get('sort');

        if (urlSearch) params.search = urlSearch;
        if (urlCategory) params.category = urlCategory;
        if (urlMin) params.minPrice = urlMin;
        if (urlMax) params.maxPrice = urlMax;
        if (urlSort) params.sort = urlSort;
        params.page = Number(searchParams.get('page')) || 1;
        params.limit = 9;

        const response = await api.get('/products', { params });
        setProducts(response.data.products);
        setTotalPages(response.data.pages);
        setTotalProducts(response.data.total);
      } catch (err) {
        toast.error('Error loading products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  // Synchronize search params with URL
  const applyFilters = () => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sort) params.sort = sort;
    params.page = 1; // reset page to 1 on filter submit
    
    setSearchParams(params);
    setPage(1);
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('-createdAt');
    setPage(1);
    setSearchParams({});
    setShowMobileFilters(false);
  };

  const handleCategorySelect = (selectedCat, isMobile = false) => {
    setCategory(selectedCat);
    const params = Object.fromEntries(searchParams.entries());
    if (selectedCat) {
      params.category = selectedCat;
    } else {
      delete params.category;
    }
    params.page = 1;
    setSearchParams(params);
    if (isMobile) {
      setShowMobileFilters(false);
    }
  };

  const handleSortSelect = (selectedSort, isMobile = false) => {
    setSort(selectedSort);
    const params = Object.fromEntries(searchParams.entries());
    params.sort = selectedSort;
    params.page = 1;
    setSearchParams(params);
    if (isMobile) {
      setShowMobileFilters(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    
    const params = Object.fromEntries(searchParams.entries());
    params.page = newPage;
    setSearchParams(params);
  };

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
        const found = products.find(p => p._id === productId);
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
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* 1. Header Section */}
      <div className="text-center md:text-left border-b border-luxury-gold/10 pb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-luxury-black">NKYLUXURY Collections</h1>
          <p className="font-sans text-xs text-luxury-gray mt-1 uppercase tracking-widest font-semibold">
            Showing {products.length} of {totalProducts} Masterpieces
          </p>
        </div>
        
        {/* Search Bar & Mobile Filter Trigger */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64 font-sans text-xs">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="SEARCH PRODUCTS..."
              className="w-full bg-white border border-luxury-gold/20 pl-4 pr-10 py-3 uppercase tracking-wider focus:outline-none focus:border-luxury-gold"
            />
            <button onClick={applyFilters} className="absolute right-3 top-3 text-luxury-gold text-lg" aria-label="Search submit">
              <FiSearch />
            </button>
          </div>
          
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-2 border border-luxury-gold/30 bg-white px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wider text-luxury-black"
          >
            <FiSliders /> Filters
          </button>
        </div>
      </div>

      {/* 2. Main Layout Container */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block space-y-8 font-sans text-xs">
          <div className="flex justify-between items-center border-b border-luxury-gold/20 pb-3">
            <h3 className="font-serif text-sm uppercase tracking-widest text-luxury-black font-semibold">Filter By</h3>
            <button onClick={clearFilters} className="text-luxury-gold hover:underline font-semibold uppercase tracking-wider">
              Clear All
            </button>
          </div>

          {/* Categories Selector */}
          <div className="space-y-3">
            <h4 className="font-semibold uppercase tracking-wider text-luxury-black">Categories</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <label className="flex items-center space-x-2 cursor-pointer uppercase text-[10px]">
                <input
                  type="radio"
                  checked={category === ''}
                  onChange={() => handleCategorySelect('')}
                  className="accent-luxury-gold"
                />
                <span className={category === '' ? 'text-luxury-gold font-bold' : 'text-luxury-gray'}>All Categories</span>
              </label>
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center space-x-2 cursor-pointer uppercase text-[10px]">
                  <input
                    type="radio"
                    checked={category === cat.slug || category === cat._id}
                    onChange={() => handleCategorySelect(cat.slug)}
                    className="accent-luxury-gold"
                  />
                  <span className={(category === cat.slug || category === cat._id) ? 'text-luxury-gold font-bold' : 'text-luxury-gray'}>
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          </div>



          {/* Price Range */}
          <div className="space-y-3">
            <h4 className="font-semibold uppercase tracking-wider text-luxury-black">Price Range ({currentCurrency === 'USD' ? '$' : '₦'})</h4>
            <div className="flex gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="MIN"
                className="w-1/2 bg-white border border-luxury-gold/20 px-2 py-2 focus:outline-none focus:border-luxury-gold text-center uppercase"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="MAX"
                className="w-1/2 bg-white border border-luxury-gold/20 px-2 py-2 focus:outline-none focus:border-luxury-gold text-center uppercase"
              />
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-3">
            <h4 className="font-semibold uppercase tracking-wider text-luxury-black">Sort By</h4>
            <select
              value={sort}
              onChange={(e) => handleSortSelect(e.target.value)}
              className="w-full bg-white border border-luxury-gold/20 px-3 py-3 focus:outline-none focus:border-luxury-gold uppercase"
            >
              <option value="-createdAt">Newest Arrivals</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-averageRating">Popularity</option>
            </select>
          </div>

          <button
            onClick={applyFilters}
            className="w-full bg-luxury-black text-white py-3 uppercase tracking-luxury border border-luxury-gold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300 font-semibold"
          >
            Apply Filters
          </button>
        </aside>

        {/* Products Grid Content */}
        <div className="md:col-span-3 space-y-12">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 skeleton border border-luxury-gold/10"></div>
              ))}
            </div>
          ) : (
            <>
              {products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                  {products.map((prod, index) => (
                    <ProductCard
                      key={prod._id}
                      product={prod}
                      isWishlisted={isProductInWishlist(prod._id)}
                      onToggleWishlist={handleToggleWishlist}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white border border-luxury-gold/10">
                  <p className="font-serif text-lg text-luxury-black">No Masterpieces Found</p>
                  <p className="font-sans text-xs text-luxury-gray mt-2">Try adjusting your filters or query parameters.</p>
                  <button onClick={clearFilters} className="mt-6 bg-luxury-black text-white border border-luxury-gold px-6 py-3 uppercase tracking-widest text-xs font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-colors">
                    Reset Filters
                  </button>
                </div>
              )}

              {/* 3. Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 border-t border-luxury-gold/10 pt-8 font-sans text-xs">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="border border-luxury-gold/20 px-4 py-2 hover:border-luxury-gold hover:text-luxury-gold disabled:opacity-30 disabled:hover:text-inherit uppercase tracking-wider font-semibold"
                  >
                    Previous
                  </button>
                  <span className="text-luxury-black font-semibold tracking-widest uppercase">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="border border-luxury-gold/20 px-4 py-2 hover:border-luxury-gold hover:text-luxury-gold disabled:opacity-30 disabled:hover:text-inherit uppercase tracking-wider font-semibold"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer Filter Menu */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="w-80 bg-luxury-cream h-full p-6 flex flex-col justify-between overflow-y-auto font-sans text-xs">
            <div>
              <div className="flex justify-between items-center border-b border-luxury-gold/20 pb-4 mb-6">
                <h3 className="font-serif text-md uppercase tracking-widest text-luxury-black font-semibold">Filter Selections</h3>
                <button onClick={() => setShowMobileFilters(false)} className="text-luxury-black text-lg">
                  <FiX />
                </button>
              </div>

              {/* Duplicate Filters for Mobile */}
              <div className="space-y-6">
                {/* Categories */}
                <div className="space-y-2">
                  <h4 className="font-semibold uppercase tracking-wider text-luxury-black">Categories</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer uppercase text-[10px]">
                      <input type="radio" checked={category === ''} onChange={() => handleCategorySelect('', true)} className="accent-luxury-gold" />
                      <span className={category === '' ? 'text-luxury-gold font-bold' : 'text-luxury-gray'}>All</span>
                    </label>
                    {categories.map((cat) => (
                      <label key={cat._id} className="flex items-center space-x-2 cursor-pointer uppercase text-[10px]">
                        <input
                          type="radio"
                          checked={category === cat.slug || category === cat._id}
                          onChange={() => handleCategorySelect(cat.slug, true)}
                          className="accent-luxury-gold"
                        />
                        <span className={(category === cat.slug || category === cat._id) ? 'text-luxury-gold font-bold' : 'text-luxury-gray'}>
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>



                {/* Price */}
                <div className="space-y-2">
                  <h4 className="font-semibold uppercase tracking-wider text-luxury-black">Price Range ({currentCurrency === 'USD' ? '$' : '₦'})</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="MIN"
                      className="w-1/2 bg-white border border-luxury-gold/20 px-2 py-2 focus:outline-none focus:border-luxury-gold text-center uppercase"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="MAX"
                      className="w-1/2 bg-white border border-luxury-gold/20 px-2 py-2 focus:outline-none focus:border-luxury-gold text-center uppercase"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <h4 className="font-semibold uppercase tracking-wider text-luxury-black">Sort</h4>
                  <select
                    value={sort}
                    onChange={(e) => handleSortSelect(e.target.value, true)}
                    className="w-full bg-white border border-luxury-gold/20 px-3 py-3 focus:outline-none"
                  >
                    <option value="-createdAt">Newest</option>
                    <option value="price">Price: Low-High</option>
                    <option value="-price">Price: High-Low</option>
                    <option value="-averageRating">Popularity</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-luxury-gold/20">
              <button
                onClick={applyFilters}
                className="w-full bg-luxury-black text-white py-3 uppercase tracking-widest font-semibold border border-luxury-gold"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="w-full bg-transparent text-luxury-black py-3 uppercase tracking-widest font-semibold border border-luxury-black"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
