import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiX, FiUpload } from 'react-icons/fi';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [link, setLink] = useState('');
  const [position, setPosition] = useState('hero');
  const [order, setOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await api.get('/banners/admin');
      setBanners(response.data.banners);
    } catch (err) {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setLink('/shop');
    setPosition('hero');
    setOrder('0');
    setIsActive(true);
    setSelectedFile(null);
    setPreviewUrl('');
    setShowForm(true);
  };

  const handleOpenEdit = (ban) => {
    setEditingId(ban._id);
    setTitle(ban.title);
    setSubtitle(ban.subtitle || '');
    setLink(ban.link || '');
    setPosition(ban.position || 'hero');
    setOrder(ban.order.toString());
    setIsActive(ban.isActive);
    setSelectedFile(null);
    setPreviewUrl(ban.image);
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this banner?')) {
      try {
        await api.delete(`/banners/${id}`);
        toast.success('Banner deleted successfully');
        fetchBanners();
      } catch (err) {
        toast.error('Failed to delete banner');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('link', link);
    formData.append('position', position);
    formData.append('order', order);
    formData.append('isActive', isActive);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      if (editingId) {
        await api.put(`/banners/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Banner updated successfully');
      } else {
        await api.post('/banners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Banner created successfully');
      }
      setShowForm(false);
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing banner');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      <div className="flex justify-between items-center border-b border-luxury-gold/10 pb-4">
        <h2 className="font-serif text-lg text-luxury-black font-semibold">Banner Settings</h2>
        {!showForm && (
          <button
            onClick={handleOpenCreate}
            className="bg-luxury-gold text-luxury-black px-4 py-3 uppercase tracking-widest font-semibold flex items-center gap-1"
          >
            <FiPlus /> Create Banner
          </button>
        )}
      </div>

      {showForm ? (
        /* Create/Edit Form */
        <div className="bg-white p-6 border border-luxury-gold/20 max-w-lg mx-auto shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-luxury-gold/10 pb-3">
            <h3 className="font-serif text-md text-luxury-black font-semibold">
              {editingId ? 'Edit Banner' : 'Create Banner'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-luxury-black text-lg">
              <FiX />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-luxury-gray font-semibold mb-2">Banner Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-luxury-gray font-semibold mb-2">Subtitle / Slogan</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-luxury-gray font-semibold mb-2">Redirect Link Path</label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                  placeholder="e.g. /shop"
                />
              </div>
              <div>
                <label className="block text-luxury-gray font-semibold mb-2">Display Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none uppercase"
                >
                  <option value="hero">Hero Banners</option>
                  <option value="promotional">Promotions</option>
                  <option value="middle">Middle Layouts</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-luxury-gray font-semibold mb-2">Display Order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-luxury-gold"
                  id="isActive"
                />
                <label htmlFor="isActive" className="font-semibold uppercase tracking-wider cursor-pointer">
                  Activate Banner
                </label>
              </div>
            </div>

            {/* Banner image selector */}
            <div className="space-y-3">
              <label className="block text-luxury-gray font-semibold">Banner Background Image</label>
              
              {previewUrl && (
                <div className="h-36 w-full overflow-hidden border border-luxury-gold/20 bg-luxury-cream">
                  <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                </div>
              )}

              <div className="flex items-center justify-center border border-dashed border-luxury-gold/30 p-4 bg-luxury-cream relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  accept="image/*"
                />
                <div className="text-center space-y-1">
                  <FiUpload className="text-xl text-luxury-gold mx-auto" />
                  <p className="font-semibold text-luxury-black">Select Image File</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-luxury-gold/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-luxury-black text-luxury-black px-4 py-2 uppercase tracking-widest font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-luxury-black text-white border border-luxury-gold px-6 py-2 uppercase tracking-widest font-semibold"
              >
                {submitting ? 'Processing file...' : 'Save Banner'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Banners Table list */
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
                    <th className="py-3 px-4">Image</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Subtitle</th>
                    <th className="py-3 px-4">Position</th>
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4 text-center">Active</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.length > 0 ? (
                    banners.map((ban) => (
                      <tr key={ban._id} className="border-b border-luxury-gold/5 hover:bg-luxury-gold/5 transition-colors">
                        <td className="py-3 px-4">
                          <img src={ban.image} alt="" className="h-10 w-16 object-cover border border-luxury-gold/10" />
                        </td>
                        <td className="py-3 px-4 font-serif text-sm font-semibold text-luxury-black uppercase">{ban.title}</td>
                        <td className="py-3 px-4 truncate max-w-[150px]">{ban.subtitle || '-'}</td>
                        <td className="py-3 px-4 uppercase text-luxury-gold font-bold">{ban.position}</td>
                        <td className="py-3 px-4 font-semibold">{ban.order}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 font-bold uppercase text-[9px] rounded ${
                            ban.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {ban.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center space-x-3 text-lg">
                            <button
                              onClick={() => handleOpenEdit(ban)}
                              className="text-blue-700 hover:text-blue-900"
                              aria-label="Edit banner"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteBanner(ban._id)}
                              className="text-red-700 hover:text-red-900"
                              aria-label="Delete banner"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-luxury-gray italic">No banners configured.</td>
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

export default AdminBanners;
