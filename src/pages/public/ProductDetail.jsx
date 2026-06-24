import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router';
import { ChevronRight, Minus, Plus, ShoppingBag, ArrowLeft, CheckCircle } from 'lucide-react';
import { useProductDetail } from '../../hooks/useProducts';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { product, loading, error } = useProductDetail(slug);
  const { addItem } = useCart();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [customText, setCustomText] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);

  // Initialize defaults once product loads
  React.useEffect(() => {
    if (product) {
      if (product.weights && product.weights.length > 0) setSelectedWeight(product.weights[0].value);
      if (product.flavors && product.flavors.length > 0) setSelectedFlavor(product.flavors[0]);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12 animate-pulse">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/2 aspect-square bg-cream rounded-3xl"></div>
          <div className="md:w-1/2 space-y-6">
            <div className="h-10 bg-cream rounded w-3/4"></div>
            <div className="h-6 bg-cream rounded w-1/4"></div>
            <div className="h-32 bg-cream rounded w-full"></div>
            <div className="h-12 bg-cream rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-display font-bold text-dark-chocolate mb-4">Product Not Found</h2>
        <p className="text-charcoal/70 mb-8">We couldn't find the cake you're looking for.</p>
        <Link to="/shop" className="px-6 py-3 bg-rose-gold text-white rounded-full font-semibold hover:bg-deep-burgundy transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  const currentPrice = selectedWeight && product.priceMatrix 
    ? product.priceMatrix[selectedWeight] 
    : product.basePrice;

  const handleAddToCart = () => {
    if (!user) {
      navigate(`/login?redirect=/product/${slug}`);
      return;
    }

    const weightLabel = product.weights?.find(w => w.value === selectedWeight)?.label;
    
    addItem(product, {
      quantity,
      weight: selectedWeight,
      weightLabel,
      flavor: selectedFlavor,
      customText
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '+94743593784').replace(/\D/g, '');
  const whatsappMsg = encodeURIComponent(`Hi Sayu! I'm interested in ordering: ${product.name}. Could you please help me?`);

  const stockBadgeMap = {
    'in-stock': { label: '✓ In Stock', className: 'bg-green-100 text-green-800' },
    'made-to-order': { label: '🎂 Made to Order', className: 'bg-blue-100 text-blue-800' },
    'low-stock': { label: '⚠ Low Stock', className: 'bg-yellow-100 text-yellow-800' },
    'out-of-stock': { label: '✕ Out of Stock', className: 'bg-red-100 text-red-800' },
  };
  const stockBadge = stockBadgeMap[product.stockStatus] || stockBadgeMap['made-to-order'];

  return (
    <>
      <Helmet>
        <title>{`${product.name} | Cake Paradise by Sayu`}</title>
        <meta name="description" content={(product.shortDescription || '').substring(0, 150)} />
      </Helmet>

      <div className="bg-cream/30 border-b border-cream pt-28">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-charcoal/60">
            <Link to="/" className="hover:text-rose-gold transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to="/shop" className="hover:text-rose-gold transition-colors">Shop</Link>
            <ChevronRight size={14} />
            <span className="text-dark-chocolate font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Image */}
          <div className="lg:w-1/2">
            <div 
              className="rounded-3xl aspect-square relative overflow-hidden mb-4 border-2 border-white shadow-lg flex items-center justify-center bg-gray-100"
            >
              <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1ea236?q=80&w=800&auto=format&fit=crop'} alt={product.name} className="absolute inset-0 w-full h-full object-cover z-0" />
              <span className={`absolute top-6 left-6 px-3 py-1.5 text-sm font-bold rounded-full shadow-md ${stockBadge.className}`}>
                {stockBadge.label}
              </span>
              {product.isFeatured && (
                <span className="absolute top-6 right-6 px-3 py-1 bg-rose-gold text-white text-xs font-bold rounded-full shadow-md">
                  ⭐ Best Seller
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="lg:w-1/2 flex flex-col">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-dark-chocolate mb-2">
              {product.name}
            </h1>

            {product.averageRating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map(star => (
                    <svg key={star} className={`w-4 h-4 ${star <= Math.round(product.averageRating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-charcoal/70">{product.averageRating} ({product.reviewCount} reviews)</span>
              </div>
            )}

            <p className="text-2xl font-bold text-rose-gold mb-6">
              LKR {currentPrice.toLocaleString()}
              {selectedWeight && <span className="text-sm text-charcoal/50 font-normal ml-2">/ {selectedWeight}</span>}
            </p>

            <div className="text-charcoal/80 mb-8 leading-relaxed text-sm">
              {product.longDescription || product.shortDescription}
            </div>

            <div className="space-y-6 flex-grow">
              {/* Weight */}
              {product.weights && product.weights.length > 0 && (
                <div>
                  <span className="block font-semibold text-dark-chocolate mb-3">Size / Weight</span>
                  <div className="grid grid-cols-2 gap-3">
                    {product.weights.map(w => (
                      <button
                        key={w.value}
                        onClick={() => setSelectedWeight(w.value)}
                        className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left ${
                          selectedWeight === w.value 
                            ? 'border-rose-gold bg-rose-gold/5 text-rose-gold shadow-sm' 
                            : 'border-cream bg-white text-charcoal hover:border-rose-gold/30'
                        }`}
                      >
                        <span className="block font-semibold">{w.value}</span>
                        {product.priceMatrix?.[w.value] && (
                          <span className="block text-rose-gold font-bold mt-0.5 text-xs">LKR {product.priceMatrix[w.value].toLocaleString()}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Flavor */}
              {product.flavors && product.flavors.length > 0 && (
                <div>
                  <span className="block font-semibold text-dark-chocolate mb-3">Sponge Flavor</span>
                  <div className="flex flex-wrap gap-2">
                    {product.flavors.map(f => (
                      <button
                        key={f}
                        onClick={() => setSelectedFlavor(f)}
                        className={`py-2 px-4 rounded-full border text-sm transition-all ${
                          selectedFlavor === f 
                            ? 'border-dark-chocolate bg-dark-chocolate text-white' 
                            : 'border-cream bg-white text-charcoal hover:border-dark-chocolate/40'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Text */}
              {product.customTextAllowed && (
                <div>
                  <span className="block font-semibold text-dark-chocolate mb-2">
                    Message on Cake <span className="text-charcoal/50 text-sm font-normal">(Optional)</span>
                  </span>
                  <input
                    type="text"
                    maxLength={product.customTextMaxLength || 50}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="E.g., Happy Birthday Sayu! 🎂"
                    className="w-full border border-cream bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50"
                  />
                  <p className="text-xs text-charcoal/40 mt-1 text-right">
                    {(product.customTextMaxLength || 50) - customText.length} chars left
                  </p>
                </div>
              )}

              {/* Add to Cart */}
              <div className="pt-6 border-t border-cream">
                <div className="flex gap-3 items-center mb-3">
                  <div className="flex items-center bg-white border border-cream rounded-full h-12 shrink-0">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center hover:text-rose-gold transition-colors">
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-bold text-dark-chocolate">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center hover:text-rose-gold transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    disabled={product.stockStatus === 'out-of-stock'}
                    className={`flex-grow h-12 rounded-full font-bold flex items-center justify-center transition-all ${
                      addedToCart ? 'bg-green-600 text-white' 
                      : product.stockStatus === 'out-of-stock' ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-rose-gold text-white hover:bg-deep-burgundy shadow-lg hover:-translate-y-0.5'
                    }`}
                  >
                    {addedToCart ? <><CheckCircle size={18} className="mr-2"/>Added!</> : <><ShoppingBag size={18} className="mr-2"/>Add · LKR {(currentPrice * quantity).toLocaleString()}</>}
                  </button>
                </div>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-full border-2 border-[#25D366] text-[#25D366] font-semibold hover:bg-[#25D366]/5 transition-colors text-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.128.558 4.121 1.527 5.849L0 24l6.312-1.499A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6c-1.998 0-3.861-.548-5.462-1.5l-.391-.233-4.053.963.984-3.96-.255-.407A9.568 9.568 0 012.4 12C2.4 6.705 6.705 2.4 12 2.4S21.6 6.705 21.6 12 17.295 21.6 12 21.6z"/></svg>
                  Order via WhatsApp
                </a>
                <p className="text-xs text-charcoal/40 text-center mt-2">
                  🕐 {product.leadTimeDays || 2}-day lead time · Island-wide delivery
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-16 border-t border-cream pt-12">
            <h2 className="text-2xl font-display font-bold text-dark-chocolate mb-8">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {product.reviews.map((review, idx) => (
                <div key={idx} className="bg-cream/40 rounded-2xl p-6 border border-cream">
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-charcoal/80 text-sm italic mb-4">"{review.text}"</p>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-dark-chocolate text-sm">{review.name}</span>
                    <span className="text-charcoal/40 text-xs">{review.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetail;
