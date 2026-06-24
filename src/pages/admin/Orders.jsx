import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Search, Filter, Eye } from 'lucide-react';
import { formatCurrency, getOrderStatusDisplay, getNextStatuses, formatDate } from '../../utils/formatters';
import OrderDetailModal from '../../components/admin/OrderDetailModal';

const StatusBadge = ({ status }) => {
  const d = getOrderStatusDisplay(status || 'pending-confirmation');
  return (
    <span
      className="px-2.5 py-1 text-xs font-semibold rounded-full"
      style={{ backgroundColor: `${d.color}18`, color: d.color }}
    >
      {d.label}
    </span>
  );
};

const ALL_STATUSES = [
  'pending-confirmation',
  'confirmed',
  'processing',
  'ready',
  'dispatched',
  'delivered',
  'cancelled'
];

const Orders = () => {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId]   = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};
    
    import('../../firebase/firestore').then(({ subscribeToOrders }) => {
      unsubscribe = subscribeToOrders((data) => {
        const formattedOrders = data.map(o => ({
          id: o.orderId || o.id,
          customerInfo: o.customerInfo,
          createdAt: o.createdAt,
          status: o.orderStatus,
          total: o.totalAmount,
          items: o.items,
          dbId: o.id,
          paymentMethod: o.paymentMethod,
          paymentDetails: o.paymentDetails
        }));
        setOrders(formattedOrders);
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const order = orders.find(o => o.id === orderId);
      if (order && order.dbId) {
        const { updateOrderStatus } = await import('../../firebase/firestore');
        await updateOrderStatus(order.dbId, newStatus);
        
        // Update local selectedOrder if open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (e) {
      console.error('Error updating status:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customerInfo?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">Orders Manager</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track, manage and update all customer orders.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or customer name…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#B76E79] outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#B76E79] outline-none bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending-confirmation">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="ready">Ready for Delivery</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm text-gray-400">Loading orders…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order / Date</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Items</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length > 0 ? filtered.map(order => {
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-mono font-semibold text-gray-800">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{order.createdAt?.toDate ? formatDate(order.createdAt) : (order.createdAt && !isNaN(new Date(order.createdAt)) ? formatDate(order.createdAt) : '—')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-800">{order.customerInfo?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{order.customerInfo?.phone || ''}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center">{order.items?.length || 0}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800 text-right">{formatCurrency(order.total || 0)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <StatusBadge status={order.status} />
                          <select
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white w-36 focus:ring-1 focus:ring-[#B76E79] outline-none"
                            onChange={e => { if (e.target.value) handleStatusUpdate(order.id, e.target.value); }}
                            value=""
                            disabled={updatingId === order.id}
                          >
                            <option value="" disabled>Change status…</option>
                            {ALL_STATUSES.filter(s => s !== order.status).map(s => (
                              <option key={s} value={s}>{getOrderStatusDisplay(s).label}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B76E79] hover:text-[#722F37] transition-colors"
                        >
                          <Eye className="w-4 h-4" /> View
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-sm text-gray-400">
                      No orders match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={(id, status) => {
            handleStatusUpdate(id, status);
            setSelectedOrder(prev => ({ ...prev, status }));
          }}
        />
      )}
    </div>
  );
};

export default Orders;
