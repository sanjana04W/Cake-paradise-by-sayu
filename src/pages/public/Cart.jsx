import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const Cart = () => {
  const { items, updateQuantity, removeItem, getSubtotal, getMaxLeadTime } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();

  const subtotal = getSubtotal();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-rose-gold/10 rounded-full flex items-center justify-center text-rose-gold mb-6">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-3xl font-display font-bold text-dark-chocolate mb-4">Your cart is empty</h2>
        <p className="text-charcoal/70 mb-8 max-w-md mx-auto">Looks like you haven't added any sweet treats to your cart yet. Let's fix that!</p>
        <Link to="/shop" className="px-8 py-4 bg-rose-gold text-white rounded-full font-bold hover:bg-deep-burgundy transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1">
          Explore Our Cakes
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Shopping Cart | Cake Paradise by Sayu</title>
      </Helmet>

      <div className="bg-champagne pt-32 pb-10">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-dark-chocolate">Your Cart</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-champagne-light rounded-3xl p-6 md:p-8 shadow-sm border border-champagne">
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-cream text-sm font-semibold text-charcoal/60 uppercase tracking-wider">
                <div className="col-span-6">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total</div>
              </div>

              <div className="divide-y divide-cream">
                {items.map((item) => (
                  <div key={item.itemKey} className="py-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                    
                    {/* Product Info */}
                    <div className="col-span-6 flex items-center w-full gap-4">
                      <Link to={`/product/${item.slug}`} className="shrink-0 w-20 h-20 bg-cream rounded-xl overflow-hidden flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-charcoal/30">Img</span>
                        )}
                      </Link>
                      <div className="flex-grow">
                        <Link to={`/product/${item.slug}`} className="font-display font-bold text-dark-chocolate hover:text-rose-gold transition-colors block mb-1">
                          {item.name}
                        </Link>
                        <div className="text-xs text-charcoal/70 space-y-0.5">
                          {item.weightLabel && <p>Size: <span className="font-medium text-charcoal">{item.weightLabel}</span></p>}
                          {item.flavor && <p>Flavor: <span className="font-medium text-charcoal">{item.flavor}</span></p>}
                          {item.customText && <p>Msg: <span className="font-medium text-charcoal">"{item.customText}"</span></p>}
                        </div>
                        <p className="text-sm font-bold text-rose-gold mt-2 md:hidden">
                          LKR {item.unitPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-span-3 w-full md:w-auto flex justify-between md:justify-center items-center mt-4 md:mt-0">
                      <div className="flex items-center bg-cream/30 border border-cream rounded-full h-10">
                        <button 
                          onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                          className="w-10 h-full flex items-center justify-center text-charcoal hover:text-rose-gold transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm text-dark-chocolate">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                          className="w-10 h-full flex items-center justify-center text-charcoal hover:text-rose-gold transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Total & Remove */}
                    <div className="col-span-3 w-full flex justify-between md:justify-end items-center mt-4 md:mt-0">
                      <span className="font-bold text-dark-chocolate hidden md:inline-block">
                        LKR {item.lineTotal.toLocaleString()}
                      </span>
                      <button 
                        onClick={() => removeItem(item.itemKey)}
                        className="text-charcoal/40 hover:text-rose-gold transition-colors p-2 md:ml-4"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-champagne-light rounded-3xl p-6 md:p-8 shadow-sm border border-champagne sticky top-24">
              <h3 className="font-display font-bold text-xl text-dark-chocolate mb-6 pb-4 border-b border-cream">Order Summary</h3>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-charcoal">
                  <span>Subtotal</span>
                  <span className="font-medium text-dark-chocolate">LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-charcoal">
                  <span>Shipping</span>
                  <span className="text-charcoal/50 italic">Calculated at checkout</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-cream mb-8 flex justify-between items-end">
                <span className="font-bold text-dark-chocolate">Total</span>
                <span className="text-2xl font-bold text-rose-gold">LKR {subtotal.toLocaleString()}</span>
              </div>

              <div className="bg-cream/50 rounded-xl p-4 mb-8 text-sm text-charcoal/80 flex items-start space-x-3">
                <span className="text-rose-gold shrink-0 mt-0.5">ℹ️</span>
                <p>Based on your items, the earliest possible delivery is in <strong className="text-dark-chocolate">{getMaxLeadTime()} days</strong>.</p>
              </div>

              <button 
                onClick={() => {
                  if (!user) {
                    navigate('/login?redirect=/checkout');
                  } else {
                    navigate('/checkout');
                  }
                }}
                className="w-full py-4 bg-rose-gold text-white rounded-full font-bold text-lg hover:bg-deep-burgundy transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center"
              >
                Proceed to Checkout <ArrowRight size={20} className="ml-2" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Cart;
