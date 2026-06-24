import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, addDoc, updateDoc, deleteDoc, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Tag, Plus, Edit2, Trash2, X, Save, BarChart3, TrendingUp, DollarSign, ShoppingBag, Calendar, Copy, CheckCircle, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

// Demo promos
const demoPromotions = [
  { id: 'P001', code: 'SWEET10', description: '10% off all cakes', type: 'percentage', value: 10, minOrderAmount: 2000, maxUses: 100, usedCount: 34, isActive: true, startDate: '2026-06-01', endDate: '2026-06-30', createdAt: { toDate: () => new Date('2026-06-01') } },
  { id: 'P002', code: 'WEDDING20', description: '20% off wedding cakes', type: 'percentage', value: 20, minOrderAmount: 10000, maxUses: 25, usedCount: 8, isActive: true, startDate: '2026-06-01', endDate: '2026-08-31', createdAt: { toDate: () => new Date('2026-06-01') }, appliesTo: 'wedding-cakes' },
  { id: 'P003', code: 'BDAY500', description: 'LKR 500 off birthday cakes', type: 'fixed', value: 500, minOrderAmount: 3500, maxUses: 50, usedCount: 21, isActive: true, startDate: '2026-05-15', endDate: '2026-07-15', createdAt: { toDate: () => new Date('2026-05-15') } },
  { id: 'P004', code: 'WELCOME15', description: '15% off first order', type: 'percentage', value: 15, minOrderAmount: 1500, maxUses: 200, usedCount: 67, isActive: false, startDate: '2026-01-01', endDate: '2026-05-31', createdAt: { toDate: () => new Date('2026-01-01') } },
];

// Demo sales data for reports
const monthlyRevenue = [
  { month: 'Jan', revenue: 78500, orders: 23 },
  { month: 'Feb', revenue: 92300, orders: 28 },
  { month: 'Mar', revenue: 105800, orders: 35 },
  { month: 'Apr', revenue: 88200, orders: 27 },
  { month: 'May', revenue: 124500, orders: 41 },
  { month: 'Jun', revenue: 68700, orders: 19 },
];

const topProducts = [
  { name: 'Classic Chocolate Mud Cake', sold: 45, revenue: 247500 },
  { name: 'Red Velvet Supreme', sold: 38, revenue: 228000 },
  { name: 'Vanilla Dream Layer Cake', sold: 32, revenue: 160000 },
  { name: 'Signature Birthday Cake', sold: 28, revenue: 196000 },
  { name: 'Strawberry Bliss Cheesecake', sold: 24, revenue: 120000 },
];

const PromoForm = ({ promo, onSave, onCancel }) => {
  const [form, setForm] = useState({
    code: promo?.code || '',
    description: promo?.description || '',
    type: promo?.type || 'percentage',
    value: promo?.value || '',
    minOrderAmount: promo?.minOrderAmount || '',
    maxUses: promo?.maxUses || '',
    startDate: promo?.startDate || new Date().toISOString().split('T')[0],
    endDate: promo?.endDate || '',
    isActive: promo?.isActive ?? true,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = 'Code is required';
    if (!form.value || Number(form.value) <= 0) e.value = 'Valid value required';
    if (form.type === 'percentage' && Number(form.value) > 100) e.value = 'Max 100%';
    if (!form.endDate) e.endDate = 'End date required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...form,
      code: form.code.toUpperCase().replace(/\s/g, ''),
      value: Number(form.value),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxUses: Number(form.maxUses) || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{promo ? 'Edit Promotion' : 'New Promotion'}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code *</label>
            <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              className={`w-full border rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#B76E79] ${errors.code ? 'border-red-300' : 'border-gray-200'}`}
              placeholder="SWEET10" />
            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B76E79]"
              placeholder="10% off all cakes" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B76E79]">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (LKR)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
              <input type="number" min="0" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B76E79] ${errors.value ? 'border-red-300' : 'border-gray-200'}`}
                placeholder={form.type === 'percentage' ? '10' : '500'} />
              {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (LKR)</label>
              <input type="number" min="0" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B76E79]"
                placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
              <input type="number" min="1" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B76E79]"
                placeholder="Unlimited" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B76E79]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B76E79] ${errors.endDate ? 'border-red-300' : 'border-gray-200'}`} />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm text-gray-600">{form.isActive ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-2.5 bg-[#B76E79] text-white rounded-xl font-semibold text-sm hover:bg-[#a15d67] transition-colors">
              {promo ? 'Save Changes' : 'Create Promotion'}
            </button>
            <button type="button" onClick={onCancel} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Promotions = () => {
  const [activeTab, setActiveTab] = useState('promotions');
  const [promotions, setPromotions] = useState(demoPromotions);
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    try {
      const q = query(collection(db, 'promotions'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, snap => {
        if (snap.docs.length > 0) setPromotions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, () => {});
      return () => unsub();
    } catch {}
  }, []);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = async (data) => {
    if (editingPromo) {
      // Update
      try {
        await updateDoc(doc(db, 'promotions', editingPromo.id), { ...data, updatedAt: serverTimestamp() });
      } catch {
        setPromotions(prev => prev.map(p => p.id === editingPromo.id ? { ...p, ...data } : p));
      }
      notify('Promotion updated!');
    } else {
      // Create
      const newPromo = { ...data, id: `P${Date.now()}`, usedCount: 0, createdAt: { toDate: () => new Date() } };
      try {
        const docRef = await addDoc(collection(db, 'promotions'), { ...data, usedCount: 0, createdAt: serverTimestamp() });
        newPromo.id = docRef.id;
      } catch {}
      setPromotions(prev => [newPromo, ...prev]);
      notify('Promotion created!');
    }
    setShowForm(false);
    setEditingPromo(null);
  };

  const handleDelete = async (promo) => {
    if (!confirm(`Delete promo "${promo.code}"?`)) return;
    try { await deleteDoc(doc(db, 'promotions', promo.id)); } catch {}
    setPromotions(prev => prev.filter(p => p.id !== promo.id));
    notify('Promotion deleted');
  };

  const handleToggle = async (promo) => {
    const newStatus = !promo.isActive;
    try { await updateDoc(doc(db, 'promotions', promo.id), { isActive: newStatus }); } catch {}
    setPromotions(prev => prev.map(p => p.id === promo.id ? { ...p, isActive: newStatus } : p));
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    notify(`${code} copied!`);
  };

  // Report calculations
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const totalOrders = monthlyRevenue.reduce((s, m) => s + m.orders, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));

  const activePromos = promotions.filter(p => p.isActive).length;
  const totalRedemptions = promotions.reduce((s, p) => s + (p.usedCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg bg-green-500 text-white text-sm font-medium">
          <CheckCircle size={16} /> {notification}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Promotions & Reports</h1>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('promotions')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'promotions' ? 'bg-[#B76E79] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#B76E79]'}`}>
            <Tag size={14} className="inline mr-1.5" />Promotions
          </button>
          <button onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'reports' ? 'bg-[#B76E79] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#B76E79]'}`}>
            <BarChart3 size={14} className="inline mr-1.5" />Reports
          </button>
        </div>
      </div>

      {/* ============= PROMOTIONS TAB ============= */}
      {activeTab === 'promotions' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Promotions', value: promotions.length, icon: Tag, color: 'bg-purple-50 text-purple-700' },
              { label: 'Active', value: activePromos, icon: CheckCircle, color: 'bg-green-50 text-green-700' },
              { label: 'Total Redemptions', value: totalRedemptions, icon: ShoppingBag, color: 'bg-blue-50 text-blue-700' },
              { label: 'Avg Conversion', value: `${promotions.length > 0 ? Math.round(totalRedemptions / promotions.length) : 0}/promo`, icon: TrendingUp, color: 'bg-amber-50 text-amber-700' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}><Icon size={18} /></div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  <p className="text-[11px] text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Button */}
          <div className="flex justify-end">
            <button onClick={() => { setEditingPromo(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#B76E79] text-white rounded-xl font-semibold text-sm hover:bg-[#a15d67] transition-colors shadow-sm">
              <Plus size={16} /> New Promotion
            </button>
          </div>

          {/* Promo Cards */}
          <div className="space-y-3">
            {promotions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                <Tag size={40} className="mx-auto mb-3 opacity-40" />
                <p>No promotions yet. Create your first one!</p>
              </div>
            ) : promotions.map(promo => {
              const isExpired = promo.endDate && new Date(promo.endDate) < new Date();
              const usagePercent = promo.maxUses ? Math.round((promo.usedCount / promo.maxUses) * 100) : null;
              return (
                <div key={promo.id} className={`bg-white rounded-xl border shadow-sm p-5 transition-colors ${promo.isActive && !isExpired ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${promo.type === 'percentage' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'} font-bold text-sm`}>
                        {promo.type === 'percentage' ? `${promo.value}%` : formatCurrency(promo.value)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button onClick={() => handleCopyCode(promo.code)}
                            className="font-mono font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded text-sm hover:bg-[#B76E79]/10 hover:text-[#B76E79] transition-colors flex items-center gap-1.5">
                            {promo.code} <Copy size={11} className="opacity-50" />
                          </button>
                          {promo.isActive && !isExpired && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                          {isExpired && <span className="text-[10px] text-red-500 font-semibold uppercase">Expired</span>}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{promo.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span><Calendar size={10} className="inline mr-0.5" /> {promo.startDate} → {promo.endDate}</span>
                          {promo.minOrderAmount > 0 && <span>Min: {formatCurrency(promo.minOrderAmount)}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Usage */}
                      <div className="text-right min-w-[80px]">
                        <p className="text-sm font-semibold text-gray-900">{promo.usedCount}{promo.maxUses ? `/${promo.maxUses}` : ''}</p>
                        {usagePercent !== null && (
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
                            <div className={`h-full rounded-full ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(usagePercent, 100)}%` }} />
                          </div>
                        )}
                        <p className="text-[10px] text-gray-400">uses</p>
                      </div>
                      {/* Toggle */}
                      <button onClick={() => handleToggle(promo)} title={promo.isActive ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded-lg transition-colors ${promo.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                        {promo.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                      {/* Edit */}
                      <button onClick={() => { setEditingPromo(promo); setShowForm(true); }}
                        className="p-1.5 bg-[#B76E79]/10 text-[#B76E79] rounded-lg hover:bg-[#B76E79]/20 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      {/* Delete */}
                      <button onClick={() => handleDelete(promo)}
                        className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ============= REPORTS TAB ============= */}
      {activeTab === 'reports' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'bg-green-50 text-green-700' },
              { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-700' },
              { label: 'Avg Order Value', value: formatCurrency(avgOrderValue), icon: TrendingUp, color: 'bg-purple-50 text-purple-700' },
              { label: 'Best Month', value: monthlyRevenue.reduce((best, m) => m.revenue > best.revenue ? m : best).month, icon: Calendar, color: 'bg-amber-50 text-amber-700' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}><Icon size={18} /></div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                  <p className="text-[11px] text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Chart (CSS bar chart) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Monthly Revenue</h2>
            <p className="text-xs text-gray-400 mb-6">Revenue trend for {new Date().getFullYear()}</p>
            <div className="flex items-end gap-3 h-48">
              {monthlyRevenue.map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700">{formatCurrency(m.revenue)}</span>
                  <div className="w-full relative rounded-t-lg overflow-hidden" style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: '8px' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#B76E79] to-[#E8A0BF] rounded-t-lg" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-medium text-gray-600">{m.month}</span>
                    <p className="text-[10px] text-gray-400">{m.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Top Selling Products</h2>
              <p className="text-xs text-gray-400 mt-0.5">Based on total units sold</p>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">#</th>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium text-center">Units Sold</th>
                  <th className="p-4 font-medium text-right">Revenue</th>
                  <th className="p-4 font-medium">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProducts.map((p, i) => {
                  const maxSold = topProducts[0].sold;
                  const perf = Math.round((p.sold / maxSold) * 100);
                  return (
                    <tr key={p.name} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <span className={`w-7 h-7 inline-flex items-center justify-center rounded-full text-xs font-bold ${
                          i === 0 ? 'bg-amber-100 text-amber-800' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                        }`}>{i + 1}</span>
                      </td>
                      <td className="p-4 font-medium text-sm text-gray-900">{p.name}</td>
                      <td className="p-4 text-center text-sm font-semibold text-gray-800">{p.sold}</td>
                      <td className="p-4 text-right text-sm font-semibold text-gray-900">{formatCurrency(p.revenue)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#B76E79] to-[#E8A0BF] rounded-full" style={{ width: `${perf}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{perf}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue by Category</h2>
            <div className="space-y-3">
              {[
                { name: 'Birthday Cakes', pct: 35, revenue: 195930 },
                { name: 'Wedding Cakes', pct: 25, revenue: 139950 },
                { name: 'Cupcakes & Minis', pct: 18, revenue: 100764 },
                { name: 'Specialty Cakes', pct: 14, revenue: 78372 },
                { name: 'Custom Orders', pct: 8, revenue: 44784 },
              ].map(cat => (
                <div key={cat.name} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 w-36 shrink-0">{cat.name}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-[#B76E79] to-[#E8A0BF] rounded-full transition-all duration-500"
                      style={{ width: `${cat.pct}%` }} />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-500">{cat.pct}%</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-24 text-right">{formatCurrency(cat.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Promo Form Modal */}
      {showForm && (
        <PromoForm promo={editingPromo} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingPromo(null); }} />
      )}
    </div>
  );
};

export default Promotions;
