import React, { useState } from 'react';
import { X } from 'lucide-react';
import { getInquiryStatusDisplay } from '../../utils/formatters';

const StatusBadge = ({ status }) => {
  const s = getInquiryStatusDisplay(status);
  const colorMap = {
    'badge-info': 'bg-blue-100 text-blue-800',
    'badge-warning': 'bg-yellow-100 text-yellow-800',
    'badge-success': 'bg-green-100 text-green-800',
    'badge-danger': 'bg-red-100 text-red-800',
  };
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colorMap[s.class] || 'bg-gray-100 text-gray-700'}`}>{s.label}</span>;
};

const InquiryModal = ({ inquiry, onClose, onUpdateStatus }) => {
  const [updating, setUpdating] = useState(false);
  const nextStatuses = {
    new: ['quoted', 'cancelled'],
    quoted: ['converted', 'cancelled'],
    converted: ['closed'],
    closed: [],
    cancelled: [],
  };
  const available = nextStatuses[inquiry.status] || [];

  const handleStatus = async (newStatus) => {
    setUpdating(true);
    await onUpdateStatus(inquiry.id, newStatus);
    setUpdating(false);
    onClose();
  };

  const waLink = `https://wa.me/${inquiry.customerInfo.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${inquiry.customerInfo.name}! Thank you for your custom cake inquiry (Ref: ${inquiry.id}). I'd love to discuss your ${inquiry.eventType} cake further!`)}`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Inquiry #{inquiry.id}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900">{inquiry.customerInfo.name}</p>
              <p className="text-sm text-gray-500">{inquiry.customerInfo.phone}</p>
              {inquiry.customerInfo.email && <p className="text-sm text-gray-500">{inquiry.customerInfo.email}</p>}
            </div>
            <StatusBadge status={inquiry.status} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Event Type</p>
              <p className="font-medium text-gray-800">{inquiry.eventType}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Event Date</p>
              <p className="font-medium text-gray-800">{inquiry.eventDate}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Servings Needed</p>
              <p className="font-medium text-gray-800">{inquiry.targetServings || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Budget</p>
              <p className="font-medium text-gray-800">{inquiry.estimatedBudget || 'Not specified'}</p>
            </div>
          </div>

          <div className="bg-rose-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Requirements</p>
            <p className="text-sm text-gray-700 leading-relaxed">{inquiry.detailedDescription}</p>
          </div>

          {/* Quote Generator (Module 5) */}
          {inquiry.status === 'new' && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mt-2">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Generate Quote</h4>
              <div className="flex gap-2 mb-3">
                <input type="number" placeholder="Amount (LKR)" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B76E79] outline-none" />
                <input type="date" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#B76E79] outline-none" />
              </div>
              <button onClick={() => handleStatus('quoted')} className="w-full bg-[#B76E79] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#a6626d]">
                Send Quote via WhatsApp
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2 mt-4 border-t border-gray-100">
            <a href={waLink} target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white rounded-xl font-semibold text-sm hover:bg-[#1EBE5E] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.128.558 4.121 1.527 5.849L0 24l6.312-1.499A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6c-1.998 0-3.861-.548-5.462-1.5l-.391-.233-4.053.963.984-3.96-.255-.407A9.568 9.568 0 012.4 12C2.4 6.705 6.705 2.4 12 2.4S21.6 6.705 21.6 12 17.295 21.6 12 21.6z"/></svg>
              WhatsApp
            </a>
            {inquiry.status === 'quoted' && (
              <button 
                onClick={() => handleStatus('converted')}
                className="flex-1 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors"
              >
                Convert to Order
              </button>
            )}
            {available.length > 0 && inquiry.status !== 'quoted' && inquiry.status !== 'new' && (
              <select onChange={(e) => e.target.value && handleStatus(e.target.value)} defaultValue=""
                disabled={updating}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B76E79]">
                <option value="" disabled>Update Status...</option>
                {available.map(s => <option key={s} value={s}>{getInquiryStatusDisplay(s).label}</option>)}
              </select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { StatusBadge, InquiryModal };
