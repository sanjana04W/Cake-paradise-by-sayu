/**
 * localProductStore.js
 *
 * Uses localStorage as the data store.
 * The native browser `storage` event fires in every OTHER tab on the same
 * origin (including localhost:5173 when admin on localhost:5174 writes) —
 * this is the cross-tab sync mechanism. No BroadcastChannel needed.
 */

import { sampleProducts } from './sampleProducts';

const STORE_KEY   = 'cp_products_v1';
const DELETED_KEY = 'cp_deleted_v1';

// In-memory cache — per tab, rebuilt whenever localStorage changes
let _cache = null;

// ── Build full merged list from localStorage ──────────────────────────────────
const buildAll = () => {
  try {
    const overrides = JSON.parse(localStorage.getItem(STORE_KEY)   || '{}');
    const deleted   = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
    const sampleIds = new Set(sampleProducts.map(p => p.id));

    const base = sampleProducts
      .filter(p => !deleted.includes(p.id))
      .map(p => ({ ...p, ...(overrides[p.id] ?? {}) }));

    const extras = Object.values(overrides)
      .filter(p => !sampleIds.has(p.id) && !deleted.includes(p.id));

    return [...base, ...extras];
  } catch {
    return [...sampleProducts];
  }
};

// ── Subscriber registry (in-tab, for same-tab React hooks) ───────────────────
const _subs = new Set();

// ── Listen to localStorage changes from OTHER tabs ────────────────────────────
// The `storage` event only fires in tabs that did NOT make the change.
window.addEventListener('storage', (e) => {
  if (e.key === STORE_KEY || e.key === DELETED_KEY) {
    _cache = null; // invalidate cache
    const fresh = buildAll();
    _cache = fresh;
    _subs.forEach(fn => fn(fresh));
  }
});

// ── Publish to same-tab subscribers ──────────────────────────────────────────
const publish = () => {
  _cache = buildAll();
  _subs.forEach(fn => fn(_cache));
};

// ── Public API ────────────────────────────────────────────────────────────────

export const getLocalProducts = () => {
  if (!_cache) _cache = buildAll();
  return _cache;
};

export const getLocalProductById = (id) =>
  getLocalProducts().find(p => p.id === id) ?? null;

export const getLocalProductBySlug = (slug) =>
  getLocalProducts().find(p => p.slug === slug) ?? null;

/**
 * Subscribe to product list changes.
 * Fires for both same-tab writes and cross-tab storage events.
 * Returns an unsubscribe function.
 */
export const subscribeProducts = (fn) => {
  _subs.add(fn);
  return () => _subs.delete(fn);
};

/** Add or update a product */
export const saveLocalProduct = (product) => {
  const overrides = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
  overrides[product.id] = { ...product, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORE_KEY, JSON.stringify(overrides));
  // storage event fires in other tabs automatically
  // manually publish to same-tab subscribers
  publish();
};

/** Delete a product */
export const deleteLocalProduct = (id) => {
  const overrides = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
  delete overrides[id];
  localStorage.setItem(STORE_KEY, JSON.stringify(overrides));

  const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
  if (!deleted.includes(id)) {
    deleted.push(id);
    localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
  }
  publish();
};

export const generateProductId = () =>
  `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const generateSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
