import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { saveContactMessage } from '../../utils/messageStore';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      saveContactMessage(form);
      setIsSubmitting(false);
      setIsSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Cake Paradise by Sayu</title>
      </Helmet>

      <div className="bg-champagne pt-32 pb-12 md:pt-40 md:pb-20">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-chocolate mb-4">Get in Touch</h1>
          <p className="text-charcoal/70 max-w-2xl mx-auto text-lg">
            We'd love to hear from you. Whether you have a question about our cakes or want to discuss a custom order.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Contact Info */}
          <div className="lg:w-1/3 space-y-8">
            <div className="bg-champagne-light p-6 rounded-3xl border border-champagne shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="bg-rose-gold/10 p-3 rounded-full text-rose-gold shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-dark-chocolate text-lg mb-1">Our Bakery</h3>
                  <p className="text-charcoal/70 text-sm leading-relaxed">
                    Thummodara,<br />Nattandiya,<br />Sri Lanka<br />
                    <span className="text-xs text-rose-gold italic mt-1 block">(Pickups by appointment only)</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-champagne-light p-6 rounded-3xl border border-champagne shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="bg-rose-gold/10 p-3 rounded-full text-rose-gold shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-dark-chocolate text-lg mb-1">Phone / WhatsApp</h3>
                  <p className="text-charcoal/70 text-sm">+94 74 359 3784</p>
                </div>
              </div>
            </div>

            <div className="bg-champagne-light p-6 rounded-3xl border border-champagne shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="bg-rose-gold/10 p-3 rounded-full text-rose-gold shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-dark-chocolate text-lg mb-1">Email</h3>
                  <p className="text-charcoal/70 text-sm">sayu@cakeparadise.lk</p>
                </div>
              </div>
            </div>

            <div className="bg-champagne-light p-6 rounded-3xl border border-champagne shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="bg-rose-gold/10 p-3 rounded-full text-rose-gold shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-dark-chocolate text-lg mb-1">Business Hours</h3>
                  <p className="text-charcoal/70 text-sm">
                   Always Open<br />
                    
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3">
            <div className="bg-champagne-light p-8 md:p-12 rounded-3xl border border-champagne shadow-sm h-full">
              <h2 className="text-2xl font-display font-bold text-dark-chocolate mb-6">Send us a Message</h2>
              
              {isSuccess ? (
                <div className="bg-sage-green/10 text-sage-green p-6 rounded-xl text-center">
                  <h3 className="font-bold text-lg mb-2">Message Sent!</h3>
                  <p className="text-sm">Thank you for contacting us. We'll get back to you as soon as possible.</p>
                  <button onClick={() => setIsSuccess(false)} className="mt-4 text-dark-chocolate font-semibold underline text-sm">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Your Name</label>
                      <input required name="name" type="text" value={form.name} onChange={handleChange} autoComplete="off" className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-gold transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Email Address</label>
                      <input required name="email" type="email" value={form.email} onChange={handleChange} autoComplete="off" className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-gold transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Subject</label>
                    <input required name="subject" type="text" value={form.subject} onChange={handleChange} autoComplete="off" className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Message</label>
                    <textarea required name="message" rows="6" value={form.message} onChange={handleChange} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-gold transition-colors"></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-8 py-4 bg-rose-gold text-white rounded-full font-bold hover:bg-deep-burgundy transition-all shadow-md flex items-center justify-center w-full md:w-auto"
                  >
                    {isSubmitting ? 'Sending...' : <><Send size={18} className="mr-2" /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Contact;
