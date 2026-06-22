import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion } from 'framer-motion';

const About = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/settings');
        setContent(response.data.settings?.aboutPageContent);
      } catch (err) {
        console.error('Error loading settings info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const fallbackContent = {
    heroTitle: 'Crafting Elegance',
    heroSubtitle: 'Our Story & Legacy',
    story: 'Founded with a passion for luxury and fine craftsmanship, NKYLUXURY specializes in high-end bespoke jewelry, custom designs, and premium watches. We believe that fine jewelry is more than an accessory - it is a tangible expression of legacy, memory, and personal history.',
    mission: 'To define luxury and prestige in African craftsmanship, utilizing certified precious metals and conflict-free gemstones to deliver uncompromising quality.',
    vision: 'To be the ultimate global luxury brand representing African excellence and state-of-the-art designs.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80'
  };

  const activeContent = content || fallbackContent;

  return (
    <div className="pb-20 space-y-16">
      {/* Hero Banner */}
      <section className="relative h-[45vh] bg-luxury-black flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <motion.img
          initial={{ scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          src={activeContent.image || fallbackContent.image}
          alt="Luxury Jewelry Banner"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="relative z-20 text-luxury-white px-4">
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-luxury-gold uppercase tracking-luxury text-xs font-semibold"
          >
            {activeContent.heroSubtitle}
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="font-serif text-3xl md:text-5xl mt-3"
          >
            {activeContent.heroTitle}
          </motion.h1>
        </div>
      </section>

      {/* Main Narrative */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-10">
          <div className="space-y-6">
            <h2 className="font-serif text-2xl text-luxury-black text-center">The Legacy</h2>
            <div className="w-12 h-[1px] bg-luxury-gold mx-auto"></div>
            <p className="font-sans text-sm text-luxury-gray leading-relaxed text-center whitespace-pre-line max-w-2xl mx-auto">
              {activeContent.story}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="bg-luxury-black text-luxury-white py-16">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-luxury-gold uppercase tracking-wider">Our Mission</h3>
            <p className="font-sans text-xs text-luxury-gray leading-relaxed">
              {activeContent.mission}
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-luxury-gold uppercase tracking-wider">Our Vision</h3>
            <p className="font-sans text-xs text-luxury-gray leading-relaxed">
              {activeContent.vision}
            </p>
          </div>
        </div>
      </section>

      {/* Process / Craftsmanship Detail */}
      <section className="max-w-5xl mx-auto px-6">
        <h2 className="font-serif text-2xl text-luxury-black text-center mb-12">Uncompromising Standards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 border border-luxury-gold/20">
            <h4 className="font-serif text-md text-luxury-black font-semibold mb-3">1. Sketching & CAD</h4>
            <p className="font-sans text-xs text-luxury-gray leading-relaxed">
              Every custom design starts with hand-drawn sketches and detailed 3D CAD modeling to review exact dimensions.
            </p>
          </div>
          <div className="p-6 border border-luxury-gold/20">
            <h4 className="font-serif text-md text-luxury-black font-semibold mb-3">2. Diamond Sourcing</h4>
            <p className="font-sans text-xs text-luxury-gray leading-relaxed">
              We hand-select only certified VS/VVS clarity diamonds, conflict-free, ensuring brilliant fire and sparkle.
            </p>
          </div>
          <div className="p-6 border border-luxury-gold/20">
            <h4 className="font-serif text-md text-luxury-black font-semibold mb-3">3. Hand Polishing</h4>
            <p className="font-sans text-xs text-luxury-gray leading-relaxed">
              Our gold jewelry undergoes detailed hand polishing to achieve the signature NKYLUXURY brilliant mirror shine.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
