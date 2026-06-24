import React, { useState, useEffect, useCallback } from 'react';
import { Package, AlertTriangle, CheckCircle, Search, Edit2, Save, X, ArrowUpDown, Filter } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { getLocalProducts, saveLocalProduct, subscribeProducts } from '../../data/localProductStore';

const USE_SAMPLE = true;

const StockBadge = ({ status, quantity }) => {
  const map = {
    'in-stock': { label: 'In Stock', cls: 'bg-green-100 text-green-800' },
    'made-to-order': { label: 'Made to Order', cls: 'bg-blue-100 text-blue-800' },
    'low-stock': { label: 'Low Stock', cls: 'bg-yellow-100 text-yellow-800' },
    'out-of-stock': { label: 'Out of Stock', cls: 'bg-red-100 text-red-800' },
    'draft': { label: 'Draft', cls: 'bg-gray-100 text-gray-600' },
  };
  const s = map[status] || map['made-to-order'];
  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${s.cls}`}>{s.label}</span>
      {quantity !== null && quantity !== undefined && (
        <span className="text-sm font-medium text-gray-700">{quantity} pcs</span>
      )}
    </div>
  );
};

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const loadProducts = useCallback(() => {
    const all = getLocalProducts();
    setProducts(all.map(p => ({
      id:                p.id,
      name:              p.name,
      sku:               p.sku || '',
      categoryId:        p.categoryId || '',
      stockStatus:       p.stockStatus || 'made-to-order',
      stockQuantity:     p.stockQuantity ?? null,
      lowStockThreshold: p.lowStockThreshold ?? 3,
      basePrice:         p.basePrice || 0,
      leadTimeDays:      p.leadTimeDays ?? 1,
      status:            p.status || 'active',
    })));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
    const unsub = subscribeProducts(() => loadProducts());
    return () => unsub();
  }, [loadProducts]);

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditValues({
      stockStatus: product.stockStatus,
      stockQuantity: product.stockQuantity ?? '',
      lowStockThreshold: product.lowStockThreshold ?? 3,
      leadTimeDays: product.leadTimeDays ?? 1,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = (productId) => {
    const updates = {
      stockStatus:       editValues.stockStatus,
      stockQuantity:     editValues.stockQuantity === '' ? null : Number(editValues.stockQuantity),
      lowStockThreshold: Number(editValues.lowStockThreshold),
      leadTimeDays:      Number(editValues.leadTimeDays),
    };

    // Find the full product from the local store and merge updates into it
    const allProducts = getLocalProducts();
    const full = allProducts.find(p => p.id === productId);
    if (full) {
      saveLocalProduct({ ...full, ...updates });
      // products_updated event fires automatically → loadProducts re-runs → table refreshes
    }

    setEditingId(null);
    setEditValues({});
  };

  // Stats
  const totalProducts = products.length;
  const inStock = products.filter(p => p.stockStatus === 'in-stock').length;
  const madeToOrder = products.filter(p => p.stockStatus === 'made-to-order').length;
  const lowStock = products.filter(p => p.stockStatus === 'low-stock' || (p.stockStatus === 'in-stock' && p.stockQuantity !== null && p.stockQuantity <= (p.lowStockThreshold || 3))).length;
  const outOfStock = products.filter(p => p.stockStatus === 'out-of-stock').length;

  // Filter & Sort
  let filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.stockStatus === statusFilter ||
      (statusFilter === 'low-stock-alert' && p.stockStatus === 'in-stock' && p.stockQuantity !== null && p.stockQuantity <= (p.lowStockThreshold || 3));
    return matchSearch && matchStatus;
  });

  filtered.sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortBy === 'quantity') cmp = (a.stockQuantity ?? 9999) - (b.stockQuantity ?? 9999);
    else if (sortBy === 'price') cmp = a.basePrice - b.basePrice;
    else if (sortBy === 'leadTime') cmp = (a.leadTimeDays || 0) - (b.leadTimeDays || 0);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const SortHeader = ({ field, children }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-1 text-xs uppercase tracking-wider font-medium text-gray-500 hover:text-gray-700">
      {children}
      <ArrowUpDown size={12} className={sortBy === field ? 'text-[#B76E79]' : 'opacity-30'} />
    </button>
  );

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">Inventory Control</h1>
        <p className="text-sm text-gray-500 mt-0.5">Monitor stock levels, lead times, and kitchen capacity.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Products',   value: totalProducts,  icon: Package,       color: 'bg-gray-100 text-gray-700' },
          { label: 'In Stock',         value: inStock,        icon: CheckCircle,   color: 'bg-green-100 text-green-700' },
          { label: 'Made to Order',    value: madeToOrder,    icon: Package,       color: 'bg-blue-100 text-blue-700' },
          { label: 'Low Stock',        value: lowStock,       icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-700' },
          { label: 'Out of Stock',     value: outOfStock,     icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name or SKU…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B76E79]" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B76E79]">
            <option value="all">All Statuses</option>
            <option value="in-stock">In Stock</option>
            <option value="made-to-order">Made to Order</option>
            <option value="low-stock-alert">⚠ Low Stock Alerts</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Kitchen Capacity Calendar */}
      <div className="bg-white rounded-2xl border border-[#B76E79]/20 shadow-sm overflow-hidden">
        <div className="bg-[#B76E79]/5 px-6 py-4 border-b border-[#B76E79]/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 font-display">Kitchen Capacity Calendar</h2>
            <p className="text-xs text-gray-500 mt-0.5">Set maximum daily order thresholds to prevent over-booking.</p>
          </div>
          <button className="text-xs font-semibold text-[#B76E79] bg-white border border-[#B76E79]/30 px-3 py-1.5 rounded-lg hover:bg-[#B76E79]/10 transition-colors">
            Holiday Overrides
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={day} className="border border-gray-200 rounded-xl p-3 bg-gray-50 flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{day}</span>
                <input
                  type="number"
                  defaultValue={i > 4 ? 15 : 10}
                  className="w-full text-center font-bold text-lg text-[#B76E79] border-0 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-[#B76E79] outline-none py-1"
                />
                <span className="text-[10px] text-gray-400 mt-1.5">per day</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading inventory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4"><SortHeader field="name">Product</SortHeader></th>
                  <th className="p-4 text-xs uppercase tracking-wider font-medium text-gray-500 whitespace-nowrap">SKU</th>
                  <th className="p-4 whitespace-nowrap">Stock Status</th>
                  <th className="p-4"><SortHeader field="quantity">Qty</SortHeader></th>
                  <th className="p-4 hidden lg:table-cell text-xs uppercase tracking-wider font-medium text-gray-500">Threshold</th>
                  <th className="p-4"><SortHeader field="leadTime">Lead Days</SortHeader></th>
                  <th className="p-4 text-right text-xs uppercase tracking-wider font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-400">No products match your filter.</td></tr>
                ) : filtered.map(p => {
                  const isEditing = editingId === p.id;
                  const isLow = p.stockStatus === 'in-stock' && p.stockQuantity !== null && p.stockQuantity <= (p.lowStockThreshold || 3);
                  return (
                    <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${isLow ? 'bg-yellow-50/50' : ''}`}>
                      <td className="p-4">
                        <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                      </td>
                      <td className="p-4 text-xs text-gray-500 font-mono whitespace-nowrap">{p.sku || '—'}</td>
                      <td className="p-4">
                        {isEditing ? (
                          <select value={editValues.stockStatus} onChange={e => setEditValues(v => ({ ...v, stockStatus: e.target.value }))}
                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-[#B76E79]">
                            <option value="in-stock">In Stock</option>
                            <option value="made-to-order">Made to Order</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                            <option value="draft">Draft</option>
                          </select>
                        ) : (
                          <StockBadge status={p.stockStatus} />
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <input type="number" min="0" value={editValues.stockQuantity}
                            onChange={e => setEditValues(v => ({ ...v, stockQuantity: e.target.value }))}
                            className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-[#B76E79]" />
                        ) : (
                          <span className={`text-sm font-medium ${isLow ? 'text-yellow-700' : 'text-gray-700'}`}>
                            {p.stockQuantity !== null && p.stockQuantity !== undefined ? p.stockQuantity : '—'}
                            {isLow && <AlertTriangle size={12} className="inline ml-1 text-yellow-500" />}
                          </span>
                        )}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        {isEditing ? (
                          <input type="number" min="1" value={editValues.lowStockThreshold}
                            onChange={e => setEditValues(v => ({ ...v, lowStockThreshold: e.target.value }))}
                            className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-[#B76E79]" />
                        ) : (
                          <span className="text-sm text-gray-500">{p.lowStockThreshold || 3}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <input type="number" min="0" value={editValues.leadTimeDays}
                            onChange={e => setEditValues(v => ({ ...v, leadTimeDays: e.target.value }))}
                            className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-[#B76E79]" />
                        ) : (
                          <span className="text-sm text-gray-600">{p.leadTimeDays ?? 1}d</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => saveEdit(p.id)}
                              className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors" title="Save">
                              <Save size={14} />
                            </button>
                            <button onClick={cancelEdit}
                              className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors" title="Cancel">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(p)}
                            className="p-1.5 bg-[#B76E79]/10 text-[#B76E79] rounded-lg hover:bg-[#B76E79]/20 transition-colors" title="Edit">
                            <Edit2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
