import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const [orderId] = useState(() => {
    return location.state?.orderId || `ORD-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
  });

  return (
    <>
      <Helmet>
        <title>Order Successful | Cake Paradise by Sayu</title>
      </Helmet>

      <div className="container mx-auto px-4 pt-32 pb-24 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-sage-green/10 rounded-full flex items-center justify-center text-sage-green mb-6 animate-bounce-short">
          <CheckCircle size={48} />
        </div>
        
        <h1 className="text-4xl font-display font-bold text-dark-chocolate mb-4">
          Order Received!
        </h1>
        
        <p className="text-lg text-charcoal/80 mb-2">
          Thank you for your order. We're getting your sweet treats ready.
        </p>
        
        <div className="bg-cream/50 border border-cream rounded-xl px-6 py-4 mb-8 inline-block">
          <p className="text-sm text-charcoal/70 mb-1">Your Order Number</p>
          <p className="text-xl font-bold text-dark-chocolate tracking-wider">{orderId}</p>
        </div>

        <div className="max-w-md mx-auto text-sm text-charcoal/70 mb-10 space-y-4">
          <p>
            We will contact you via WhatsApp shortly to confirm your order details, delivery time, and provide payment instructions.
          </p>
          <p>
            If you have any questions, please contact us at <strong>+94 74 359 3784</strong> or reply to your confirmation email.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/shop" className="px-8 py-3 bg-rose-gold text-white rounded-full font-bold hover:bg-deep-burgundy transition-all shadow-md flex items-center justify-center">
            <ShoppingBag size={18} className="mr-2" /> Continue Shopping
          </Link>
          <Link to="/" className="px-8 py-3 bg-white text-dark-chocolate border border-cream rounded-full font-bold hover:bg-cream transition-all shadow-sm flex items-center justify-center">
            Back to Home <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
