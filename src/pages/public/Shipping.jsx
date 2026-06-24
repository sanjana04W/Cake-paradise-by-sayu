import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Truck, MapPin, Clock } from 'lucide-react';

const Shipping = () => {
  return (
    <div className="pt-28 pb-16 min-h-screen bg-champagne">
      <Helmet>
        <title>Shipping & Delivery | Cake Paradise</title>
      </Helmet>
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-chocolate text-center mb-12">Shipping & Delivery</h1>
        
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-rose-gold/20 max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center text-center p-6 bg-cream/30 rounded-2xl">
              <Truck size={40} className="text-rose-gold mb-4" />
              <h3 className="font-bold text-dark-chocolate text-lg mb-2">Local Delivery</h3>
              <p className="text-charcoal/70 text-sm">Safe, temperature-controlled delivery to your doorstep.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-cream/30 rounded-2xl">
              <MapPin size={40} className="text-rose-gold mb-4" />
              <h3 className="font-bold text-dark-chocolate text-lg mb-2">Delivery Area</h3>
              <p className="text-charcoal/70 text-sm">We deliver within a 20km radius of our bakery in Nattandiya.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-cream/30 rounded-2xl">
              <Clock size={40} className="text-rose-gold mb-4" />
              <h3 className="font-bold text-dark-chocolate text-lg mb-2">Delivery Times</h3>
              <p className="text-charcoal/70 text-sm">Deliveries are scheduled between 10:00 AM and 6:00 PM daily.</p>
            </div>
          </div>

          <h2 className="text-2xl font-display font-bold text-dark-chocolate mb-4">Delivery Rates</h2>
          <p className="text-charcoal/80 mb-4">
            Delivery charges are calculated based on the distance from our bakery to your delivery address. The exact delivery fee will be displayed at checkout once you enter your address.
          </p>
          <ul className="text-charcoal/80 space-y-2 mb-8 list-disc pl-5">
            <li><strong>Zone 1 (0-5 km):</strong> Free Delivery</li>
            <li><strong>Zone 2 (5-10 km):</strong> Rs. 500</li>
            <li><strong>Zone 3 (10-20 km):</strong> Rs. 1,000</li>
          </ul>

          <h2 className="text-2xl font-display font-bold text-dark-chocolate mb-4">Store Pickup</h2>
          <p className="text-charcoal/80">
            You can always choose to pick up your order directly from our bakery for free. Please ensure your vehicle is air-conditioned and has a flat surface (like the floor or trunk, not a slanted car seat) to safely transport your cake. We are not responsible for any damage that occurs once the cake leaves our premises.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
