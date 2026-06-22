import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiX, FiUpload } from 'react-icons/fi';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setSelectedFile(null);
    setPreviewUrl('');
    setShowForm(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setSelectedFile(null);
    setPreviewUrl(cat.image || '');
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Delete this category? Products belonging to this category will not be deleted but they will have their category reference cleared.')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (err) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Category created successfully');
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      <div className="flex justify-between items-center border-b border-luxury-gold/10 pb-4">
        <h2 className="font-serif text-lg text-luxury-black font-semibold">Categories Showcase</h2>
        {!showForm && (
          <button
            onClick={handleOpenCreate}
            className="bg-luxury-gold text-luxury-black px-4 py-3 uppercase tracking-widest font-semibold flex items-center gap-1"
          >
            <FiPlus /> Add Category
          </button>
        )}
      </div>

      {showForm ? (
        /* Create/Edit Category Form */
        <div className="bg-white p-6 border border-luxury-gold/20 max-w-lg mx-auto shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-luxury-gold/10 pb-3">
            <h3 className="font-serif text-md text-luxury-black font-semibold">
              {editingId ? 'Edit Category' : 'Create New Category'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-luxury-black text-lg">
              <FiX />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-luxury-gray font-semibold mb-2">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-luxury-gray font-semibold mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none resize-none"
              ></textarea>
            </div>

            {/* Banner/Showcase image file */}
            <div className="space-y-3">
              <label className="block text-luxury-gray font-semibold">Showcase Banner Image</label>
              
              {previewUrl && (
                <div className="h-32 w-full overflow-hidden border border-luxury-gold/20 bg-luxury-cream">
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
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
                  <p className="font-semibold text-luxury-black">Select Banner File</p>
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
                {submitting ? 'Uploading file...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Categories Table list */
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
                    <th className="py-3 px-4">Banner</th>
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <tr key={cat._id} className="border-b border-luxury-gold/5 hover:bg-luxury-gold/5 transition-colors">
                        <td className="py-3 px-4">
                          {cat.image ? (
                            <img src={cat.image} alt="" className="h-10 w-16 object-cover border border-luxury-gold/10" />
                          ) : (
                            <span className="text-luxury-gray italic">No banner</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-serif text-sm text-luxury-black font-semibold uppercase">
                          {cat.name}
                        </td>
                        <td className="py-3 px-4 font-mono">{cat.slug}</td>
                        <td className="py-3 px-4 max-w-[200px] truncate">{cat.description || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center space-x-3 text-lg">
                            <button
                              onClick={() => handleOpenEdit(cat)}
                              className="text-blue-700 hover:text-blue-900"
                              aria-label="Edit category"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat._id)}
                              className="text-red-700 hover:text-red-900"
                              aria-label="Delete category"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-luxury-gray italic">
                        No categories found. Add categories to structure products.
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

export default AdminCategories;
