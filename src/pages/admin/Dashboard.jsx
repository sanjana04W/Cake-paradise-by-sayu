import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Clock, AlertTriangle, Activity, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToOrders } from '../../firebase/firestore';
import { getLocalProducts, subscribeProducts } from '../../data/localProductStore';
import { SeedFirebaseButton } from '../../components/admin/SeedFirebaseButton';

/* ─── Stat Card ─── */
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-500 mb-0.5">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {trend === 'up'
          ? <TrendingUp className="w-3.5 h-3.5 text-green-500" />
          : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
        <span className={`text-xs font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>{trendValue}</span>
        <span className="text-xs text-gray-400">vs last month</span>
      </div>
    </div>
  </div>
);

/* ─── Status Badge ─── */
const StatusBadge = ({ status }) => {
  const map = {
    delivered:            { label: 'Delivered',   cls: 'bg-green-100 text-green-700' },
    'pending-confirmation': { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-700' },
    confirmed:            { label: 'Confirmed',   cls: 'bg-blue-100 text-blue-700' },
    processing:           { label: 'Processing',  cls: 'bg-purple-100 text-purple-700' },
    ready:                { label: 'Ready',        cls: 'bg-teal-100 text-teal-700' },
    dispatched:           { label: 'Dispatched',  cls: 'bg-orange-100 text-orange-700' },
    cancelled:            { label: 'Cancelled',   cls: 'bg-red-100 text-red-700' },
  };
  const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${s.cls}`}>{s.label}</span>;
};

/* ─── Dashboard ─── */
const Dashboard = () => {
  const { checkPermission } = useAuth();
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get real low stock from products
    const updateLowStock = () => {
      const products = getLocalProducts();
      const lowStock = products.filter(p => 
        p.stockStatus === 'low-stock' || 
        (p.stockStatus === 'in-stock' && p.stockQuantity !== null && p.stockQuantity <= (p.lowStockThreshold || 3))
      ).map(p => ({
        name: p.name,
        qty: p.stockQuantity !== null ? p.stockQuantity : null
      })).slice(0, 5); // top 5
      setLowStockItems(lowStock);
    };

    updateLowStock();
    const unsubProducts = subscribeProducts(updateLowStock);

    // 2. Subscribe to real orders
    const unsubscribe = subscribeToOrders((data) => {
      // Calculate Stats
      const totalOrders = data.length;
      const revenue = data.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const pending = data.filter(o => o.orderStatus === 'pending-confirmation').length;
      
      // Unique customers (by email or phone)
      const uniqueCustomers = new Set(data.map(o => o.customerInfo?.email || o.customerInfo?.phone).filter(Boolean));
      
      setStats({
        revenue,
        orders: totalOrders,
        customers: uniqueCustomers.size,
        pendingOrders: pending
      });

      // Recent Orders (sort by date descending, take 5)
      const sorted = [...data].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      const formattedRecent = sorted.slice(0, 5).map(o => ({
        id: o.orderId || o.id,
        customerInfo: o.customerInfo,
        createdAt: o.createdAt,
        status: o.orderStatus,
        total: o.totalAmount
      }));

      setRecentOrders(formattedRecent);
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubscribe();
    };
  }, []);

  if (!checkPermission('dashboard')) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Access Denied</h2>
        <p className="text-sm text-gray-500">You do not have permission to view the dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B76E79]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's what's happening at Cake Paradise.</p>
        </div>
        <SeedFirebaseButton />
        <p className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          Updated: {new Date().toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Total Revenue"     value={formatCurrency(stats.revenue)}  icon={DollarSign}  trend="up"   trendValue="+12.5%" color="bg-[#9CAF88]" />
        <StatCard title="Total Orders"      value={stats.orders}                   icon={ShoppingBag} trend="up"   trendValue="+8.2%"  color="bg-[#B76E79]" />
        <StatCard title="Total Customers"   value={stats.customers}                icon={Users}       trend="up"   trendValue="+5.1%"  color="bg-[#E8A0BF]" />
        <StatCard title="Pending Orders"    value={stats.pendingOrders}            icon={Clock}       trend="down" trendValue="-2.4%"  color="bg-amber-400"  />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Orders Table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 font-display">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-[#B76E79] font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length > 0 ? recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-gray-800">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.customerInfo?.name || 'Guest'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{order.createdAt?.toDate ? formatDate(order.createdAt) : (order.createdAt && !isNaN(new Date(order.createdAt)) ? formatDate(order.createdAt) : '—')}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 text-right">{formatCurrency(order.total || 0)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-400">No orders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h2 className="text-base font-bold text-gray-900 font-display">Low Stock Alerts</h2>
              <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div className="space-y-3">
              {lowStockItems.length > 0 ? lowStockItems.map(item => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                  <span className="text-sm font-medium text-gray-800 truncate">{item.name}</span>
                  <span className="text-xs font-bold text-red-600 bg-white px-2 py-0.5 rounded-full border border-red-200 ml-2 flex-shrink-0">
                    {item.qty !== null ? `${item.qty} left` : 'Low Stock'}
                  </span>
                </div>
              )) : (
                <div className="text-sm text-gray-400 p-3 text-center bg-gray-50 rounded-xl border border-gray-100">
                  No low stock alerts. You're fully stocked!
                </div>
              )}
            </div>
          </div>

          {/* Flavor Heatmap */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 font-display mb-4">Top Flavors (7 Days)</h2>
            <div className="space-y-4">
              {[
                { flavor: 'Classic Chocolate', pct: 85 },
                { flavor: 'Red Velvet',         pct: 65 },
                { flavor: 'Vanilla Bean',        pct: 45 },
                { flavor: 'Salted Caramel',      pct: 30 },
              ].map(item => (
                <div key={item.flavor}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-600">{item.flavor}</span>
                    <span className="text-xs font-bold text-gray-500">{item.pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.pct}%`, backgroundColor: `hsl(351,35%,${100 - item.pct / 2}%)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[#B76E79]" />
              <h2 className="text-base font-bold text-gray-900 font-display">Live Activity</h2>
            </div>
            <ol className="relative border-l-2 border-gray-100 space-y-5 ml-2">
              {[
                { time: '2m ago',   event: 'New custom inquiry received', user: 'Kasun F.' },
                { time: '15m ago',  event: 'Order #ORD-12A delivered',    user: 'Driver: Kamal' },
                { time: '1h ago',   event: 'Promo SWEET10 applied',       user: 'Checkout' },
              ].map((act, i) => (
                <li key={i} className="ml-4">
                  <span className="absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full bg-[#B76E79] border-2 border-white" />
                  <p className="text-xs font-semibold text-gray-800">{act.event}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-gray-400">{act.user}</span>
                    <span className="text-[11px] text-[#B76E79] font-medium">{act.time}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
