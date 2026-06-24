import React from 'react';
import { X, MapPin, Phone, Mail, Clock, Calendar, ShoppingBag, History } from 'lucide-react';
import { formatCurrency, getOrderStatusDisplay } from '../../utils/formatters';

const CustomerOrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'dispatched': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const orderDate = order.createdAt?.toDate 
    ? new Date(order.createdAt.toDate()) 
    : (order.createdAt && !isNaN(new Date(order.createdAt)) ? new Date(order.createdAt) : null);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-display text-gray-900">Order #{order.id?.slice(0, 8) || order.orderId?.slice(0, 8)}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(order.orderStatus || order.status)}`}>
                {(order.orderStatus || order.status || 'Pending').replace('-', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Placed on {orderDate ? orderDate.toLocaleString() : '—'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-2 shadow-sm border border-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F9FAFB]">
          
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2 border-b pb-2">
              <ShoppingBag className="w-5 h-5 text-[#B76E79]" /> Items Ordered
            </h3>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-rose-50" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                      {item.attributes && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.entries(item.attributes).map(([k, v]) => (
                            <span key={k} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{k}: {v}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <span className="text-gray-500 font-medium">Total</span>
              <span className="text-2xl font-bold text-[#B76E79]">{formatCurrency(order.totalAmount || order.total || 0)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2 border-b pb-2">
                <MapPin className="w-5 h-5 text-[#B76E79]" /> Delivery Details
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-1">Window</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400" /> {order.deliveryDate || 'Not specified'}</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1 mt-1"><Clock className="w-4 h-4 text-gray-400" /> {order.deliveryTime || 'Any time'}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-1">Address</p>
                  <p className="font-medium text-gray-900">{order.customerInfo?.address || order.customerInfo?.deliveryAddress}</p>
                  <p className="font-medium text-gray-900">{order.customerInfo?.city}</p>
                </div>
              </div>
            </div>

            {/* Tracking History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2 border-b pb-2">
                <History className="w-5 h-5 text-gray-400" /> Status History
              </h3>
              <div className="space-y-4">
                {order.trackHistory ? (
                  order.trackHistory.map((log, idx) => (
                    <div key={idx} className="relative pl-4 border-l-2 border-[#B76E79]/30 text-sm">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#B76E79]" />
                      <p className="font-bold text-gray-900 capitalize">{log.status.replace('-', ' ')}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No tracking updates yet.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerOrderDetailModal;
