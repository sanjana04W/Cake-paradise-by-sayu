import React, { useState } from 'react';
import { X, MapPin, Phone, Mail, Clock, Calendar, MessageSquare, History, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

const OrderDetailModal = ({ order, onClose, onUpdate }) => {
  const [internalNote, setInternalNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { adminData } = useAuth();

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 400));
      
      const statusLog = {
        status: newStatus,
        updatedBy: adminData?.name || 'Admin',
        updatedAt: new Date().toISOString(),
        note: internalNote || 'Status updated'
      };

      onUpdate(order.id, newStatus);
      setInternalNote('');
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

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

  // Workflow pipeline
  const nextValidStatuses = {
    'pending-confirmation': ['confirmed', 'cancelled'],
    'confirmed': ['processing', 'cancelled'],
    'processing': ['ready'],
    'ready': ['dispatched'],
    'dispatched': ['delivered', 'failed-delivery'],
    'delivered': [],
    'cancelled': [],
    'failed-delivery': []
  };

  const allowedNext = nextValidStatuses[order.status] || [];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-display text-gray-900">Order #{order.orderId || order.id}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                {order.status.replace('-', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.createdAt?.seconds * 1000 || Date.now()).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-2 shadow-sm border border-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#F9FAFB]">
          
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Structural Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2 border-b pb-2">
                <ShoppingBag className="w-5 h-5 text-[#B76E79]" /> Structural Breakdown
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
                        <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatCurrency(item.unitPrice ?? item.price ?? 0)}</p>
                        {item.attributes && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {Object.entries(item.attributes).map(([k, v]) => (
                              <span key={k} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{k}: {v}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-gray-900">{formatCurrency(item.lineTotal ?? ((item.unitPrice ?? item.price ?? 0) * item.quantity))}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <span className="text-gray-500 font-medium">Total Estimate</span>
                <span className="text-2xl font-bold text-[#B76E79]">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2 border-b pb-2">
                <MapPin className="w-5 h-5 text-[#B76E79]" /> Geolocation & Delivery Window
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-1">Requested Window</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400" /> {order.deliveryDate || 'Not specified'}</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1 mt-1"><Clock className="w-4 h-4 text-gray-400" /> {order.deliveryTime || 'Any time'}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-1">Precise Location</p>
                  <p className="font-medium text-gray-900">{order.customerInfo?.address}</p>
                  <p className="font-medium text-gray-900">{order.customerInfo?.city}</p>
                  <a href={`https://maps.google.com/?q=${order.customerInfo?.address}, ${order.customerInfo?.city}`} target="_blank" rel="noreferrer" className="text-[#B76E79] hover:underline text-xs flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> View on Map
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & History */}
          <div className="space-y-6">
            
            {/* Client Data */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold font-display mb-4 border-b pb-2">Client Contact</h3>
              <div className="space-y-3 text-sm">
                <p className="font-bold text-gray-900 text-base">{order.customerInfo?.name}</p>
                <p className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" /> {order.customerInfo?.phone}</p>
                <p className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" /> {order.customerInfo?.email}</p>
                <a href={`https://wa.me/${order.customerInfo?.phone?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#1ebd5a] transition-colors font-medium">
                  <MessageSquare className="w-4 h-4" /> WhatsApp Client
                </a>
              </div>
            </div>

            {/* Workflow Control */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold font-display mb-4 border-b pb-2">Operational Queue</h3>
              
              <div className="space-y-3">
                <textarea 
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Internal custom notes (e.g. 'Waiting on flour delivery')"
                  className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#B76E79] outline-none resize-none h-24 bg-yellow-50/30"
                />

                {allowedNext.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {allowedNext.map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={isUpdating}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border uppercase tracking-wider text-center transition-colors ${
                          status === 'cancelled' || status === 'failed-delivery' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 col-span-2' : 'bg-[#B76E79] text-white border-[#B76E79] hover:bg-[#a6626d]'
                        }`}
                      >
                        Mark as {status.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-3 bg-gray-50 rounded-lg text-sm text-gray-500 italic">
                    Workflow complete.
                  </div>
                )}
              </div>
            </div>

            {/* Exact History Logs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2 border-b pb-2">
                <History className="w-5 h-5 text-gray-400" /> Exact History Logs
              </h3>
              <div className="space-y-4">
                {order.history ? (
                  order.history.map((log, idx) => (
                    <div key={idx} className="relative pl-4 border-l-2 border-gray-100 text-sm">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-300" />
                      <p className="font-bold text-gray-900 capitalize">{log.status.replace('-', ' ')}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{new Date(log.updatedAt).toLocaleString()} by {log.updatedBy}</p>
                      {log.note && <p className="text-gray-700 bg-gray-50 p-2 rounded mt-1 italic text-xs">"{log.note}"</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No history logged yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
