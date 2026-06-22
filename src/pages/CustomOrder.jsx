import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiCheckCircle, FiChevronRight, FiAward, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';

const CustomOrder = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    material: '18K Yellow Gold',
    diamondSpecs: 'VVS1/VVS2 Brilliant Cut',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const materials = [
    '18K Yellow Gold',
    '18K White Gold',
    '24K Solid Gold',
    'Platinum',
    'Sterling Silver',
    'Other'
  ];

  const diamondSpecsList = [
    'VVS1/VVS2 Brilliant Cut',
    'VS1/VS2 Fine Quality',
    'SI1/SI2 Commercial',
    'No Diamonds / Gemstones Only',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('phoneNumber', formData.phoneNumber);
    submitData.append('material', formData.material);
    submitData.append('diamondSpecs', formData.diamondSpecs);
    submitData.append('description', formData.description);
    if (imageFile) {
      submitData.append('referenceImage', imageFile);
    }

    try {
      const response = await api.post('/custom-inquiries', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSubmittedData(response.data.inquiry);
      setIsSuccess(true);
      toast.success(response.data.message || 'Bespoke inquiry submitted successfully!');
    } catch (err) {
      console.error('Error submitting custom inquiry:', err);
      toast.error(err.response?.data?.message || 'Failed to submit custom inquiry. Please check all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      material: '18K Yellow Gold',
      diamondSpecs: 'VVS1/VVS2 Brilliant Cut',
      description: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setIsSuccess(false);
    setSubmittedData(null);
  };

  return (
    <div className="pb-20 space-y-12">
      {/* Header Banner */}
      <section className="bg-luxury-black text-luxury-white py-16 text-center border-b border-luxury-gold/20 overflow-hidden">
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-luxury-gold uppercase tracking-luxury text-xs font-semibold"
        >
          Bespoke Design Studio
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="font-serif text-3xl md:text-5xl mt-3 font-medium text-white"
        >
          Custom Jewelry Request
        </motion.h1>
        <motion.div 
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-16 h-[1px] bg-luxury-gold mx-auto mt-5 origin-center"
        ></motion.div>
      </section>

      {/* Main Grid */}
      <div className="max-w-4xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-luxury-gold/15 p-8 md:p-12 shadow-md relative overflow-hidden"
            >
              {/* Decorative Corner Borders */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-luxury-gold/30"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-luxury-gold/30"></div>

              <div className="mb-8 space-y-2 text-center md:text-left">
                <h2 className="font-serif text-2xl text-luxury-black font-semibold flex items-center justify-center md:justify-start gap-2">
                  <FiAward className="text-luxury-gold" /> Craft Your Masterpiece
                </h2>
                <p className="font-sans text-xs text-luxury-gray leading-relaxed">
                  Provide your dimensions, metal grades, and diamond specifications below. Our artisans and master designers will render and handcraft your piece to perfection.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8 text-xs font-sans">
                {/* Contact Info Group */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-luxury-gray uppercase tracking-wider font-semibold">Your Full Name *</label>
                    <input 
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Adenike Ajani"
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-none focus:outline-none focus:border-luxury-gold transition-colors font-sans text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-luxury-gray uppercase tracking-wider font-semibold">Email Address *</label>
                    <input 
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. client@example.com"
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-none focus:outline-none focus:border-luxury-gold transition-colors font-sans text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-luxury-gray uppercase tracking-wider font-semibold">Phone Number *</label>
                    <input 
                      type="tel"
                      name="phoneNumber"
                      required
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. +234 7051530996"
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-none focus:outline-none focus:border-luxury-gold transition-colors font-sans text-xs"
                    />
                  </div>
                </div>

                {/* Specs Selection Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="block text-luxury-gray uppercase tracking-wider font-semibold">Metal / Material Base *</label>
                    <select
                      name="material"
                      value={formData.material}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-none focus:outline-none focus:border-luxury-gold transition-colors font-sans text-xs cursor-pointer"
                    >
                      {materials.map((mat) => (
                        <option key={mat} value={mat}>{mat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-luxury-gray uppercase tracking-wider font-semibold">Diamond Cut & Clarity *</label>
                    <select
                      name="diamondSpecs"
                      value={formData.diamondSpecs}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-none focus:outline-none focus:border-luxury-gold transition-colors font-sans text-xs cursor-pointer"
                    >
                      {diamondSpecsList.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description Textarea */}
                <div className="space-y-2">
                  <label className="block text-luxury-gray uppercase tracking-wider font-semibold">Design Instructions & Description *</label>
                  <textarea
                    name="description"
                    required
                    rows="5"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your design specifications (e.g. Ring size 7, band engraving 'Always & Forever', micro-pave setting detail, solitaire emerald cut, custom crown bezel...)"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-none focus:outline-none focus:border-luxury-gold transition-colors font-sans text-xs leading-relaxed resize-y"
                  ></textarea>
                </div>

                {/* Image Upload Area */}
                <div className="space-y-2">
                  <label className="block text-luxury-gray uppercase tracking-wider font-semibold">Design Sketch or Reference Image (Optional)</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 border-2 border-dashed border-slate-200 hover:border-luxury-gold/40 transition-colors p-6 flex flex-col items-center justify-center text-center relative cursor-pointer min-h-[160px]">
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <FiUploadCloud className="text-3xl text-luxury-gold/60 mb-2" />
                      <span className="font-semibold block text-luxury-black mb-1">Click or Drag Image File</span>
                      <span className="text-[10px] text-luxury-gray">JPG, PNG or WEBP (Max 5MB)</span>
                    </div>

                    <div className="border border-slate-200 p-3 flex items-center justify-center bg-slate-50 relative min-h-[160px]">
                      {imagePreview ? (
                        <div className="w-full h-full flex flex-col items-center justify-between">
                          <img 
                            src={imagePreview} 
                            alt="Reference Preview" 
                            className="max-h-[120px] max-w-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                            className="text-[10px] uppercase font-bold text-red-600 hover:text-red-800 transition-colors cursor-pointer mt-1"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <span className="text-luxury-gray/50 text-[10px] uppercase tracking-wider font-medium text-center">No reference uploaded</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-luxury-gray">
                    <FiMessageSquare className="text-luxury-gold" />
                    <span>Our private concierge will contact you on WhatsApp/Email</span>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full md:w-auto min-w-[200px] bg-luxury-black text-white border border-luxury-gold py-4 px-8 uppercase tracking-widest font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300 disabled:bg-slate-300 disabled:border-slate-300 disabled:text-slate-500 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Submitting Design...' : 'Submit Bespoke Inquiry'}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-white border border-luxury-gold p-8 md:p-12 text-center shadow-xl space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-luxury-gold"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-luxury-gold"></div>

              <div className="flex justify-center">
                <FiCheckCircle className="text-5xl text-luxury-gold animate-bounce" />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif text-2xl md:text-3xl text-luxury-black font-semibold uppercase tracking-wide">Inquiry Received</h2>
                <p className="font-sans text-xs text-luxury-gray max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-bold text-luxury-black">{submittedData?.name}</span>. Your request has been successfully submitted to NKYLUXURY Private Concierge.
                </p>
              </div>

              {/* Inquiry details summary */}
              <div className="max-w-md mx-auto bg-slate-50 border border-slate-100 p-6 text-left space-y-3 font-sans text-xs text-slate-800">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="font-semibold text-luxury-gray uppercase tracking-wider text-[9px]">Material choice:</span>
                  <span className="font-bold text-luxury-black">{submittedData?.material}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="font-semibold text-luxury-gray uppercase tracking-wider text-[9px]">Diamond selection:</span>
                  <span className="font-bold text-luxury-black">{submittedData?.diamondSpecs}</span>
                </div>
                {submittedData?.referenceImage && (
                  <div className="flex justify-between border-b border-slate-200 pb-2 items-center">
                    <span className="font-semibold text-luxury-gray uppercase tracking-wider text-[9px]">Sketch Reference:</span>
                    <a 
                      href={submittedData.referenceImage} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-bold text-luxury-gold underline hover:text-luxury-black text-[10px]"
                    >
                      View uploaded sketch
                    </a>
                  </div>
                )}
                <div className="space-y-1">
                  <span className="font-semibold text-luxury-gray uppercase tracking-wider text-[9px]">Bespoke Details:</span>
                  <p className="italic text-slate-600 bg-white p-3 border border-slate-100 leading-relaxed font-serif text-[10px]">
                    "{submittedData?.description}"
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-col md:flex-row gap-4 justify-center items-center">
                <button
                  onClick={resetForm}
                  className="bg-transparent border border-luxury-black text-luxury-black hover:bg-luxury-black hover:text-white py-3.5 px-6 uppercase tracking-widest font-semibold text-[10px] transition-all cursor-pointer min-w-[180px]"
                >
                  Submit Another
                </button>
                <a
                  href={`https://wa.me/2347051530996?text=${encodeURIComponent(
                    `Hello NKYLUXURY Private Concierge, I just submitted a bespoke jewelry request under the name ${submittedData?.name || ''}. I'd like to discuss the design details.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-luxury-black text-white border border-luxury-gold hover:bg-luxury-gold hover:text-luxury-black py-3.5 px-6 uppercase tracking-widest font-semibold text-[10px] transition-all cursor-pointer min-w-[180px] flex items-center justify-center gap-1.5"
                >
                  <FiMessageSquare />
                  <span>Discuss on WhatsApp</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CustomOrder;
