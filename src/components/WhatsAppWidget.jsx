import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX } from 'react-icons/fi';

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppRedirect = () => {
    const phoneNumber = '2347051530996';
    const message = 'Hello NKYLUXURY Private Concierge, I would like to inquire about fine jewelry designs and custom pieces.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans text-xs flex flex-col items-end">
      {/* Interactive Tooltip Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 w-72 bg-white border border-luxury-gold/25 p-5 shadow-2xl rounded-none relative text-left"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-luxury-gray hover:text-luxury-black text-sm cursor-pointer"
              aria-label="Close tooltip"
            >
              <FiX />
            </button>

            {/* Header */}
            <div className="space-y-1 pb-3 border-b border-luxury-gold/10">
              <span className="text-luxury-gold uppercase tracking-luxury text-[8px] font-semibold block">NKYLUXURY Concierge</span>
              <h4 className="font-serif text-sm text-luxury-black font-bold uppercase tracking-wide">Private Consultation</h4>
            </div>

            {/* Body */}
            <div className="py-3 text-luxury-gray leading-relaxed text-[11px]">
              Hello! We are here to assist you with custom orders, size guides, and private curations. Let's discuss your perfect jewelry design.
            </div>

            {/* CTA Button */}
            <button
              onClick={handleWhatsAppRedirect}
              className="w-full bg-luxury-black text-white border border-luxury-gold py-3 uppercase tracking-widest font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all cursor-pointer text-[9px] flex items-center justify-center gap-1.5"
            >
              <FiMessageSquare />
              <span>Start Discussion</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button Trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-12 w-12 bg-luxury-black text-luxury-gold border border-luxury-gold rounded-full shadow-2xl flex items-center justify-center text-xl cursor-pointer relative group hover:border-white transition-all duration-300"
        aria-label="Open private consultation"
      >
        <span className="absolute right-14 bg-luxury-black text-white text-[9px] font-semibold px-2.5 py-1.5 uppercase tracking-widest border border-luxury-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          Private Client Services
        </span>
        <FiMessageSquare className={isOpen ? 'rotate-90 transition-transform duration-300' : 'transition-transform duration-300'} />
      </motion.button>
    </div>
  );
};

export default WhatsAppWidget;
