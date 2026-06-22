import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiSearch, FiEye, FiCheck, FiRefreshCw, FiExternalLink, FiMail } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminCustomInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/custom-inquiries');
      setInquiries(response.data.inquiries || []);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
      toast.error('Failed to load custom bespoke inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'responded' : 'pending';
    try {
      const response = await api.put(`/custom-inquiries/${id}/status`, { status: nextStatus });
      toast.success(response.data.message || 'Status updated successfully');
      setInquiries(inquiries.map(item => 
        item._id === id ? { ...item, status: response.data.inquiry.status } : item
      ));
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: response.data.inquiry.status });
      }
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Filters
  const filteredInquiries = inquiries.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phoneNumber.includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Header section */}
      <div className="border-b border-luxury-gold/10 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg text-luxury-black font-semibold">Custom Bespoke Inquiries</h2>
          <p className="text-[10px] text-luxury-gray">Manage and respond to personalized design specifications and custom orders.</p>
        </div>
        <button
          onClick={fetchInquiries}
          className="self-start md:self-auto bg-slate-50 border border-slate-200 hover:border-luxury-gold/50 p-2.5 hover:bg-white text-luxury-black transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider font-semibold text-[9px]"
        >
          <FiRefreshCw /> Refresh List
        </button>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative font-sans text-xs w-full md:max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH BY CLIENT NAME, EMAIL, PHONE, OR DESCRIPTION..."
            className="w-full bg-white border border-luxury-gold/20 pl-4 pr-10 py-3 uppercase tracking-wider focus:outline-none focus:border-luxury-gold"
          />
          <span className="absolute right-3 top-3 text-luxury-gray text-lg">
            <FiSearch />
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-slate-100 border border-slate-200 p-1 w-full md:w-auto">
          {['all', 'pending', 'responded'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`flex-grow md:flex-grow-0 px-4 py-2 uppercase font-bold text-[9px] tracking-wider transition-colors cursor-pointer ${
                statusFilter === filter
                  ? 'bg-luxury-black text-white'
                  : 'text-luxury-gray hover:text-luxury-black hover:bg-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table/List area */}
        <div className="lg:col-span-2 bg-white p-6 border border-luxury-gold/25">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(n => <div key={n} className="h-16 bg-slate-50 border border-slate-100 animate-pulse"></div>)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-luxury-gold/20 text-luxury-gray font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Specifications</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.length > 0 ? (
                    filteredInquiries.map((item) => (
                      <tr 
                        key={item._id} 
                        className={`border-b border-luxury-gold/5 hover:bg-luxury-gold/5 transition-colors cursor-pointer ${
                          selectedInquiry?._id === item._id ? 'bg-luxury-gold/10' : ''
                        }`}
                        onClick={() => setSelectedInquiry(item)}
                      >
                        <td className="py-3 px-4">
                          <p className="font-semibold text-luxury-black">{item.name}</p>
                          <p className="text-[9px] text-luxury-gray">{item.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-luxury-black">{item.material}</p>
                          <p className="text-[9px] text-luxury-gray">{item.diamondSpecs}</p>
                        </td>
                        <td className="py-3 px-4 text-[10px] whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 font-bold uppercase text-[8px] border ${
                            item.status === 'responded'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedInquiry(item)}
                              className="text-luxury-black hover:text-luxury-gold text-base p-1"
                              title="View details"
                            >
                              <FiEye />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(item._id, item.status)}
                              className={`p-1 text-base ${
                                item.status === 'responded' 
                                  ? 'text-yellow-600 hover:text-yellow-800' 
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                              title={item.status === 'responded' ? 'Mark as Pending' : 'Mark as Responded'}
                            >
                              <FiCheck />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-luxury-gray italic">No inquiries found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected inquiry detail card */}
        <div className="bg-slate-50 border border-luxury-gold/20 p-6 flex flex-col justify-between min-h-[400px]">
          <AnimatePresence mode="wait">
            {selectedInquiry ? (
              <motion.div
                key={selectedInquiry._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 flex-grow flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Title */}
                  <div className="border-b border-luxury-gold/20 pb-3 flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-sm text-luxury-black font-bold uppercase tracking-wider">Inquiry Details</h3>
                      <span className="text-[9px] text-luxury-gray">ID: {selectedInquiry._id}</span>
                    </div>
                    <span className={`px-2 py-0.5 font-bold uppercase text-[8px] border ${
                      selectedInquiry.status === 'responded'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {selectedInquiry.status}
                    </span>
                  </div>

                  {/* Client Info */}
                  <div className="space-y-2">
                    <p className="text-[9px] uppercase tracking-wider font-semibold text-luxury-gray">Client Information</p>
                    <div className="bg-white p-3 border border-slate-100 space-y-1">
                      <p className="font-bold text-luxury-black">{selectedInquiry.name}</p>
                      <p className="text-luxury-gray">{selectedInquiry.email}</p>
                      <p className="font-mono">{selectedInquiry.phoneNumber}</p>
                    </div>
                  </div>

                  {/* Design specifications */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-luxury-gray block">Metal / Base</span>
                      <span className="font-bold text-luxury-black block bg-white p-2 border border-slate-100">{selectedInquiry.material}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-luxury-gray block">Gemstones</span>
                      <span className="font-bold text-luxury-black block bg-white p-2 border border-slate-100 text-ellipsis overflow-hidden whitespace-nowrap" title={selectedInquiry.diamondSpecs}>
                        {selectedInquiry.diamondSpecs}
                      </span>
                    </div>
                  </div>

                  {/* Reference sketch */}
                  {selectedInquiry.referenceImage && (
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-luxury-gray block">Reference sketch</span>
                      <div className="bg-white p-2 border border-slate-100 flex flex-col items-center gap-2">
                        <img 
                          src={selectedInquiry.referenceImage} 
                          alt="Bespoke Reference" 
                          className="max-h-[140px] w-full object-contain bg-slate-50 p-1"
                        />
                        <a 
                          href={selectedInquiry.referenceImage} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[9px] text-luxury-gold uppercase font-bold tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <FiExternalLink /> Open Full Image
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Reference video */}
                  {selectedInquiry.referenceVideo && (
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-luxury-gray block">Reference Video / Render</span>
                      <div className="bg-white p-2 border border-slate-100 flex flex-col items-center gap-2">
                        <video 
                          src={selectedInquiry.referenceVideo} 
                          controls
                          className="max-h-[140px] w-full object-contain bg-slate-50 p-1"
                        />
                        <a 
                          href={selectedInquiry.referenceVideo} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[9px] text-luxury-gold uppercase font-bold tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <FiExternalLink /> Open Full Video
                        </a>
                      </div>
                    </div>
                  )}

                  {!selectedInquiry.referenceImage && !selectedInquiry.referenceVideo && (
                    <div className="bg-slate-100 p-3 text-center border border-dashed border-slate-200 text-luxury-gray italic">
                      No design sketch or video references uploaded.
                    </div>
                  )}

                  {/* Description / Instructions */}
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-luxury-gray block">Bespoke instructions</span>
                    <div className="bg-white p-3 border border-slate-100 font-serif leading-relaxed text-[11px] max-h-[120px] overflow-y-auto whitespace-pre-line text-slate-800">
                      "{selectedInquiry.description}"
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-luxury-gold/10 flex flex-col gap-2">
                  <a
                    href={`https://wa.me/${selectedInquiry.phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${selectedInquiry.name}, this is the NKYLUXURY Private Concierge team. We received your custom jewelry request for a ${selectedInquiry.material} piece and would love to walk through the details with you.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-luxury-black text-white hover:bg-luxury-gold hover:text-luxury-black border border-luxury-gold text-center py-2.5 font-bold uppercase tracking-wider text-[9px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    Discuss on WhatsApp
                  </a>
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=NKYLUXURY%20Bespoke%20Jewelry%20Request&body=Hello%20${encodeURIComponent(selectedInquiry.name)},%0A%0AThank%20you%20for%20contacting%20NKYLUXURY%20Private%20Client%20Services.%20We%20received%20your%20bespoke%20request%20for%20the%20${encodeURIComponent(selectedInquiry.material)}%20piece.`}
                    className="w-full bg-white text-luxury-black border border-slate-300 hover:border-luxury-black text-center py-2.5 font-bold uppercase tracking-wider text-[9px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FiMail /> Send Email Response
                  </a>
                  <button
                    onClick={() => handleUpdateStatus(selectedInquiry._id, selectedInquiry.status)}
                    className={`w-full py-2.5 font-bold uppercase tracking-wider text-[9px] border transition-colors cursor-pointer ${
                      selectedInquiry.status === 'responded'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100'
                        : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                    }`}
                  >
                    {selectedInquiry.status === 'responded' ? 'Revert to Pending' : 'Mark as Responded'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-luxury-gray p-8">
                <FiEye className="text-4xl text-luxury-gold/40 mb-3" />
                <p className="font-serif text-sm uppercase tracking-wide font-medium">No Inquiry Selected</p>
                <p className="text-[10px] mt-1">Select an inquiry from the list to view references, download designs, and contact the client directly.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomInquiries;
