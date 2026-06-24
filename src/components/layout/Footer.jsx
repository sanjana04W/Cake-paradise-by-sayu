import React from 'react';
import { Link } from 'react-router';
import { Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-chocolate text-cream pt-16 pb-8 border-t-4 border-rose-gold">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-display font-bold text-rose-gold">Cake Paradise</span>
              <span className="block text-cream/80 text-sm mt-1">by Sayu</span>
            </Link>
            <p className="text-cream/70 text-sm leading-relaxed mt-4">
              Crafting unforgettable moments with premium, handcrafted cakes. Every bite is a taste of paradise, made with the finest ingredients and boundless love.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://www.facebook.com/profile.php?id=61553228562465&rdid=GFdKAYFfOlZmWBMb&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F14bDF3uZfRM%2F#" target="_blank" rel="noreferrer" className="text-cream/80 hover:text-warm-pink transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="https://wa.me/94743593784" target="_blank" rel="noreferrer" className="text-cream/80 hover:text-warm-pink transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@cake_paradise_by_sayu_?_r=1&_t=ZS-97RrsFG1gU3" target="_blank" rel="noreferrer" className="text-cream/80 hover:text-warm-pink transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-display font-semibold text-champagne mb-6">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-cream/70 hover:text-rose-gold text-sm transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/shop" className="text-cream/70 hover:text-rose-gold text-sm transition-colors">Shop Cakes</Link>
              </li>
              <li>
                <Link to="/custom-order" className="text-cream/70 hover:text-rose-gold text-sm transition-colors">Custom Orders</Link>
              </li>
              <li>
                <Link to="/about" className="text-cream/70 hover:text-rose-gold text-sm transition-colors">Our Story</Link>
              </li>
              <li>
                <Link to="/contact" className="text-cream/70 hover:text-rose-gold text-sm transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-display font-semibold text-champagne mb-6">Help & Info</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/faq" className="text-cream/70 hover:text-rose-gold text-sm transition-colors">FAQs</Link>
              </li>
              <li>
                <Link to="/shipping" className="text-cream/70 hover:text-rose-gold text-sm transition-colors">Shipping & Delivery</Link>
              </li>
              <li>
                <Link to="/returns" className="text-cream/70 hover:text-rose-gold text-sm transition-colors">Returns & Refunds</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-cream/70 hover:text-rose-gold text-sm transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-cream/70 hover:text-rose-gold text-sm transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-display font-semibold text-champagne mb-6">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-cream/70 text-sm">
                <MapPin size={18} className="text-rose-gold shrink-0 mt-0.5" />
                <span>Thummodara,<br />Nattandiya,<br />Sri Lanka</span>
              </li>
              <li className="flex items-center space-x-3 text-cream/70 text-sm">
                <Phone size={18} className="text-rose-gold shrink-0" />
                <span>+94 74 359 3784</span>
              </li>
              <li className="flex items-center space-x-3 text-cream/70 text-sm">
                <Mail size={18} className="text-rose-gold shrink-0" />
                <a href="mailto:hello@cakeparadise.lk" className="hover:text-rose-gold transition-colors">sayu@cakeparadise.lk</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-cream/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-cream/50 text-xs text-center md:text-left mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Cake Paradise by Sayu. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 text-cream/50 text-xs">
            <span>Designed with</span>
            <span className="text-rose-gold">♥</span>
            <span>for cake lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
