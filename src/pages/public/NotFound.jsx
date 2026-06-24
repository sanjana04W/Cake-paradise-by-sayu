import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Cake Paradise by Sayu</title>
      </Helmet>
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center min-h-[70vh]">
        <h1 className="text-9xl font-display font-bold text-rose-gold mb-4 opacity-50">404</h1>
        <h2 className="text-3xl font-display font-bold text-dark-chocolate mb-4">Oops! Someone took a bite out of this page.</h2>
        <p className="text-charcoal/70 mb-8 max-w-md">
          We can't seem to find the page you're looking for. It might have been moved or deleted.
        </p>
        <Link to="/" className="px-8 py-3 bg-rose-gold text-white rounded-full font-bold hover:bg-deep-burgundy transition-colors shadow-md">
          Back to Homepage
        </Link>
      </div>
    </>
  );
};

export default NotFound;
