import React from 'react';
import { Helmet } from 'react-helmet-async';

const Terms = () => {
  return (
    <div className="pt-28 pb-16 min-h-screen bg-champagne">
      <Helmet>
        <title>Terms of Service | Cake Paradise</title>
      </Helmet>
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-chocolate text-center mb-12">Terms of Service</h1>
        
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-rose-gold/20 text-charcoal/80">
          <p className="text-sm text-gray-500 mb-6">Last Updated: October 2023</p>
          
          <p className="mb-6">
            Welcome to Cake Paradise. By accessing or using our website and services, you agree to be bound by these Terms of Service. Please read them carefully.
          </p>

          <h2 className="text-2xl font-display font-bold text-dark-chocolate mt-8 mb-4">1. General Conditions</h2>
          <p className="mb-6">
            We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve transmissions over various networks.
          </p>

          <h2 className="text-2xl font-display font-bold text-dark-chocolate mt-8 mb-4">2. Products and Pricing</h2>
          <p className="mb-4">
            Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
          </p>
          <p className="mb-6">
            Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy.
          </p>

          <h2 className="text-2xl font-display font-bold text-dark-chocolate mt-8 mb-4">3. Accuracy of Billing and Account Information</h2>
          <p className="mb-6">
            We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order.
          </p>

          <h2 className="text-2xl font-display font-bold text-dark-chocolate mt-8 mb-4">4. Allergen Warning</h2>
          <p>
            Our products are made in a kitchen that processes wheat, milk, eggs, soy, peanuts, and tree nuts. While we take steps to minimize the risk of cross-contamination, we cannot guarantee that any of our products are safe to consume for people with specific allergies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
