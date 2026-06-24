// Centralized analytics / pixel event dispatcher
// Wraps Meta Pixel (fbq) and TikTok Pixel (ttq) calls

const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
const TIKTOK_PIXEL_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID;

// Check if pixels are available
const hasFbq = () => typeof window !== 'undefined' && typeof window.fbq === 'function';
const hasTtq = () => typeof window !== 'undefined' && window.ttq;

// Initialize Meta Pixel
export const initMetaPixel = () => {
  if (!META_PIXEL_ID || hasFbq()) return;

  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
};

// Initialize TikTok Pixel
export const initTikTokPixel = () => {
  if (!TIKTOK_PIXEL_ID || hasTtq()) return;

  /* eslint-disable */
  !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=
  ["page","track","identify","instances","debug","on","off","once","ready","alias",
  "group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=
  function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;
  i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=
  function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,
  ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
  ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
  ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type=
  "text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=
  document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  /* eslint-enable */

  window.ttq.load(TIKTOK_PIXEL_ID);
  window.ttq.page();
};

// Initialize all pixels
export const initPixels = () => {
  initMetaPixel();
  initTikTokPixel();
};

// ==================== EVENT TRACKING ====================

// Page View - fires on every route change
export const trackPageView = () => {
  if (hasFbq()) window.fbq('track', 'PageView');
  if (hasTtq()) window.ttq.page();
};

// View Content - when user views a specific product
export const trackViewContent = (product) => {
  const data = {
    content_name: product.name,
    content_category: product.categoryId,
    content_ids: [product.id],
    content_type: 'product',
    value: product.basePrice,
    currency: 'LKR',
  };

  if (hasFbq()) window.fbq('track', 'ViewContent', data);
  if (hasTtq()) window.ttq.track('ViewContent', data);
};

// Add to Cart
export const trackAddToCart = (product, options = {}) => {
  const data = {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    value: options.price || product.basePrice,
    currency: 'LKR',
    quantity: options.quantity || 1,
  };

  if (hasFbq()) window.fbq('track', 'AddToCart', data);
  if (hasTtq()) window.ttq.track('AddToCart', data);
};

// Initiate Checkout
export const trackInitiateCheckout = (cartItems, totalValue) => {
  const data = {
    content_ids: cartItems.map((item) => item.productId),
    content_type: 'product',
    num_items: cartItems.length,
    value: totalValue,
    currency: 'LKR',
  };

  if (hasFbq()) window.fbq('track', 'InitiateCheckout', data);
  if (hasTtq()) window.ttq.track('InitiateCheckout', data);
};

// Purchase - on successful order completion
export const trackPurchase = (orderData) => {
  const data = {
    content_ids: orderData.items.map((item) => item.productId),
    content_type: 'product',
    num_items: orderData.items.length,
    value: orderData.totalAmount,
    currency: 'LKR',
    order_id: orderData.orderId,
  };

  if (hasFbq()) window.fbq('track', 'Purchase', data);
  if (hasTtq()) window.ttq.track('PlaceAnOrder', data);
};

// Lead - custom inquiry submission
export const trackLead = (inquiryData) => {
  const data = {
    content_name: 'Custom Cake Inquiry',
    content_category: inquiryData.eventType || 'custom',
    value: inquiryData.estimatedBudget || 0,
    currency: 'LKR',
  };

  if (hasFbq()) window.fbq('track', 'Lead', data);
  if (hasTtq()) window.ttq.track('SubmitForm', data);
};

// Search
export const trackSearch = (searchQuery) => {
  const data = { search_string: searchQuery };
  if (hasFbq()) window.fbq('track', 'Search', data);
  if (hasTtq()) window.ttq.track('Search', data);
};
