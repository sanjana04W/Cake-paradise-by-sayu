import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { formatCurrency, getStockStatusDisplay } from '../../utils/formatters';
import ProductForm from '../../components/admin/ProductForm';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, where } from 'firebase/firestore';

/* ─── Stock Badge ─── */
const StockBadge = ({ status }) => {
  const d = getStockStatusDisplay(status || 'made-to-order');
  const colorMap = {
    'badge-success': 'bg-green-100 text-green-700',
    'badge-warning':  'bg-yellow-100 text-yellow-700',
    'badge-danger':   'bg-red-100 text-red-700',
    'badge-info':     'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${colorMap[d.class] || colorMap['badge-info']}`}>
      {d.label}
    </span>
  );
};

/* ─── Map raw product to table row ─── */
const toRow = (p) => ({
  id:          p.id,
  name:        p.name,
  description: p.shortDescription || p.description || '',
  category:    p.parentCategoryId || p.categoryId || p.category || '',
  basePrice:   p.basePrice,
  stockStatus: p.stockStatus,
  images:      p.images || [],
  _raw:        p,
});

const Products = () => {
  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm,       setShowForm]       = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    // Subscribe directly to Firestore — same source the website Shop uses
    // Admin sees ALL products (no status filter); shop only sees 'active' ones
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const all = snapshot.docs.map((d) => toRow({ id: d.id, ...d.data() }));
        setProducts(all);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      // No need to manually update state — onSnapshot fires automatically
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete product: ' + err.message);
    }
  };

  const filtered = products.filter(p => {
    const matchSearch   = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Products Manager</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your entire cake catalog.</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 bg-[#B76E79] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#a6626d] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Permission error banner */}
      {error && error.includes('permission') && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <strong>Firestore permission error:</strong> Make sure you are logged in as admin and the Firestore rules allow authenticated writes.
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Search products…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#B76E79] outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#B76E79] outline-none bg-white"
            >
              <option value="all">All Categories</option>
              <option value="celebration-custom-cakes">Celebration & Custom Cakes</option>
              <option value="wedding-structure-cakes">Wedding & Structure Cakes</option>
              <option value="cupcakes-party">Cupcakes & Party Confectioneries</option>
              <option value="seasonal-specials">Seasonal & Holiday Specials</option>
              <option value="quick-pick-ready">Quick-Pick & Ready Designs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm text-gray-400">Loading products…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Base Price</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Availability</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length > 0 ? filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#F7E7CE] flex-shrink-0 overflow-hidden">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1ea236?q=80&w=200&auto=format&fit=crop'}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize whitespace-nowrap">{p.category || '—'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 text-right whitespace-nowrap">{formatCurrency(p.basePrice)}</td>
                    <td className="px-6 py-4"><StockBadge status={p.stockStatus} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingProduct(p._raw); setShowForm(true); }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-sm text-gray-400">
                      No products found. Click "Add Product" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
          onSuccess={() => { setShowForm(false); setEditingProduct(null); }}
        />
      )}
    </div>
  );
};

export default Products;
