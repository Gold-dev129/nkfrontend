import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiPhone, FiMail, FiMapPin, FiInstagram, FiMessageSquare } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Contact = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setContactInfo(response.data.settings?.contactInfo);
      } catch (err) {
        console.error('Error fetching contact info:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post('/settings/contact', formData);
      toast.success(response.data.message || 'Your inquiry has been sent successfully!');
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fallbackContact = {
    phone: '+234 7051530996',
    instagram: 'nkylux_'
  };

  const activeContact = contactInfo || fallbackContact;

  const displayPhone = activeContact.phone && activeContact.phone !== '+234 800 000 0000' 
    ? activeContact.phone 
    : '+234 7051530996';

  const displayInstagram = activeContact.instagram && activeContact.instagram !== 'nkyluxury' 
    ? activeContact.instagram 
    : 'nkylux_';

  return (
    <div className="pb-20 space-y-16">
      {/* Header Banner */}
      <section className="bg-luxury-black text-luxury-white py-16 text-center border-b border-luxury-gold/20 overflow-hidden">
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-luxury-gold uppercase tracking-luxury text-xs font-semibold"
        >
          Private Client Services
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="font-serif text-3xl md:text-5xl mt-3"
        >
          Contact NKYLUXURY
        </motion.h1>
        <motion.div 
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-12 h-[1px] bg-luxury-gold mx-auto mt-4 origin-center"
        ></motion.div>
      </section>

      {/* Main Sections */}
      <section className="max-w-2xl mx-auto px-6">
        <div className="bg-white p-8 md:p-12 border border-luxury-gold/20 text-center space-y-8 shadow-sm">
          <h2 className="font-serif text-xl text-luxury-black uppercase tracking-wider">Private Consultations</h2>
          <p className="font-sans text-xs text-luxury-gray leading-relaxed max-w-md mx-auto">
            NKYLUXURY offers exclusive bespoke jewelry consultations. Speak to our concierge online to arrange virtual viewings or custom orders.
          </p>

          <div className="grid grid-cols-1 gap-6 pt-4 font-sans text-xs text-left max-w-md mx-auto">
            <div className="flex items-start space-x-4 border-b border-luxury-gold/10 pb-4">
              <FiPhone className="text-luxury-gold text-lg mt-1 flex-shrink-0" />
              <div>
                <span className="text-luxury-gray uppercase block font-semibold text-[9px] tracking-wider mb-0.5">Concierge Phone</span>
                <a href={`tel:${displayPhone.replace(/\s+/g, '')}`} className="text-luxury-black font-medium text-sm hover:text-luxury-gold transition-colors">
                  {displayPhone}
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4 border-b border-luxury-gold/10 pb-4">
              <FiInstagram className="text-luxury-gold text-lg mt-1 flex-shrink-0" />
              <div>
                <span className="text-luxury-gray uppercase block font-semibold text-[9px] tracking-wider mb-0.5">Instagram Portfolio</span>
                <a 
                  href={`https://instagram.com/${displayInstagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-luxury-black font-medium text-sm hover:text-luxury-gold transition-colors"
                >
                  @{displayInstagram}
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <a
              href="https://wa.me/2347051530996?text=Hello%20NKYLUXURY%20Concierge%2C%20I%20would%20like%20to%20inquire%20about%20your%20jewelry%20collections."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-luxury-black text-white border border-luxury-gold py-4 uppercase tracking-widest font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer text-center text-xs"
            >
              <FiMessageSquare />
              <span>Chat via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
