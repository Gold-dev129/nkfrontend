import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus } from 'react-icons/fi';

const FAQ = () => {
  const faqs = [
    {
      question: "Why Choose NKY Luxury?",
      answer: "At NKY Luxury, we are committed to exceptional craftsmanship, authentic materials, and timeless elegance. From bespoke creations to ready-to-wear collections, every piece is thoughtfully curated or handcrafted to the highest standards, giving you luxury you can wear with confidence."
    },
    {
      question: "What Does NKY Luxury Sell?",
      answer: "NKY Luxury offers moissanite, lab-grown diamonds, natural diamonds, fine gold jewellery, bespoke jewellery, luxury jewellery sets, fashion jewellery, statement jewellery, luxury watches, handbags, and elegant accessories. Whether you're looking for an everyday essential or a statement piece, we have something for every occasion."
    },
    {
      question: "Does NKY Luxury Create Bespoke Jewellery?",
      answer: "Yes. We specialise in bespoke jewellery, creating one-of-a-kind engagement rings, wedding bands, necklaces, earrings, bracelets, pendants, and other custom pieces tailored to your vision. Every bespoke creation is designed to reflect your unique style and story."
    },
    {
      question: "Are Your Diamonds Certified?",
      answer: "Yes. Our natural and lab-grown diamonds are available with internationally recognised certifications, including IGI, where applicable. We are committed to authenticity, transparency, and exceptional quality."
    },
    {
      question: "Can I Customise My Jewellery?",
      answer: "Absolutely. You can personalise your jewellery by choosing your preferred metal, gemstone, diamond size, setting, engraving, and overall design. We work closely with you to create a piece that is uniquely yours."
    },
    {
      question: "Do You Deliver Worldwide?",
      answer: "Yes. We offer secure delivery across Nigeria and internationally. Every order is carefully packaged to ensure it arrives safely and beautifully presented."
    },
    {
      question: "How Can I Contact NKY Luxury?",
      answer: "We're always happy to assist you.\n\nInstagram: @nkyl_\nWhatsApp: +234 705 153 0996\n\nOur team is available to answer your questions, assist with bespoke orders, and help you find the perfect piece."
    }
  ];

  const [openIndexes, setOpenIndexes] = useState({});

  const toggleFAQ = (index) => {
    setOpenIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

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
          Customer Service
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="font-serif text-3xl md:text-5xl mt-3"
        >
          Frequently Asked Questions
        </motion.h1>
        <motion.div 
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-12 h-[1px] bg-luxury-gold mx-auto mt-4 origin-center"
        ></motion.div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-6">
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = !!openIndexes[index];
            return (
              <div 
                key={index} 
                className="bg-white border border-luxury-gold/15 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                >
                  <span className="font-serif text-sm text-luxury-black font-semibold uppercase tracking-wider">{faq.question}</span>
                  {isOpen ? (
                    <FiMinus className="text-luxury-gold text-base flex-shrink-0 ml-4" />
                  ) : (
                    <FiPlus className="text-luxury-gold text-base flex-shrink-0 ml-4" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-2 border-t border-slate-50 font-sans text-xs text-luxury-gray leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default FAQ;
