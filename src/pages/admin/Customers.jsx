import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Eye, CheckCircle, Clock, TrendingUp, Trash2 } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { sampleInquiries, sampleCustomers } from '../../data/mockData';
import { StatusBadge, InquiryModal } from '../../components/admin/InquiryModal';
import { loadLocalInquiries, updateLocalInquiryStatus, deleteLocalInquiry } from '../../utils/inquiryStore';

const Customers = () => {
  const [activeTab, setActiveTab] = useState('inquiries');

  const [inquiries, setInquiries] = useState([...sampleInquiries]);
  const [customers] = useState(sampleCustomers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Load inquiries asynchronously from Firestore and merge with mock data
  const fetchInquiries = async () => {
    try {
      const local = await loadLocalInquiries();
      setInquiries([...local, ...sampleInquiries]);
    } catch (error) {
      console.error("Failed to load inquiries:", error);
    }
  };

  // Listen for new submissions or focus
  useEffect(() => {
    fetchInquiries();

    const handleFocus = () => fetchInquiries();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleUpdateStatus = (id, newStatus) => {
    updateLocalInquiryStatus(id, newStatus);
    setInquiries(prev => prev.map(i => i?.id === id ? { ...i, status: newStatus } : i));
  };

  const handleDeleteInquiry = async (inquiry) => {
    if (window.confirm(`Are you sure you want to delete inquiry #${inquiry?.id}?`)) {
      if (inquiry.docId) {
        await deleteLocalInquiry(inquiry.docId);
      }
      // Optimistically remove from state
      setInquiries(prev => prev.filter(i => i?.id !== inquiry.id));
    }
  };

  const filteredInquiries = inquiries.filter(i => {
    if (!i) return false;
    const matchSearch = (i.customerInfo?.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (i.id?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (i.eventType?.toLowerCase() || '').includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredCustomers = customers.filter(c => {
    if (!c) return false;
    return (c.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (c.phone || '').includes(search) ||
      (c.email?.toLowerCase() || '').includes(search.toLowerCase());
  });

  const stats = {
    total: inquiries.filter(i => i).length,
    new: inquiries.filter(i => i?.status === 'new').length,
    quoted: inquiries.filter(i => i?.status === 'quoted').length,
    converted: inquiries.filter(i => i?.status === 'converted').length,
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Customers & Inquiries</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage custom order inquiries and your customer database.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'inquiries' ? 'bg-[#B76E79] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#B76E79]'
            }`}
          >Custom Inquiries ({inquiries.length})</button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'customers' ? 'bg-[#B76E79] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#B76E79]'
            }`}
          >Customers ({customers.length})</button>
        </div>
      </div>

      {/* Stats (Inquiries only) */}
      {activeTab === 'inquiries' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Inquiries', value: stats.total,     color: 'bg-blue-100 text-blue-700',   icon: MessageSquare },
            { label: 'New / Pending',   value: stats.new,       color: 'bg-yellow-100 text-yellow-700', icon: Clock },
            { label: 'Quoted',          value: stats.quoted,    color: 'bg-purple-100 text-purple-700', icon: TrendingUp },
            { label: 'Converted',       value: stats.converted, color: 'bg-green-100 text-green-700',  icon: CheckCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'inquiries' ? 'Search by name, ID, or event…' : 'Search by name or phone…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B76E79]"
          />
        </div>
        {activeTab === 'inquiries' && (
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B76E79] bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="quoted">Quoted</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}
      </div>

      {/* Inquiries Tab */}
      {activeTab === 'inquiries' && (
        <div className="space-y-3">
          {filteredInquiries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No inquiries found.</p>
            </div>
          ) : filteredInquiries.map(inquiry => (
            <div key={inquiry?.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#B76E79]/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-[#B76E79] font-bold text-sm shrink-0">
                  {String(inquiry?.customerInfo?.name || '?').charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{inquiry?.customerInfo?.name}</p>
                    <StatusBadge status={inquiry?.status} />
                    <span className="text-xs text-gray-400">#{inquiry?.id}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    <span className="font-medium text-[#B76E79]">{inquiry?.eventType}</span>
                    {inquiry?.eventDate && <> · {inquiry.eventDate}</>}
                    {inquiry?.estimatedBudget && <> · {inquiry.estimatedBudget}</>}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{inquiry?.customerInfo?.phone}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{inquiry?.detailedDescription}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://wa.me/${String(inquiry?.customerInfo?.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${inquiry?.customerInfo?.name || ''}!`)}`}
                  target="_blank" rel="noreferrer"
                  className="p-2 bg-[#25D366]/10 text-[#25D366] rounded-lg hover:bg-[#25D366]/20 transition-colors"
                  title="WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.128.558 4.121 1.527 5.849L0 24l6.312-1.499A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6c-1.998 0-3.861-.548-5.462-1.5l-.391-.233-4.053.963.984-3.96-.255-.407A9.568 9.568 0 012.4 12C2.4 6.705 6.705 2.4 12 2.4S21.6 6.705 21.6 12 17.295 21.6 12 21.6z"/></svg>
                </a>
                <button onClick={() => setSelectedInquiry(inquiry)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#B76E79]/10 text-[#B76E79] rounded-lg text-sm font-medium hover:bg-[#B76E79]/20 transition-colors">
                  <Eye size={15} /> View
                </button>
                <button onClick={() => handleDeleteInquiry(inquiry)}
                  title="Delete Inquiry"
                  className="flex items-center gap-1.5 p-2 bg-red-50 text-red-500 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium text-center">Orders</th>
                <th className="p-4 font-medium text-right">Total Spent</th>
                <th className="p-4 font-medium">Last Order</th>
                <th className="p-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map(c => (
                <tr key={c?.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-rose-100 rounded-full flex items-center justify-center text-[#B76E79] font-bold text-sm">
                        {String(c?.name || '?').charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{c?.name}</p>
                        <p className="text-xs text-gray-400">Since {c?.joinedDate ? formatDate({ toDate: () => new Date(c.joinedDate) }) : 'Unknown'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-700">{c?.phone}</p>
                    {c?.email && <p className="text-xs text-gray-400">{c.email}</p>}
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-700 rounded-full text-sm font-bold">{c?.totalOrders || 0}</span>
                  </td>
                  <td className="p-4 text-right font-semibold text-gray-900 text-sm">{formatCurrency(c?.totalSpent || 0)}</td>
                  <td className="p-4 text-sm text-gray-500">{c?.lastOrderDate ? formatDate({ toDate: () => new Date(c.lastOrderDate) }) : 'Never'}</td>
                  <td className="p-4 text-center">
                    <a
                      href={`https://wa.me/${String(c?.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${c?.name || ''}! Thank you for being a valued customer of Cake Paradise by Sayu 🎂`)}`}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] rounded-lg text-xs font-medium hover:bg-[#25D366]/20 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.128.558 4.121 1.527 5.849L0 24l6.312-1.499A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6c-1.998 0-3.861-.548-5.462-1.5l-.391-.233-4.053.963.984-3.96-.255-.407A9.568 9.568 0 012.4 12C2.4 6.705 6.705 2.4 12 2.4S21.6 6.705 21.6 12 17.295 21.6 12 21.6z"/></svg>
                      Chat
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedInquiry && (
        <InquiryModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default Customers;
