import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Upload, Calendar, Users, MessageSquare, CheckCircle, X } from 'lucide-react';
import { saveContactMessage } from '../../utils/messageStore';

const CustomOrder = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [files, setFiles] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    eventDate: '',
    targetServings: '',
    eventType: '',
    detailedDescription: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save as a contact message so it appears in the admin panel with a notification
      await saveContactMessage({
        name: formData.name,
        email: formData.email || `${formData.phone}@whatsapp.local`, // Fallback for email
        subject: `Custom Cake Request: ${formData.eventType}`,
        message: `Phone: ${formData.phone}\nEvent Type: ${formData.eventType}\nEvent Date: ${formData.eventDate}\nGuests: ${formData.targetServings}\n\nRequirements:\n${formData.detailedDescription}`,
      });

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error submitting custom order:", error);
      alert("There was an error submitting your request. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-sage-green/10 rounded-full flex items-center justify-center text-sage-green mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-display font-bold text-dark-chocolate mb-4">Request Sent Successfully!</h2>
        <p className="text-charcoal/70 max-w-md mx-auto mb-8">
          Thank you for trusting us with your special creation. Our team will review your requirements and get back to you via WhatsApp within 24 hours with a quote.
        </p>
        <button 
          onClick={() => {
            setIsSuccess(false);
            setFormData({
              name: '',
              phone: '',
              email: '',
              eventDate: '',
              targetServings: '',
              eventType: '',
              detailedDescription: '',
            });
            setFiles([]);
          }}
          className="px-6 py-3 bg-rose-gold text-white rounded-full font-semibold hover:bg-deep-burgundy transition-colors"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Custom Orders | Cake Paradise by Sayu</title>
        <meta name="description" content="Request a custom cake design for your special occasion. From weddings to birthdays, we bring your vision to life." />
      </Helmet>

      {/* Page Header */}
      <div className="bg-champagne pt-32 pb-12 md:pt-40 md:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <span className="inline-block px-3 py-1 bg-white/50 rounded-full text-rose-gold text-sm font-semibold uppercase tracking-wider mb-4">
            Bespoke Creations
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-chocolate mb-4">
            Dream It, We Bake It
          </h1>
          <p className="text-charcoal/70 max-w-2xl mx-auto text-lg">
            Have a specific design in mind? Fill out the form below with your ideas, and we'll craft a custom cake that's uniquely yours.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="max-w-5xl mx-auto bg-champagne-light rounded-3xl p-8 md:p-12 shadow-sm border border-champagne">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="space-y-8">
                {/* Contact Details */}
                <div>
              <h3 className="text-xl font-display font-bold text-dark-chocolate border-b border-cream pb-2 mb-6">Your Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Full Name *</label>
                  <input required type="text" autoComplete="off" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-gold transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">WhatsApp Number *</label>
                  <input required type="tel" autoComplete="off" placeholder="+94 7X XXX XXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-gold transition-colors" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-charcoal mb-2">Email Address</label>
                  <input type="email" autoComplete="off" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-gold transition-colors" />
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div>
              <h3 className="text-xl font-display font-bold text-dark-chocolate border-b border-cream pb-2 mb-6 mt-8">Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2 flex items-center">
                    <Calendar size={16} className="mr-2 text-rose-gold" /> Event Date *
                  </label>
                  <input required type="date" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-gold transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2 flex items-center">
                    <Users size={16} className="mr-2 text-rose-gold" /> Number of Guests *
                  </label>
                  <select required value={formData.targetServings} onChange={e => setFormData({...formData, targetServings: e.target.value})} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-gold transition-colors appearance-none">
                    <option value="">Select an option</option>
                    <option value="1-10">1 - 10</option>
                    <option value="11-20">11 - 20</option>
                    <option value="21-50">21 - 50</option>
                    <option value="50-100">50 - 100</option>
                    <option value="100+">100+</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-charcoal mb-2">Event Type *</label>
                  <select required value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-gold transition-colors appearance-none">
                    <option value="">Select event type</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Baby Shower">Baby Shower</option>
                    <option value="Corporate">Corporate Event</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

              </div>
              <div className="space-y-8">
                {/* Cake Details */}
                <div>
                  <h3 className="text-xl font-display font-bold text-dark-chocolate border-b border-cream pb-2 mb-6 mt-8 lg:mt-0">Cake Details</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2 flex items-center">
                    <MessageSquare size={16} className="mr-2 text-rose-gold" /> Design Ideas & Requirements *
                  </label>
                  <textarea 
                    required 
                    rows="5" 
                    autoComplete="off"
                    value={formData.detailedDescription}
                    onChange={e => setFormData({...formData, detailedDescription: e.target.value})}
                    placeholder="Tell us about your theme, colors, preferred flavors, and any specific design elements..."
                    className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-gold transition-colors"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Reference Images (Optional)</label>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/png, image/jpeg" 
                    className="hidden" 
                    id="file-upload"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setFiles(Array.from(e.target.files));
                      }
                    }}
                  />
                  <label 
                    htmlFor="file-upload"
                    className="block w-full border-2 border-dashed border-rose-gold/30 rounded-xl p-8 text-center hover:bg-rose-gold/5 transition-colors cursor-pointer"
                  >
                    <Upload size={32} className="mx-auto text-rose-gold mb-3" />
                    <p className="text-sm text-dark-chocolate font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-charcoal/50">PNG, JPG, up to 5MB</p>
                  </label>
                  
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-charcoal">Selected Files:</p>
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between bg-cream/30 px-3 py-2 rounded-lg border border-cream">
                          <span className="text-sm text-charcoal truncate">{file.name}</span>
                          <button 
                            type="button"
                            onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                            className="text-red-400 hover:text-red-500 p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
              </div>
            </div>

            <div className="pt-6 lg:pt-8 max-w-2xl mx-auto">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-4 rounded-full font-bold text-lg text-white transition-all shadow-md ${
                  isSubmitting ? 'bg-rose-gold/70 cursor-not-allowed' : 'bg-rose-gold hover:bg-deep-burgundy hover:shadow-lg transform hover:-translate-y-1'
                }`}
              >
                {isSubmitting ? 'Sending Request...' : 'Submit Custom Order Request'}
              </button>
              <p className="text-xs text-charcoal/50 text-center mt-4">
                By submitting this form, you agree to our Custom Order Terms & Conditions.
              </p>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default CustomOrder;
