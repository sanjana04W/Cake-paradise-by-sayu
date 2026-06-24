import React, { useState, useEffect } from 'react';
import { Mail, Inbox, Trash2, MailOpen, MailCheck, Clock, User } from 'lucide-react';
import {
  subscribeToMessages,
  markMessageRead,
  markMessageUnread,
  deleteMessage,
} from '../../utils/messageStore';

const formatDate = (val) => {
  if (!val) return 'Just now';
  let d;
  if (val.toDate) d = val.toDate(); // Firebase Timestamp
  else d = new Date(val); // ISO string
  if (isNaN(d)) return 'Just now';
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('all'); // 'all' | 'unread'

  useEffect(() => {
    return subscribeToMessages((all) => {
      setMessages(all);
      setSelected(prev => prev ? (all.find(m => m.id === prev.id) || null) : null);
    });
  }, []);

  const handleSelect = (msg) => {
    if (!msg.read) {
      markMessageRead(msg.id);
      // Optimistically update local state
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
    }
    setSelected({ ...msg, read: true });
  };

  const handleDelete = (id) => {
    deleteMessage(id);
    if (selected?.id === id) setSelected(null);
  };

  const handleToggleRead = (msg) => {
    if (msg.read) {
      markMessageUnread(msg.id);
    } else {
      markMessageRead(msg.id);
    }
  };

  const displayed = tab === 'unread' ? messages.filter(m => !m.read) : messages;
  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Messages Inbox</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage customer inquiries and feedback received from the store site.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('unread')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'unread' ? 'bg-[#B76E79] text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#B76E79]'}`}
          >
            <Inbox size={15} />
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setTab('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'all' ? 'bg-[#B76E79] text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#B76E79]'}`}
          >
            <Mail size={15} />
            All Messages ({messages.length})
          </button>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex" style={{ minHeight: '60vh' }}>
        {/* Left: Message List */}
        <div className="w-full md:w-72 lg:w-80 border-r border-gray-100 flex-shrink-0 flex flex-col">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
            <span>Inbox Queue</span>
            <span className="text-gray-400 font-normal normal-case">{displayed.length} Message{displayed.length !== 1 ? 's' : ''}</span>
          </div>
          {displayed.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 gap-3">
              <Inbox size={48} className="opacity-20" />
              <p className="text-sm">No messages in this tab</p>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
              {displayed.map(msg => (
                <button
                  key={msg.id}
                  onClick={() => handleSelect(msg)}
                  className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-[#B76E79]/5 ${selected?.id === msg.id ? 'bg-[#B76E79]/10 border-l-2 border-[#B76E79]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.read && <span className="w-2 h-2 rounded-full bg-[#B76E79] flex-shrink-0 mt-1" />}
                      <p className={`text-sm truncate ${!msg.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{msg.name}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">{formatDate(msg.createdAt).split(',')[0]}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5 ml-4">{msg.subject}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5 ml-4">{msg.message}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Message Detail */}
        <div className="flex-1 flex flex-col">
          {selected ? (
            <>
              {/* Detail Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg leading-tight">{selected.subject}</h2>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={11} /> Received: {formatDate(selected.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleRead(selected)}
                    title={selected.read ? 'Mark as Unread' : 'Mark as Read'}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:border-gray-400 transition-colors"
                  >
                    {selected.read ? <MailOpen size={13} /> : <MailCheck size={13} />}
                    {selected.read ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} /> Delete Inquiry
                  </button>
                </div>
              </div>

              {/* Sender Info */}
              <div className="px-6 py-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#B76E79]/20 text-[#B76E79] flex items-center justify-center font-bold text-base">
                    {selected.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{selected.name}</p>
                    <a href={`mailto:${selected.email}`} className="text-xs text-[#B76E79] hover:underline">{selected.email}</a>
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="px-6 py-6 flex-1 overflow-y-auto">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>

              {/* Reply hint */}
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Mail size={12} />
                  Reply to customer via: <a href={`mailto:${selected.email}`} className="text-[#B76E79] hover:underline font-medium">{selected.email}</a>
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-4">
              <Mail size={64} className="opacity-20" />
              <p className="text-sm text-gray-400">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
