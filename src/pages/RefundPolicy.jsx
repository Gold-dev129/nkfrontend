import React from 'react';
import { motion } from 'framer-motion';

const RefundPolicy = () => {
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
          Refund & Return Policy
        </motion.h1>
        <motion.div 
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-12 h-[1px] bg-luxury-gold mx-auto mt-4 origin-center"
        ></motion.div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-6 font-sans text-xs text-luxury-gray leading-relaxed space-y-12">
        <div className="bg-white p-8 md:p-12 border border-luxury-gold/15 space-y-6">
          <div className="space-y-4">
            <h2 className="font-serif text-lg text-luxury-black uppercase tracking-wider border-b border-luxury-gold/10 pb-2">Refund Policy</h2>
            <p>At NKY Luxury, every piece is carefully inspected and quality-checked before dispatch.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>We do not offer refunds for change of mind or incorrect purchases.</li>
              <li>If you receive an incorrect, damaged, or defective item, please contact us within <strong>24 hours</strong> of delivery with your order number and clear photos of the item.</li>
              <li>Where a refund is approved, it will be processed using the original payment method.</li>
            </ul>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="font-serif text-lg text-luxury-black uppercase tracking-wider border-b border-luxury-gold/10 pb-2">Return & Exchange Policy</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Returns or exchanges are accepted within <strong>7 days</strong> of delivery for eligible items.</li>
              <li>Items must be unworn, unused, and returned in their original packaging, including all accompanying materials.</li>
              <li>Custom-made, bespoke, engraved, resized, or personalised jewellery cannot be returned or exchanged, except in cases of verified manufacturing defects or if an incorrect item was supplied.</li>
              <li>Customers are responsible for return shipping costs unless the return is due to our error or a verified manufacturing defect.</li>
              <li>All returned items will be inspected upon receipt before an exchange or refund is approved.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RefundPolicy;
