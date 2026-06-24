import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router';
import { Filter, ChevronDown, SlidersHorizontal, Search } from 'lucide-react';
import { useProducts, useCategories } from '../../hooks/useProducts';

const Shop = () => {
  const { category: categorySlug } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { categories, parentCategories } = useCategories();
  
  // Find current category ID if slug is present
  const currentCategory = categorySlug 
    ? categories.find(c => c.slug === categorySlug) 
    : null;
    
  const filters = {};
  if (currentCategory) {
    if (currentCategory.parentId === null) {
      filters.parentCategoryId = currentCategory.id;
    } else {
      filters.categoryId = currentCategory.id;
    }
  }

  const { products, loading } = useProducts(filters);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [sortOption, setSortOption] = useState('featured');

  // Client-side filtering and sorting
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.description?.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-desc':
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'newest':
        // Assuming we had a createdAt date, we'd sort by it. For now, mock it.
        break;
      default: // featured
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    setFilteredProducts(result);
  }, [products, searchQuery, sortOption]);

  return (
    <>
      <Helmet>
        <title>{currentCategory ? `${currentCategory.name} | Shop | Cake Paradise by Sayu` : 'Shop | Cake Paradise by Sayu'}</title>
      </Helmet>

      {/* Page Header */}
      <div className="bg-champagne pt-32 pb-12 md:pt-40 md:pb-20 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-chocolate mb-4">
            {currentCategory ? currentCategory.name : 'All Cakes & Treats'}
          </h1>
          <p className="text-charcoal/70 max-w-2xl mx-auto text-lg">
            {currentCategory?.description || "Browse our entire collection of handcrafted delights."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <button 
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="flex items-center space-x-2 text-dark-chocolate font-semibold bg-white px-4 py-2 rounded-lg shadow-sm border border-cream"
            >
              <Filter size={20} />
              <span>Filters</span>
            </button>
            <div className="relative">
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none bg-white border border-cream px-4 py-2 pr-10 rounded-lg shadow-sm font-semibold text-dark-chocolate focus:outline-none focus:ring-2 focus:ring-rose-gold/50"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal/50 pointer-events-none" />
            </div>
          </div>

          {/* Sidebar */}
          <div className={`lg:w-1/4 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-champagne-light rounded-2xl p-6 shadow-sm border border-champagne sticky top-24">
              
              {/* Search */}
              <div className="mb-8">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search cakes..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-cream/50 border border-cream rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-gold/50 transition-shadow"
                  />
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40" />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-display font-bold text-lg text-dark-chocolate mb-4 pb-2 border-b border-cream">Categories</h3>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      to="/shop" 
                      className={`block px-3 py-2 rounded-lg transition-colors ${!categorySlug ? 'bg-rose-gold/10 text-rose-gold font-bold' : 'text-charcoal hover:bg-cream'}`}
                    >
                      All Products
                    </Link>
                  </li>
                  {parentCategories.map(cat => (
                    <li key={cat.id}>
                      <Link 
                        to={`/shop/${cat.slug}`} 
                        className={`block px-3 py-2 rounded-lg transition-colors ${categorySlug === cat.slug ? 'bg-rose-gold/10 text-rose-gold font-bold' : 'text-charcoal hover:bg-cream'}`}
                      >
                        {cat.name}
                      </Link>
                      {/* Optional: Show subcategories if any */}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:w-3/4">
            {/* Desktop Toolbar */}
            <div className="hidden lg:flex items-center justify-between bg-champagne-light p-4 rounded-xl shadow-sm border border-champagne mb-8">
              <span className="text-charcoal/70">Showing {filteredProducts.length} products</span>
              <div className="flex items-center space-x-3">
                <span className="text-charcoal font-medium">Sort by:</span>
                <div className="relative">
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none bg-cream/50 border border-cream px-4 py-2 pr-10 rounded-lg font-medium text-dark-chocolate focus:outline-none focus:ring-2 focus:ring-rose-gold/50 cursor-pointer transition-shadow"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal/50 pointer-events-none" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white rounded-2xl aspect-[4/5] mb-4 border border-cream"></div>
                    <div className="h-6 bg-white rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-white rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-cream">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cream mb-4">
                  <Search size={24} className="text-charcoal/40" />
                </div>
                <h3 className="text-xl font-display font-bold text-dark-chocolate mb-2">No products found</h3>
                <p className="text-charcoal/70">Try adjusting your filters or search query.</p>
                <button 
                  onClick={() => { setSearchQuery(''); navigate('/shop'); }}
                  className="mt-6 px-6 py-2 bg-rose-gold text-white rounded-full font-semibold hover:bg-deep-burgundy transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.slug}`} className="group flex flex-col bg-champagne-light rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-champagne">
                    <div
                      className="relative aspect-[4/3] overflow-hidden flex items-end bg-gray-100"
                    >
                      <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1ea236?q=80&w=600&auto=format&fit=crop'} alt={product.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-0" />
                      {product.isFeatured && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[10px] uppercase tracking-wider font-bold text-rose-gold rounded-full shadow-sm">
                          ★ Best Seller
                        </span>
                      )}
                      {product.stockStatus === 'in-stock' && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-full">
                          In Stock
                        </span>
                      )}
                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-chocolate/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 z-10">
                        <span className="text-white font-semibold text-sm border border-white/70 rounded-full px-4 py-1">View Details →</span>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-display font-bold text-base text-dark-chocolate group-hover:text-rose-gold transition-colors line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-charcoal/60 text-xs line-clamp-2 mb-3">{product.shortDescription}</p>
                      {product.averageRating && (
                        <div className="flex items-center gap-1 mb-2">
                          {[1,2,3,4,5].map(s => (
                            <svg key={s} className={`w-3 h-3 ${s <= Math.round(product.averageRating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                          ))}
                          <span className="text-charcoal/50 text-[10px] ml-1">({product.reviewCount})</span>
                        </div>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-2 border-t border-cream/60">
                        <span className="text-rose-gold font-bold">LKR {product.basePrice.toLocaleString()}</span>
                        <span className="text-charcoal/40 text-xs">{product.weights?.length > 0 ? `from ${product.weights[0].value}` : ''}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Shop;
