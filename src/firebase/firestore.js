import { db } from './config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';

const isDemoMode = !import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID === 'demo-project';

const getLocalOrders = () => {
  try { return JSON.parse(localStorage.getItem('demo_orders') || '[]'); } catch { return []; }
};
const saveLocalOrders = (orders) => {
  localStorage.setItem('demo_orders', JSON.stringify(orders));
  window.dispatchEvent(new Event('local_orders_updated'));
};

// ==================== PRODUCTS ====================
// ==================== SEED ====================
/**
 * Seeds the products collection with the sample data if it is empty.
 * Safe to call on every app start — it checks the count first.
 */
export const seedProductsIfEmpty = async (sampleProducts) => {
  try {
    const snapshot = await getDocs(query(collection(db, 'products'), limit(1)));
    if (!snapshot.empty) return; // already seeded

    const batch = writeBatch(db);
    for (const product of sampleProducts) {
      // Use the stable sample id as the Firestore document id so slugs stay consistent
      const ref = doc(db, 'products', product.id);
      batch.set(ref, {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
    console.log(`[Cake Paradise] Seeded ${sampleProducts.length} products to Firestore.`);
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

/**
 * Real-time subscription to the products collection.
 * Returns an unsubscribe function.
 */
export const subscribeToProducts = (callback, filters = {}) => {
  const constraints = [];

  if (filters.categoryId) {
    constraints.push(where('categoryId', '==', filters.categoryId));
  }
  if (filters.parentCategoryId) {
    constraints.push(where('parentCategoryId', '==', filters.parentCategoryId));
  }
  if (filters.status) {
    constraints.push(where('status', '==', filters.status));
  }
  if (filters.isFeatured !== undefined) {
    constraints.push(where('isFeatured', '==', filters.isFeatured));
  }

  // Always filter active products when status not explicitly set
  if (!filters.status && filters.includeInactive !== true) {
    constraints.push(where('status', '==', 'active'));
  }

  constraints.push(orderBy('createdAt', 'desc'));

  if (filters.limitCount) {
    constraints.push(limit(filters.limitCount));
  }

  const q = query(collection(db, 'products'), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(products);
  }, (error) => {
    console.error('subscribeToProducts error:', error);
    callback([]);
  });
};

export const getProducts = async (filters = {}) => {
  try {
    let q = collection(db, 'products');
    const constraints = [];

    if (filters.categoryId) {
      constraints.push(where('categoryId', '==', filters.categoryId));
    }
    if (filters.parentCategoryId) {
      constraints.push(where('parentCategoryId', '==', filters.parentCategoryId));
    }
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters.isFeatured !== undefined) {
      constraints.push(where('isFeatured', '==', filters.isFeatured));
    }
    if (filters.stockStatus) {
      constraints.push(where('stockStatus', '==', filters.stockStatus));
    }

    constraints.push(orderBy(filters.sortBy || 'createdAt', filters.sortDir || 'desc'));

    if (filters.limitCount) {
      constraints.push(limit(filters.limitCount));
    }
    if (filters.startAfterDoc) {
      constraints.push(startAfter(filters.startAfterDoc));
    }

    q = query(q, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductBySlug = async (slug) => {
  try {
    const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const getProductById = async (id) => {
  try {
    const d = await getDoc(doc(db, 'products', id));
    if (!d.exists()) return null;
    return { id: d.id, ...d.data() };
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

export const addProduct = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    await updateDoc(doc(db, 'products', id), {
      ...productData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// ==================== CATEGORIES ====================
export const getCategories = async () => {
  try {
    const q = query(
      collection(db, 'categories'),
      where('status', '==', 'active'),
      orderBy('displayOrder', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const addCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(db, 'categories'), categoryData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const updateCategory = async (id, data) => {
  try {
    await updateDoc(doc(db, 'categories', id), data);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// ==================== ORDERS ====================
export const createOrder = async (orderData) => {
  try {
    const orderId = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;
    
    if (isDemoMode) {
      const newOrder = {
        ...orderData,
        id: orderId,
        orderId,
        orderStatus: 'pending-confirmation',
        paymentStatus: 'pending',
        trackHistory: [{ status: 'pending-confirmation', timestamp: new Date().toISOString(), updatedBy: 'system' }],
        emailSent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const orders = getLocalOrders();
      orders.unshift(newOrder);
      saveLocalOrders(orders);
      return { docId: orderId, orderId };
    }

    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      orderId,
      orderStatus: 'pending-confirmation',
      paymentStatus: 'pending',
      trackHistory: [
        {
          status: 'pending-confirmation',
          timestamp: Timestamp.now(),
          updatedBy: 'system',
        },
      ],
      emailSent: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update customer record
    await upsertCustomer(orderData.customerInfo, orderData.totalAmount);

    return { docId: docRef.id, orderId };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrders = async (filters = {}) => {
  try {
    let constraints = [];

    if (filters.status) {
      constraints.push(where('orderStatus', '==', filters.status));
    }
    if (filters.paymentStatus) {
      constraints.push(where('paymentStatus', '==', filters.paymentStatus));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    if (filters.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    const q = query(collection(db, 'orders'), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const getOrderById = async (id) => {
  try {
    const d = await getDoc(doc(db, 'orders', id));
    if (!d.exists()) return null;
    return { id: d.id, ...d.data() };
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

export const updateOrderStatus = async (id, newStatus, updatedBy = 'admin') => {
  try {
    if (isDemoMode) {
      const orders = getLocalOrders();
      const idx = orders.findIndex(o => o.id === id);
      if (idx !== -1) {
        orders[idx].orderStatus = newStatus;
        orders[idx].trackHistory = orders[idx].trackHistory || [];
        orders[idx].trackHistory.push({ status: newStatus, timestamp: new Date().toISOString(), updatedBy });
        if (newStatus === 'delivered') orders[idx].paymentStatus = 'paid';
        saveLocalOrders(orders);
      }
      return;
    }

    const orderRef = doc(db, 'orders', id);
    const orderSnap = await getDoc(orderRef);
    const currentHistory = orderSnap.data()?.trackHistory || [];

    const updates = {
      orderStatus: newStatus,
      updatedAt: serverTimestamp(),
      trackHistory: [
        ...currentHistory,
        {
          status: newStatus,
          timestamp: Timestamp.now(),
          updatedBy,
        },
      ],
    };

    if (newStatus === 'delivered') {
      updates.paymentStatus = 'paid';
    }

    await updateDoc(orderRef, updates);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const markOrderRead = async (id) => {
  try {
    if (isDemoMode) {
      const orders = getLocalOrders();
      const idx = orders.findIndex(o => o.id === id);
      if (idx !== -1) {
        orders[idx].notificationRead = true;
        saveLocalOrders(orders);
      }
      return;
    }
    const orderRef = doc(db, 'orders', id);
    await updateDoc(orderRef, { notificationRead: true });
  } catch (error) {
    console.error('Error marking order as read:', error);
  }
};

export const subscribeToOrders = (callback) => {
  if (isDemoMode) {
    const emit = () => {
      callback(getLocalOrders());
    };
    emit();
    window.addEventListener('local_orders_updated', emit);
    return () => window.removeEventListener('local_orders_updated', emit);
  }

  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(orders);
  });
};

// ==================== CUSTOM INQUIRIES ====================
export const createInquiry = async (inquiryData) => {
  try {
    const inquiryId = `INQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;
    const docRef = await addDoc(collection(db, 'customInquiries'), {
      ...inquiryData,
      inquiryId,
      quoteStatus: 'new',
      quotedAmount: null,
      adminNotes: '',
      convertedOrderId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { docId: docRef.id, inquiryId };
  } catch (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
};

export const getInquiries = async () => {
  try {
    const q = query(collection(db, 'customInquiries'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return [];
  }
};

export const updateInquiry = async (id, data) => {
  try {
    await updateDoc(doc(db, 'customInquiries', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    throw error;
  }
};

// ==================== CUSTOMERS ====================
export const upsertCustomer = async (customerInfo, orderAmount) => {
  try {
    const q = query(
      collection(db, 'customers'),
      where('phone', '==', customerInfo.phone),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      await addDoc(collection(db, 'customers'), {
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email || '',
        primaryAddress: customerInfo.deliveryAddress || '',
        district: customerInfo.district || '',
        totalOrdersCount: 1,
        lifetimeValue: orderAmount || 0,
        lastOrderDate: serverTimestamp(),
        notes: '',
        createdAt: serverTimestamp(),
      });
    } else {
      const customerDoc = snapshot.docs[0];
      await updateDoc(doc(db, 'customers', customerDoc.id), {
        totalOrdersCount: increment(1),
        lifetimeValue: increment(orderAmount || 0),
        lastOrderDate: serverTimestamp(),
        name: customerInfo.name,
        email: customerInfo.email || customerDoc.data().email,
        primaryAddress: customerInfo.deliveryAddress || customerDoc.data().primaryAddress,
      });
    }
  } catch (error) {
    console.error('Error upserting customer:', error);
  }
};

export const getCustomers = async () => {
  try {
    const q = query(collection(db, 'customers'), orderBy('lastOrderDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

// ==================== ADMIN USERS ====================
export const getAdminUser = async (uid) => {
  try {
    const d = await getDoc(doc(db, 'adminUsers', uid));
    if (!d.exists()) return null;
    return { id: d.id, ...d.data() };
  } catch (error) {
    console.error('Error fetching admin user:', error);
    return null;
  }
};

export const getAdminUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'adminUsers'));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
};

// ==================== SITE CONFIG ====================
export const getSiteConfig = async () => {
  try {
    const d = await getDoc(doc(db, 'siteConfig', 'main'));
    if (!d.exists()) return getDefaultSiteConfig();
    return d.data();
  } catch (error) {
    console.error('Error fetching site config:', error);
    return getDefaultSiteConfig();
  }
};

export const updateSiteConfig = async (data) => {
  try {
    await updateDoc(doc(db, 'siteConfig', 'main'), data);
  } catch (error) {
    console.error('Error updating site config:', error);
    throw error;
  }
};

const getDefaultSiteConfig = () => ({
  deliveryZones: [
    { district: 'colombo-01', name: 'Colombo Fort', fee: 300 },
    { district: 'colombo-02', name: 'Slave Island', fee: 300 },
    { district: 'colombo-03', name: 'Kollupitiya', fee: 300 },
    { district: 'colombo-04', name: 'Bambalapitiya', fee: 350 },
    { district: 'colombo-05', name: 'Havelock Town', fee: 350 },
    { district: 'colombo-06', name: 'Wellawatte', fee: 400 },
    { district: 'colombo-07', name: 'Cinnamon Gardens', fee: 300 },
    { district: 'colombo-08', name: 'Borella', fee: 400 },
    { district: 'colombo-10', name: 'Maradana', fee: 350 },
    { district: 'dehiwala', name: 'Dehiwala', fee: 500 },
    { district: 'mount-lavinia', name: 'Mount Lavinia', fee: 550 },
    { district: 'nugegoda', name: 'Nugegoda', fee: 500 },
    { district: 'maharagama', name: 'Maharagama', fee: 600 },
    { district: 'kottawa', name: 'Kottawa', fee: 700 },
    { district: 'piliyandala', name: 'Piliyandala', fee: 700 },
    { district: 'kaduwela', name: 'Kaduwela', fee: 650 },
    { district: 'malabe', name: 'Malabe', fee: 600 },
    { district: 'battaramulla', name: 'Battaramulla', fee: 550 },
    { district: 'rajagiriya', name: 'Rajagiriya', fee: 450 },
    { district: 'pickup', name: 'Self Pickup (No Delivery Fee)', fee: 0 },
  ],
  businessHours: { open: '08:00', close: '20:00' },
  timeSlots: [
    { value: 'morning', label: 'Morning (8:00 AM - 12:00 PM)' },
    { value: 'afternoon', label: 'Afternoon (12:00 PM - 4:00 PM)' },
    { value: 'evening', label: 'Evening (4:00 PM - 8:00 PM)' },
  ],
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '+94743593784',
  socialLinks: {
    facebook: 'https://www.facebook.com/share/14bDF3uZfRM/',
    instagram: '',
    tiktok: '',
  },
  faqItems: [
    {
      question: 'How far in advance should I place my order?',
      answer: 'For standard birthday cakes, we recommend ordering at least 2-3 days in advance. For wedding cakes and multi-tiered structures, please allow 5-7 days. Rush orders may be accommodated depending on kitchen capacity.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We currently accept Cash on Delivery (COD), Cash on Pickup, and manual bank transfer. Online payment options will be available soon.',
    },
    {
      question: 'Do you deliver across all of Sri Lanka?',
      answer: 'Currently, we deliver within the Colombo metropolitan area and surrounding districts. Delivery fees vary by location. For areas outside our delivery zone, self-pickup is available.',
    },
    {
      question: 'Can I customize the text and design on my cake?',
      answer: 'Absolutely! You can add custom text inscriptions when ordering. For complex custom designs, please use our Custom Order form or contact us via WhatsApp with reference images.',
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Orders can be cancelled up to 48 hours before the requested delivery date for a full refund. Cancellations within 24-48 hours may incur a 25% fee. Same-day cancellations are non-refundable.',
    },
    {
      question: 'How should I store the cake after delivery?',
      answer: 'Keep the cake refrigerated at 4-8°C. Remove from the fridge 30 minutes before serving for the best taste. Fondant-decorated cakes should be kept in a cool, dry place away from direct sunlight.',
    },
    {
      question: 'Do you cater for dietary requirements?',
      answer: 'We can accommodate certain dietary needs like eggless cakes. Please mention your requirements in the special instructions or contact us directly to discuss options.',
    },
    {
      question: 'Can I see photos of previous cakes?',
      answer: 'Yes! Visit our Testimonials & Gallery page to see completed cakes, or check out our Facebook page for the latest creations.',
    },
  ],
  deliveryPolicy: 'Delivery is available within the Colombo metropolitan area. Orders are delivered within the selected time slot on your chosen date. A delivery fee applies based on your district. Please ensure someone is available to receive the cake at the delivery address.',
  cancellationPolicy: 'Orders may be cancelled up to 48 hours before the scheduled delivery date. A full refund will be issued for timely cancellations. Late cancellations may incur charges.',
  termsOfService: 'By placing an order, you agree to our terms of service. All cake designs are subject to ingredient and material availability. Colors and designs may vary slightly from reference images.',
  announcementBanner: { text: '🎂 Free delivery on orders above LKR 5,000! Use code FREEDEL', isActive: true },
});
