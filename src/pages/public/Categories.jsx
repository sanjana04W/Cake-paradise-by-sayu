import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { useCategories } from '../../hooks/useProducts';

const Categories = () => {
  const { categories, loading } = useCategories();

  return (
    <div className="min-h-screen bg-cream pt-28 pb-20">
      <Helmet>
        <title>All Categories | Cake Paradise by Sayu</title>
        <meta name="description" content="Explore our complete collection of cake categories, from wedding cakes to seasonal specials." />
      </Helmet>

      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-charcoal-light mb-4">
            <Link to="/" className="hover:text-rose-gold transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-rose-gold font-medium">Categories</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-chocolate mb-4">Our Categories</h1>
          <p className="text-charcoal/70 max-w-2xl text-lg">
            Browse our complete selection of handcrafted cake categories designed for every special moment.
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse flex flex-col items-center">
                <div className="bg-champagne/40 w-full rounded-[32px] aspect-square mb-4 shadow-sm"></div>
                <div className="h-6 bg-champagne/40 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {categories.map((cat, index) => (
              <Link 
                key={cat.id} 
                to={`/shop/${cat.slug}`} 
                className="group flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
              >
                <div className="relative rounded-[32px] overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-300 aspect-square w-full mb-6 border-4 border-white group-hover:border-rose-gold/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/0 group-hover:to-black/30 transition-colors z-10"></div>
                  <img 
                    src={cat.image || 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=400&auto=format&fit=crop'} 
                    alt={cat.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                </div>
                <h3 className="text-lg md:text-xl font-display font-bold text-dark-chocolate text-center group-hover:text-rose-gold transition-colors">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
