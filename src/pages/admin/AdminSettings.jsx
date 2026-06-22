import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiSave, FiUpload } from 'react-icons/fi';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // About Fields
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [story, setStory] = useState('');
  const [mission, setMission] = useState('');
  const [vision, setVision] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Contact Fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');

  // Shipping
  const [shippingFees, setShippingFees] = useState('');

  // Newsletter Broadcast
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  const handleBroadcastNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterSubject || !newsletterContent) {
      toast.error('Please enter both a subject and content for the newsletter');
      return;
    }

    setBroadcasting(true);
    try {
      const response = await api.post('/newsletter/broadcast', {
        subject: newsletterSubject,
        content: newsletterContent
      });
      toast.success(response.data.message || 'Newsletter broadcast sent successfully!');
      setNewsletterSubject('');
      setNewsletterContent('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send newsletter broadcast');
    } finally {
      setBroadcasting(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/settings');
      const settings = response.data.settings;
      if (settings) {
        setHeroTitle(settings.aboutPageContent.heroTitle || '');
        setHeroSubtitle(settings.aboutPageContent.heroSubtitle || '');
        setStory(settings.aboutPageContent.story || '');
        setMission(settings.aboutPageContent.mission || '');
        setVision(settings.aboutPageContent.vision || '');
        setPreviewUrl(settings.aboutPageContent.image || '');

        setEmail(settings.contactInfo.email || '');
        setPhone(settings.contactInfo.phone || '');
        setAddress(settings.contactInfo.address || '');
        setInstagram(settings.contactInfo.instagram || '');
        setFacebook(settings.contactInfo.facebook || '');
        setTwitter(settings.contactInfo.twitter || '');

        setShippingFees(settings.shippingFees.toString());
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('heroTitle', heroTitle);
    formData.append('heroSubtitle', heroSubtitle);
    formData.append('story', story);
    formData.append('mission', mission);
    formData.append('vision', vision);

    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('address', 'No physical showroom (Online Consultation Only)');
    formData.append('instagram', instagram);
    formData.append('facebook', facebook);
    formData.append('twitter', twitter);

    formData.append('shippingFees', '0');

    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      await api.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Website configuration settings saved successfully!');
      fetchSettings();
    } catch (err) {
      toast.error('Failed to save configuration settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 skeleton"></div>
        <div className="h-60 skeleton"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-sans text-xs max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-center border-b border-luxury-gold/10 pb-4">
        <h2 className="font-serif text-lg text-luxury-black font-semibold">General Configurations</h2>
        <button
          type="submit"
          disabled={submitting}
          className="bg-luxury-gold text-luxury-black border border-luxury-gold px-6 py-3 uppercase tracking-widest font-semibold hover:bg-transparent hover:text-luxury-gold transition-all duration-300 flex items-center gap-2"
        >
          <FiSave /> {submitting ? 'Saving Configuration...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: About content & image */}
        <div className="space-y-6">
          <div className="bg-white p-6 border border-luxury-gold/10 space-y-4">
            <h3 className="font-serif text-md text-luxury-black border-b border-luxury-gold/10 pb-2">About Page Narrative</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-luxury-gray font-semibold mb-2">Hero Main Title</label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-luxury-gray font-semibold mb-2">Hero Subtitle</label>
                <input
                  type="text"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-luxury-gray font-semibold mb-2">Our Story Legacy</label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows="4"
                className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-luxury-gray font-semibold mb-2">Corporate Mission</label>
              <textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                rows="2"
                className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-luxury-gray font-semibold mb-2">Corporate Vision</label>
              <textarea
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                rows="2"
                className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Right Side: Contact, Shipping, & Image Upload */}
        <div className="space-y-6">
          {/* Contact Details */}
          <div className="bg-white p-6 border border-luxury-gold/10 space-y-4">
            <h3 className="font-serif text-md text-luxury-black border-b border-luxury-gold/10 pb-2">Store Contact Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-luxury-gray font-semibold mb-2">Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-luxury-gray font-semibold mb-2">Concierge Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-luxury-gray font-semibold mb-2">Physical Showroom Address</label>
              <input
                type="text"
                value={address}
                readOnly
                disabled
                className="w-full bg-luxury-cream/10 border border-luxury-gold/15 px-3 py-2 text-luxury-gray cursor-not-allowed select-none focus:outline-none"
              />
              <span className="text-[10px] text-amber-700 mt-1 block">Note: Physical showroom address is set to "No physical showroom (Online Consultation Only)" by policy.</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-luxury-gray font-semibold mb-2">Instagram (Handle)</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                  placeholder="nkyluxury"
                />
              </div>
              <div>
                <label className="block text-luxury-gray font-semibold mb-2">Facebook (Handle)</label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-luxury-gray font-semibold mb-2">Twitter (Handle)</label>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Logistics and About page image */}
          <div className="bg-white p-6 border border-luxury-gold/10 space-y-4">
            <h3 className="font-serif text-md text-luxury-black border-b border-luxury-gold/10 pb-2">Logistics & Legacy Image</h3>
            
            <div>
              <label className="block text-luxury-gray font-semibold mb-2">Flat Shipping Fee (₦)</label>
              <input
                type="number"
                value={shippingFees}
                readOnly
                disabled
                className="w-full bg-luxury-cream/10 border border-luxury-gold/15 px-3 py-2 text-luxury-gray cursor-not-allowed select-none focus:outline-none"
                required
              />
              <span className="text-[10px] text-amber-700 mt-1 block">Note: Flat shipping fee is set to ₦0 because delivery fees are paid directly to the courier agent on delivery.</span>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-luxury-gray">About Legacy Image Showcase</label>
              
              {previewUrl && (
                <div className="h-32 w-full overflow-hidden border border-luxury-gold/20 bg-luxury-cream">
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
          </div>

          {/* Newsletter Broadcast Section */}
          <div className="bg-white p-6 border border-luxury-gold/10 space-y-4">
            <h3 className="font-serif text-md text-luxury-black border-b border-luxury-gold/10 pb-2">Broadcast Newsletter</h3>
            <p className="text-slate-500 text-[10px] leading-relaxed">
              Send an email update to all your subscribed clients. This email will use the luxury layout and header/footer configurations.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-luxury-gray font-semibold mb-1">Email Subject</label>
                <input
                  type="text"
                  value={newsletterSubject}
                  onChange={(e) => setNewsletterSubject(e.target.value)}
                  placeholder="e.g. Exclusive New Arrivals & Watches Collection"
                  className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-luxury-gray font-semibold mb-1">Email Body Content</label>
                <textarea
                  value={newsletterContent}
                  onChange={(e) => setNewsletterContent(e.target.value)}
                  placeholder="Write your email body content here..."
                  rows="5"
                  className="w-full bg-transparent border border-luxury-gold/20 px-3 py-2 focus:outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="button"
                onClick={handleBroadcastNewsletter}
                disabled={broadcasting}
                className="w-full bg-luxury-black text-white font-semibold uppercase tracking-widest py-3 border border-luxury-gold hover:bg-luxury-gold hover:text-luxury-black transition-colors"
              >
                {broadcasting ? 'Sending Broadcast...' : 'Send Broadcast to Subscribers'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AdminSettings;
