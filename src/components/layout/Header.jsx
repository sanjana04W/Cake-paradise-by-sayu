import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { ShoppingBag, Menu, X, Heart, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getItemCount } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  const cartItemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Custom Orders', path: '/custom-order' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-cream/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        }`}
      >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-dark-chocolate p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/images/logo.png" 
              alt="Cake Paradise by Sayu" 
              className="h-16 w-16 md:h-20 md:w-20 object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
            <div className="hidden sm:block">
              <span className="text-xl md:text-2xl font-display font-bold text-rose-gold tracking-tight leading-none block">Cake Paradise</span>
              <span className="text-dark-chocolate/70 text-xs font-semibold tracking-[0.2em] uppercase leading-none">by Sayu</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navLinks.map((link) => (
              <NavLink 
                key={link.path}
                to={link.path}
                className={({ isActive }) => 
                  `text-sm font-medium tracking-wide transition-colors ${
                    isActive ? 'text-rose-gold' : 'text-charcoal hover:text-rose-gold'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Icons & Auth */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {!user || user.role === 'admin' ? (
              <div className="hidden lg:flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-charcoal hover:text-rose-gold transition-colors">Login</Link>
                <Link to="/register" className="text-sm font-medium bg-rose-gold text-white px-4 py-2 rounded-full hover:bg-dark-chocolate transition-colors">Register</Link>
              </div>
            ) : (
              <Link to="/dashboard" className="hidden lg:flex items-center justify-center w-9 h-9 bg-rose-gold/10 text-rose-gold rounded-full hover:bg-rose-gold hover:text-white transition-all font-bold font-display text-lg" title="My Dashboard">
                {user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
              </Link>
            )}

            <Link to="/cart" className="relative text-dark-chocolate hover:text-rose-gold transition-colors">
              <ShoppingBag size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-gold text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Menu Backdrop */}
    {isMobileMenuOpen && (
      <div 
        className="lg:hidden fixed inset-0 bg-black/50 z-[45]" 
        onClick={() => setIsMobileMenuOpen(false)}
      />
    )}

    {/* Mobile Menu Sidebar */}
    <div 
      className={`lg:hidden fixed top-0 left-0 bottom-0 w-[80vw] max-w-[300px] bg-cream shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } overflow-y-auto py-6 px-4 flex flex-col space-y-4`}
    >
      <div className="flex justify-between items-center mb-4 border-b border-rose-gold/20 pb-4">
        <span className="font-display font-bold text-rose-gold text-xl">Menu</span>
        <button onClick={() => setIsMobileMenuOpen(false)} className="text-dark-chocolate p-1">
          <X size={24} />
        </button>
      </div>

      {navLinks.map((link) => (
        <NavLink 
          key={link.path}
          to={link.path}
          className={({ isActive }) => 
            `block text-lg py-2 border-b border-rose-gold/10 ${
              isActive ? 'text-rose-gold font-bold' : 'text-charcoal'
            }`
          }
        >
          {link.name}
        </NavLink>
      ))}
      
      {!user || user.role === 'admin' ? (
        <>
          <NavLink 
            to="/login"
            className={({ isActive }) => 
              `block text-lg py-2 border-b border-rose-gold/10 ${isActive ? 'text-rose-gold font-bold' : 'text-charcoal'}`
            }
          >
            Login
          </NavLink>
          <NavLink 
            to="/register"
            className={({ isActive }) => 
              `block text-lg py-2 border-b border-rose-gold/10 ${isActive ? 'text-rose-gold font-bold' : 'text-charcoal'}`
            }
          >
            Register
          </NavLink>
        </>
      ) : (
        <NavLink 
          to="/dashboard"
          className={({ isActive }) => 
            `block text-lg py-2 border-b border-rose-gold/10 ${isActive ? 'text-rose-gold font-bold' : 'text-charcoal'}`
          }
        >
          Dashboard
        </NavLink>
      )}
    </div>
    </>
  );
};

export default Header;
