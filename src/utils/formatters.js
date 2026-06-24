// Currency formatter for Sri Lankan Rupees
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'LKR 0';
  return `LKR ${Number(amount).toLocaleString('en-LK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

// Short currency format
export const formatCurrencyShort = (amount) => {
  if (amount >= 1000000) return `LKR ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `LKR ${(amount / 1000).toFixed(1)}K`;
  return `LKR ${amount}`;
};

// Date formatter
export const formatDate = (date) => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Date-time formatter
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diff = now - d;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

// Slug generator
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Get stock status display
export const getStockStatusDisplay = (status) => {
  const statusMap = {
    'in-stock': { label: 'In Stock', class: 'badge-success' },
    'made-to-order': { label: 'Made to Order', class: 'badge-info' },
    'low-stock': { label: 'Low Stock', class: 'badge-warning' },
    'out-of-stock': { label: 'Out of Stock', class: 'badge-danger' },
    'draft': { label: 'Draft', class: 'badge-warning' },
  };
  return statusMap[status] || { label: status, class: 'badge-info' };
};

// Get order status display
export const getOrderStatusDisplay = (status) => {
  const statusMap = {
    'pending-confirmation': { label: 'Pending Confirmation', class: 'status-pending', color: '#92400E' },
    'confirmed': { label: 'Confirmed', class: 'status-confirmed', color: '#1E40AF' },
    'processing': { label: 'Processing', class: 'status-processing', color: '#3730A3' },
    'ready': { label: 'Ready for Delivery', class: 'status-ready', color: '#065F46' },
    'dispatched': { label: 'Dispatched', class: 'status-dispatched', color: '#78350F' },
    'delivered': { label: 'Delivered', class: 'status-delivered', color: '#064E3B' },
    'cancelled': { label: 'Cancelled', class: 'status-cancelled', color: '#991B1B' },
  };
  return statusMap[status] || { label: status, class: 'status-pending', color: '#6B7280' };
};

// Get payment status display
export const getPaymentStatusDisplay = (status) => {
  const statusMap = {
    'pending': { label: 'Pending', class: 'badge-warning' },
    'paid': { label: 'Paid', class: 'badge-success' },
    'refunded': { label: 'Refunded', class: 'badge-danger' },
  };
  return statusMap[status] || { label: status, class: 'badge-info' };
};

// Get inquiry status display
export const getInquiryStatusDisplay = (status) => {
  const statusMap = {
    'new': { label: 'New', class: 'badge-info' },
    'quoted': { label: 'Quoted', class: 'badge-warning' },
    'converted': { label: 'Converted to Order', class: 'badge-success' },
    'closed': { label: 'Closed', class: 'badge-success' },
    'cancelled': { label: 'Cancelled', class: 'badge-danger' },
  };
  return statusMap[status] || { label: status, class: 'badge-info' };
};

// Order status flow - next valid statuses
export const getNextStatuses = (currentStatus) => {
  const flow = {
    'pending-confirmation': ['confirmed', 'cancelled'],
    'confirmed': ['processing', 'cancelled'],
    'processing': ['ready', 'cancelled'],
    'ready': ['dispatched', 'cancelled'],
    'dispatched': ['delivered', 'cancelled'],
    'delivered': [],
    'cancelled': [],
  };
  return flow[currentStatus] || [];
};

// Generate order ID
export const generateOrderId = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `ORD-${date}-${random}`;
};

// Phone number formatter (Sri Lankan)
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('94')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
};

// Calculate minimum delivery date based on lead time
export const getMinDeliveryDate = (leadTimeDays = 1) => {
  const date = new Date();
  date.setDate(date.getDate() + leadTimeDays);
  return date.toISOString().split('T')[0];
};

// Color generator for charts
export const getChartColors = (count) => {
  const colors = [
    '#B76E79', '#E8A0BF', '#722F37', '#F7E7CE', '#9CAF88',
    '#F3E5AB', '#F08080', '#36454F', '#D4949C', '#8E4F58',
  ];
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};
