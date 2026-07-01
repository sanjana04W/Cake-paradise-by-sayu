import { useState, useEffect, useRef } from 'react';
import { sampleCategories, getParentCategories, sampleProducts } from '../data/sampleProducts';
import { db } from '../firebase/config';
import {
  collection, query, where, orderBy,
  onSnapshot, doc, getDocs,
  limit, serverTimestamp, writeBatch,
} from 'firebase/firestore';

// ── Seed Firestore once with sample data if empty ─────────────────────────────
let _seeded = false;
const seedFirestore = async () => {
  if (_seeded) return;
  _seeded = true;
  try {
    const snap = await getDocs(query(collection(db, 'products'), limit(1)));
    if (!snap.empty) return; // already has data
    const batch = writeBatch(db);
    sampleProducts.forEach(p =>
      batch.set(doc(db, 'products', p.id), {
        ...p, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      })
    );
    await batch.commit();
    console.log('[CakeParadise] Seeded', sampleProducts.length, 'products to Firestore');
  } catch (err) {
    console.warn('[CakeParadise] Could not seed Firestore:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
export const useProducts = (filters = {}) => {
  const filtersKey = JSON.stringify(filters);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    // For development without Firebase, set this to true
    const USE_SAMPLE_DATA = false;
    // Try to seed sample data if Firestore is empty
    seedFirestore();

    const constraints = [
      where('status', '==', 'active')
    ];

    if (filters.categoryId) {
      constraints.push(where('categoryId', '==', filters.categoryId));
    } else if (filters.parentCategoryId) {
      constraints.push(where('parentCategoryId', '==', filters.parentCategoryId));
    }

    const q = query(collection(db, 'products'), ...constraints);

    // Real-time listener — fires immediately and on every admin edit
    const unsub = onSnapshot(
      q,
      (snap) => {
        let result = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (filters.isFeatured)   result = result.filter(p => p.isFeatured);
        if (filters.limitCount)   result = result.slice(0, filters.limitCount);
        setProducts(result);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('[useProducts] Firestore error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [filtersKey]);

  return { products, loading, error };
};

// ─────────────────────────────────────────────────────────────────────────────
export const useProductDetail = (slug) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }

    // Real-time listener on the specific product by slug
    const q = query(
      collection(db, 'products'),
      where('slug', '==', slug),
      limit(1)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          setProduct({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          setProduct(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('[useProductDetail] Firestore error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [slug]);

  return { product, loading, error };
};

// ─────────────────────────────────────────────────────────────────────────────
export const useCategories = () => ({
  categories:       sampleCategories.filter(c => c.status === 'active'),
  parentCategories: getParentCategories(),
  loading: false,
  error:   null,
});