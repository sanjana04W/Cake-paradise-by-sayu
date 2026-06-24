import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router';
import { ChevronRight, Star, Truck, Gift, Clock } from 'lucide-react';
import { useProducts, useCategories } from '../../hooks/useProducts';

const Home = () => {
  const { products: featuredProducts, loading: productsLoading } = useProducts({ isFeatured: true, limitCount: 4 });
  const { categories, loading: categoriesLoading } = useCategories();

  return (
    <>
      <Helmet>
        <title>Cake Paradise by Sayu | Premium Handcrafted Cakes in Sri Lanka</title>
        <meta name="description" content="Discover premium handcrafted cakes for all occasions in Sri Lanka. From custom birthday cakes to elegant wedding tiers, every bite is a taste of paradise." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-champagne overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 md:px-8 pt-32 pb-20 md:pt-40 md:pb-32 relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6 md:pr-12 text-center md:text-left">
            <span className="inline-block px-3 py-1 bg-white/50 rounded-full text-rose-gold text-sm font-semibold uppercase tracking-wider backdrop-blur-sm">
              Crafted with Love in Sri Lanka
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-dark-chocolate leading-tight">
              Every Bite is a Taste of <span className="text-rose-gold relative whitespace-nowrap">Paradise
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-warm-pink/40" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
              </span>
            </h1>
            <p className="text-lg text-charcoal/80 max-w-lg mx-auto md:mx-0">
              Premium, handcrafted cakes for your most special moments. Order today and make your celebrations truly unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
              <Link to="/shop" className="w-full sm:w-auto px-6 py-4 bg-rose-gold text-white rounded-full font-semibold hover:bg-deep-burgundy transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center whitespace-nowrap">
                Shop Our Cakes
              </Link>
              <Link to="/custom-order" className="w-full sm:w-auto px-6 py-4 bg-white text-rose-gold border-2 border-rose-gold rounded-full font-semibold hover:bg-rose-gold/5 transition-all text-center whitespace-nowrap">
                Request Custom Cake
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 relative">
            <div className="aspect-square rounded-full bg-rose-gold/10 absolute inset-0 transform scale-95 origin-bottom-right blur-3xl"></div>
            <div className="relative aspect-[4/3] md:aspect-square bg-white rounded-t-full rounded-bl-full shadow-2xl overflow-hidden border-8 border-white flex items-center justify-center">
               <img src="https://images.unsplash.com/photo-1535141192574-5d4897c12636?q=80&w=800&auto=format&fit=crop" alt="Beautiful Cake" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4 p-6 rounded-2xl bg-cream/50 hover:bg-cream transition-colors">
              <div className="bg-rose-gold/10 p-3 rounded-full text-rose-gold shrink-0">
                <Star size={24} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-dark-chocolate text-lg mb-1">Premium Ingredients</h3>
                <p className="text-charcoal/70 text-sm">We use only the finest ingredients to ensure perfect taste.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 rounded-2xl bg-cream/50 hover:bg-cream transition-colors">
              <div className="bg-rose-gold/10 p-3 rounded-full text-rose-gold shrink-0">
                <Gift size={24} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-dark-chocolate text-lg mb-1">Custom Designs</h3>
                <p className="text-charcoal/70 text-sm">Tailor-made designs bringing your dream cakes to life.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 rounded-2xl bg-cream/50 hover:bg-cream transition-colors">
              <div className="bg-rose-gold/10 p-3 rounded-full text-rose-gold shrink-0">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-dark-chocolate text-lg mb-1">Careful Delivery</h3>
                <p className="text-charcoal/70 text-sm">Safe and prompt delivery across Colombo and suburbs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-dark-chocolate mb-4">Shop by Category</h2>
            <p className="text-charcoal/70 max-w-2xl mx-auto">Explore our wide range of delightful creations, baked fresh for every occasion.</p>
          </div>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse flex flex-col items-center">
                  <div className="bg-cream/80 w-full rounded-2xl aspect-square mb-4 shadow-sm"></div>
                  <div className="h-6 bg-cream/80 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
              {categories.slice(0, 5).map((cat) => (
                <Link key={cat.id} to={`/shop/${cat.slug}`} className="group flex flex-col items-center">
                  <div className="relative rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-300 aspect-square w-full mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/0 group-hover:to-black/20 transition-colors z-10"></div>
                    {/* Category Image */}
                    <img src={cat.image || 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=400&auto=format&fit=crop'} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <h3 className="text-lg md:text-xl font-display font-bold text-dark-chocolate text-center group-hover:text-rose-gold transition-colors">
                    {cat.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/shop" className="inline-flex items-center text-rose-gold font-semibold hover:text-deep-burgundy transition-colors">
              View All Categories <ChevronRight size={20} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
<section className="py-20 bg-white">
  <div className="container mx-auto px-4 md:px-8">
    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
      <div>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-dark-chocolate mb-4">Our Bestsellers</h2>
        <p className="text-charcoal/70">The cakes our customers keep coming back for.</p>
      </div>
      <Link to="/shop" className="hidden md:inline-flex items-center text-rose-gold font-semibold hover:text-deep-burgundy transition-colors">
        Shop All <ChevronRight size={20} className="ml-1" />
      </Link>
    </div>

    {productsLoading ? (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse">
            <div className="bg-cream rounded-2xl aspect-[4/5] mb-4"></div>
            <div className="h-6 bg-cream rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-cream rounded w-1/2"></div>
          </div>
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {featuredProducts.map((product, index) => {

          // ✅ Fallback images per position if product has no image
          const fallbackImages = [
          '/images/Chocolate Dream Birthday Cake.webp',
          '/images/Vanilla Bliss Celebration Cake.png',
          '/images/Red Velvet Royal Cake.png',
          '/images/Fondant Fantasy Cake.jpg',
          ];

          const imageUrl = product.images?.[0] || fallbackImages[index] || fallbackImages[0];

          return (
            <Link key={product.id} to={`/product/${product.slug}`} className="group flex flex-col bg-champagne-light rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-champagne">
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-chocolate/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <span className="text-white font-semibold text-sm border border-white/70 rounded-full px-4 py-1">View Details →</span>
                </div>
                {product.isFeatured && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 text-[10px] uppercase tracking-wider font-bold text-rose-gold rounded-full shadow-sm">
                    ★ Best Seller
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-display font-bold text-base text-dark-chocolate group-hover:text-rose-gold transition-colors line-clamp-2 mb-1">
                  {product.name}
                </h3>
                <p className="text-charcoal/60 text-xs line-clamp-2 mb-3">{product.shortDescription}</p>
                <div className="mt-auto flex items-center justify-between pt-2 border-t border-cream/60">
                  <span className="text-rose-gold font-bold">LKR {product.basePrice.toLocaleString()}</span>
                  <span className="text-charcoal/40 text-xs">{product.weights?.[0]?.value || ''}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    )}
  </div>
</section>

      {/* CTA Section */}
      <section className="py-20 bg-rose-gold text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold !text-white mb-6">Have a Special Design in Mind?</h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-10">
            We love bringing your wildest cake dreams to life. From gravity-defying structures to intricate sugar art, let's create something extraordinary together.
          </p>
          <Link to="/custom-order" className="inline-block px-10 py-4 bg-white text-rose-gold rounded-full font-bold text-lg hover:bg-champagne transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
            Start Your Custom Order
          </Link>
        </div>
      </section>
    </>
  );
};


export default Home;
