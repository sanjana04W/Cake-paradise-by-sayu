import React from 'react';
import { Link } from 'react-router';
import { Mail, MapPin, Phone, Heart, ExternalLink, ChevronRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-dark-chocolate text-cream overflow-hidden">

      {/* Decorative top wave */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-gold via-warm-pink to-rose-gold" />

      {/* Background decorative orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-rose-gold/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-warm-pink/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Main footer content */}
        <div className="container mx-auto px-4 md:px-8 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-14">

            {/* Brand column — wider */}
            <div className="lg:col-span-4 space-y-5">
              {/* Logo */}
              <Link to="/" className="inline-flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full bg-rose-gold/15 border border-rose-gold/30 flex items-center justify-center group-hover:bg-rose-gold/25 transition-colors">
                  <img src="/images/logo.png" alt="Cake Paradise Logo" className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display='none'; }} />
                </div>
                <div>
                  <span className="block text-xl font-display font-bold text-rose-gold leading-none">Cake Paradise</span>
                  <span className="block text-cream/60 text-xs mt-0.5 tracking-widest uppercase">by Sayu</span>
                </div>
              </Link>

              <p className="text-cream/60 text-sm leading-relaxed">
                Crafting unforgettable moments with premium, handcrafted cakes. Every bite is a taste of paradise — made with the finest ingredients and boundless love from Sri Lanka.
              </p>

              {/* Social links */}
              <div className="pt-1">
                <p className="text-cream/40 text-xs uppercase tracking-widest mb-3">Follow Us</p>
                <div className="flex gap-3">
                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/profile.php?id=61553228562465"
                    target="_blank" rel="noreferrer"
                    className="w-9 h-9 rounded-full border border-cream/10 bg-cream/5 flex items-center justify-center text-cream/60 hover:bg-rose-gold hover:border-rose-gold hover:text-white transition-all duration-300 hover:scale-110"
                    aria-label="Facebook"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </a>
                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/94743593784"
                    target="_blank" rel="noreferrer"
                    className="w-9 h-9 rounded-full border border-cream/10 bg-cream/5 flex items-center justify-center text-cream/60 hover:bg-[#25D366] hover:border-[#25D366] hover:text-white transition-all duration-300 hover:scale-110"
                    aria-label="WhatsApp"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                  </a>
                  {/* TikTok */}
                  <a
                    href="https://www.tiktok.com/@cake_paradise_by_sayu_"
                    target="_blank" rel="noreferrer"
                    className="w-9 h-9 rounded-full border border-cream/10 bg-cream/5 flex items-center justify-center text-cream/60 hover:bg-rose-gold hover:border-rose-gold hover:text-white transition-all duration-300 hover:scale-110"
                    aria-label="TikTok"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Explore */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold text-champagne uppercase tracking-widest mb-5 pb-2 border-b border-cream/10">Explore</h3>
              <ul className="space-y-2.5">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/shop', label: 'Shop Cakes' },
                  { to: '/categories', label: 'All Categories' },
                  { to: '/custom-order', label: 'Custom Orders' },
                  { to: '/about', label: 'Our Story' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="group flex items-center gap-1.5 text-cream/60 hover:text-rose-gold text-sm transition-colors duration-200">
                      <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all duration-200" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help & Info */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold text-champagne uppercase tracking-widest mb-5 pb-2 border-b border-cream/10">Help & Info</h3>
              <ul className="space-y-2.5">
                {[
                  { to: '/faq', label: 'FAQs' },
                  { to: '/shipping', label: 'Shipping & Delivery' },
                  { to: '/returns', label: 'Returns & Refunds' },
                  { to: '/privacy', label: 'Privacy Policy' },
                  { to: '/terms', label: 'Terms of Service' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="group flex items-center gap-1.5 text-cream/60 hover:text-rose-gold text-sm transition-colors duration-200">
                      <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all duration-200" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-4">
              <h3 className="text-sm font-semibold text-champagne uppercase tracking-widest mb-5 pb-2 border-b border-cream/10">Get in Touch</h3>
              <ul className="space-y-4">
                <li>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={14} className="text-rose-gold" />
                    </div>
                    <div>
                      <p className="text-cream/40 text-xs uppercase tracking-wider mb-0.5">Address</p>
                      <span className="text-cream/70 text-sm leading-relaxed">Thumbodara, Nattandiya,<br />Sri Lanka</span>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Phone size={14} className="text-rose-gold" />
                    </div>
                    <div>
                      <p className="text-cream/40 text-xs uppercase tracking-wider mb-0.5">Phone / WhatsApp</p>
                      <a href="tel:+94743593784" className="text-cream/70 hover:text-rose-gold text-sm transition-colors">+94 74 359 3784</a>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Mail size={14} className="text-rose-gold" />
                    </div>
                    <div>
                      <p className="text-cream/40 text-xs uppercase tracking-wider mb-0.5">Email</p>
                      <a href="mailto:sayu@cakeparadise.lk" className="text-cream/70 hover:text-rose-gold text-sm transition-colors break-all">sayu@cakeparadise.lk</a>
                    </div>
                  </div>
                </li>
              </ul>

              {/* CTA */}
              <Link
                to="/custom-order"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-rose-gold/10 border border-rose-gold/30 text-rose-gold rounded-full text-sm font-semibold hover:bg-rose-gold hover:text-white transition-all duration-300 group"
              >
                Order a Custom Cake
                <ExternalLink size={13} className="group-hover:rotate-12 transition-transform duration-300" />
              </Link>
            </div>

          </div>

          {/* Divider */}
          <div className="border-t border-cream/10 pt-7 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-cream/40 text-xs text-center md:text-left">
              © {currentYear} <span className="text-cream/60">Cake Paradise by Sayu</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5 text-cream/40 text-xs">
              <span>Crafted with</span>
              <Heart size={12} className="text-rose-gold fill-rose-gold animate-pulse-soft" />
              <span>for cake lovers in Sri Lanka</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
