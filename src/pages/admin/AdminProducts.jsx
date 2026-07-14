import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiX, FiUpload, FiImage } from 'react-icons/fi';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [stock, setStock] = useState('');
  const [material, setMaterial] = useState('');
  const [weight, setWeight] = useState('');
  const [category, setCategory] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [video, setVideo] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isCustom, setIsCustom] = useState(false);
  
  // Image states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Recalculation helpers for real-time price/discount synchronization
  const handleDiscountPercentChange = (val) => {
    setDiscountPercentage(val);
    if (val && price) {
      const computed = Math.round(Number(price) - (Number(price) * Number(val) / 100));
      setDiscountPrice(computed);
    } else {
      setDiscountPrice('');
    }
  };

  const handleDiscountPriceChange = (val) => {
    setDiscountPrice(val);
    if (val && price && Number(price) > 0) {
      const computed = Math.round(((Number(price) - Number(val)) / Number(price)) * 100);
      setDiscountPercentage(computed);
    } else {
      setDiscountPercentage('');
    }
  };

  const handlePriceChange = (val) => {
    setPrice(val);
    if (discountPercentage && val) {
      const computed = Math.round(Number(val) - (Number(val) * Number(discountPercentage) / 100));
      setDiscountPrice(computed);
    } else if (discountPrice && val && Number(val) > 0) {
      const computed = Math.round(((Number(val) - Number(discountPrice)) / Number(val)) * 100);
      setDiscountPercentage(computed);
    }
  };
  const [replaceImages, setReplaceImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Get all products (default 100 limit for administration)
      const response = await api.get('/products?limit=100');
      setProducts(response.data.products);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setSku('');
    setPrice('');
    setDiscountPrice('');
    setDiscountPercentage('');
    setStock('');
    setMaterial('Gold');
    setWeight('');
    setCategory(categories[0]?._id || '');
    setShortDescription('');
    setDescription('');
    setFeatured(false);
    setBestSeller(false);
    setNewArrival(true);
    setVideo('');
    setVideoFile(null);
    setVideoPreview(null);
    setIsCustom(false);
    setSelectedFiles([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setReplaceImages(false);
    setShowForm(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingId(prod._id);
    setName(prod.name);
    setSku(prod.sku);
    setPrice(prod.price);
    setDiscountPrice(prod.discountPrice || '');
    setDiscountPercentage(prod.discountPercentage || (prod.discountPrice && prod.price ? Math.round(((prod.price - prod.discountPrice) / prod.price) * 100) : ''));
    setStock(prod.stock);
    setMaterial(prod.material);
    setWeight(prod.weight || '');
    setCategory(prod.category?._id || prod.category);
    setShortDescription(prod.shortDescription);
    setDescription(prod.description);
    setFeatured(prod.featured);
    setBestSeller(prod.bestSeller);
    setNewArrival(prod.newArrival);
    setVideo(prod.video || '');
    setVideoFile(null);
    setVideoPreview(prod.video || null);
    setIsCustom(prod.isCustom || false);
    setSelectedFiles([]);
    setExistingImages(prod.images || []);
    setImagesToDelete([]);
    setReplaceImages(false);
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleRemoveExistingImage = (url) => {
    setExistingImages(existingImages.filter(img => img !== url));
    setImagesToDelete([...imagesToDelete, url]);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this product? This will remove all Cloudinary images too.')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (err) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('sku', sku);
    formData.append('price', price);
    formData.append('discountPercentage', discountPercentage || 0);
    formData.append('discountPrice', discountPrice || 0);
    formData.append('stock', stock);
    formData.append('material', material);
    formData.append('weight', weight);
    formData.append('category', category);
    formData.append('shortDescription', shortDescription);
    formData.append('description', description);
    formData.append('featured', featured);
    formData.append('bestSeller', bestSeller);
    formData.append('newArrival', newArrival);
    formData.append('video', video);
    formData.append('isCustom', isCustom);
    if (videoFile) {
      formData.append('videoFile', videoFile);
    }
    
    // Add file objects
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    if (editingId) {
      formData.append('replaceImages', replaceImages);
      // Append deleted images if modifying
      imagesToDelete.forEach(url => {
        formData.append('deleteImageUrls', url);
      });
    }

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created successfully!');
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      <div className="flex justify-between items-center border-b border-luxury-gold/10 pb-4">
        <h2 className="font-serif text-lg text-luxury-black font-semibold">Products Catalog</h2>
        {!showForm && (
          <button
            onClick={handleOpenCreate}
            className="bg-luxury-gold text-luxury-black px-4 py-3 uppercase tracking-widest font-semibold flex items-center gap-1"
          >
            <FiPlus /> Add Product
          </button>
        )}
      </div>

      {showForm ? (
        /* Add/Edit Product Form */
        <div className="bg-white p-6 border border-luxury-gold/20 max-w-4xl mx-auto shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-luxury-gold/10 pb-3">
            <h3 className="font-serif text-md text-luxury-black font-semibold">
              {editingId ? 'Edit Product' : 'Create New Product'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-luxury-black text-lg">
              <FiX />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side: General text info */}
            <div className="space-y-4">
              <div>
                <label className="block text-luxury-gray font-semibold mb-2">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-luxury-gray font-semibold mb-2">SKU Number</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-luxury-gray font-semibold mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none uppercase"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-luxury-gray font-semibold mb-2">Base Price (₦)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none text-slate-950 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-luxury-gray font-semibold mb-2">Discount (%)</label>
                  <input
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => handleDiscountPercentChange(e.target.value)}
                    className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none text-slate-950 font-medium"
                    placeholder="e.g. 15"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-luxury-gray font-semibold mb-2">Discount Price (₦)</label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => handleDiscountPriceChange(e.target.value)}
                    className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none text-slate-950 font-medium"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-luxury-gray font-semibold mb-2">Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-luxury-gray font-semibold mb-2">Material</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                    placeholder="Gold, Silver, Platinum"
                    required
                  />
                </div>
                <div>
                  <label className="block text-luxury-gray font-semibold mb-2">Weight</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                    placeholder="e.g. 5g"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6 border border-luxury-gold/20 p-3 bg-luxury-cream">
                <label className="flex items-center space-x-2 cursor-pointer font-semibold uppercase text-[10px]">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-luxury-gold" />
                  <span>Featured</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer font-semibold uppercase text-[10px]">
                  <input type="checkbox" checked={bestSeller} onChange={(e) => setBestSeller(e.target.checked)} className="accent-luxury-gold" />
                  <span>Best Seller</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer font-semibold uppercase text-[10px]">
                  <input type="checkbox" checked={newArrival} onChange={(e) => setNewArrival(e.target.checked)} className="accent-luxury-gold" />
                  <span>New Arrival</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer font-semibold uppercase text-[10px]">
                  <input type="checkbox" checked={isCustom} onChange={(e) => setIsCustom(e.target.checked)} className="accent-luxury-gold" />
                  <span>Custom Made</span>
                </label>
              </div>
            </div>

            {/* Right Side: Descriptions and Images uploads */}
            <div className="space-y-4">
              <div>
                <label className="block text-luxury-gray font-semibold mb-2">Short Description</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-luxury-gray font-semibold mb-2">Full Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none resize-none"
                  required
                ></textarea>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-luxury-gray font-semibold mb-2">Video URL (direct link or external player URL)</label>
                  <input
                    type="url"
                    value={video}
                    onChange={(e) => setVideo(e.target.value)}
                    className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none text-slate-900"
                    placeholder="e.g. https://youtube.com/watch?v=..."
                    disabled={videoFile !== null}
                  />
                </div>

                <div>
                  <label className="block text-luxury-gray font-semibold mb-2">Or Upload Direct Product Video (Max 25MB)</label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 25 * 1024 * 1024) {
                            toast.error('Video must be under 25MB');
                            return;
                          }
                          setVideoFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setVideoPreview(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-[10px] text-luxury-gray cursor-pointer"
                    />
                    
                    {videoPreview && (
                      <div className="relative h-14 w-20 border border-luxury-gold/20 bg-slate-50 flex items-center justify-center overflow-hidden">
                        <video src={videoPreview} controls={false} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 text-[8px] cursor-pointer"
                        >
                          <FiX />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Images uploads */}
              <div className="space-y-3">
                <label className="block text-luxury-gray font-semibold">Product Images (Cloudinary)</label>
                
                {/* Existing Images Row */}
                {existingImages.length > 0 && (
                  <div className="flex space-x-2 overflow-x-auto p-2 border border-luxury-gold/10 bg-luxury-cream">
                    {existingImages.map((url, idx) => (
                      <div key={idx} className="relative h-14 w-14 flex-shrink-0 border border-luxury-gold/20">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(url)}
                          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 text-[8px]"
                          aria-label="Remove image"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload inputs */}
                <div className="flex items-center justify-center border border-dashed border-luxury-gold/30 p-4 bg-luxury-cream relative">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    accept="image/*"
                  />
                  <div className="text-center space-y-1">
                    <FiUpload className="text-xl text-luxury-gold mx-auto" />
                    <p className="font-semibold text-luxury-black">Select Image Files</p>
                    <p className="text-[10px] text-luxury-gray">Selected: {selectedFiles.length} files</p>
                  </div>
                </div>

                {editingId && existingImages.length > 0 && (
                  <label className="flex items-center space-x-2 cursor-pointer text-[10px] uppercase font-semibold">
                    <input
                      type="checkbox"
                      checked={replaceImages}
                      onChange={(e) => setReplaceImages(e.target.checked)}
                      className="accent-luxury-gold"
                    />
                    <span className="text-red-700">Wipe and replace all existing images on submit</span>
                  </label>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="md:col-span-2 pt-4 border-t border-luxury-gold/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-luxury-black text-luxury-black px-6 py-3 uppercase tracking-widest font-semibold hover:border-luxury-gold hover:text-luxury-gold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-luxury-black text-white border border-luxury-gold px-8 py-3 uppercase tracking-widest font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-colors"
              >
                {submitting ? 'Processing files...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* List Products Table */
        <div className="bg-white p-6 border border-luxury-gold/25">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(n => <div key={n} className="h-14 skeleton"></div>)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-luxury-gold/20 text-luxury-gray font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Image</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((prod) => (
                      <tr key={prod._id} className="border-b border-luxury-gold/5 hover:bg-luxury-gold/5 transition-colors">
                        <td className="py-3 px-4">
                          <img
                            src={prod.images[0]}
                            alt=""
                            className="h-10 w-10 object-cover border border-luxury-gold/10"
                          />
                        </td>
                        <td className="py-3 px-4 font-serif text-sm text-luxury-black font-semibold truncate max-w-[200px]">
                          <div className="flex items-center gap-2">
                            <span>{prod.name}</span>
                            {prod.isCustom && (
                              <span className="text-[7px] bg-luxury-gold/20 text-luxury-gold px-1.5 py-0.5 border border-luxury-gold/30 uppercase font-bold tracking-wider rounded font-sans">
                                Custom
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono">{prod.sku}</td>
                        <td className="py-3 px-4 uppercase text-luxury-gray">{prod.category?.name || 'N/A'}</td>
                        <td className="py-3 px-4 font-semibold">{prod.stock}</td>
                        <td className="py-3 px-4 font-semibold text-luxury-gold">₦{prod.price.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center space-x-3 text-lg">
                            <button
                              onClick={() => handleOpenEdit(prod)}
                              className="text-blue-700 hover:text-blue-900"
                              aria-label="Edit product"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod._id)}
                              className="text-red-700 hover:text-red-900"
                              aria-label="Delete product"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-luxury-gray italic">
                        No products added yet. Add catalog items using the Add Product button above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
