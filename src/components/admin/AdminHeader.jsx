import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, Search, Mail, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { subscribeToMessages, markMessageRead } from '../../utils/messageStore';
import { subscribeToOrders, markOrderRead } from '../../firebase/firestore';

const AdminHeader = ({ onMenuClick }) => {
  const { adminData, setDemoRole } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [orders, setOrders] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    return subscribeToMessages(setMessages);
  }, []);

  useEffect(() => {
    return subscribeToOrders(setOrders);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadMessages = messages.filter(m => !m.read).map(m => ({
    id: `msg-${m.id}`,
    type: 'message',
    title: m.name,
    subtitle: m.subject,
    description: m.message,
    item: m,
    date: m.createdAt
  }));

  const pendingOrders = orders.filter(o => o.orderStatus === 'pending-confirmation' && !o.notificationRead).map(o => ({
    id: `ord-${o.id}`,
    type: 'order',
    title: `New Order: ${o.orderId}`,
    subtitle: o.customerInfo?.name || 'Customer',
    description: `Total: LKR ${o.totalAmount?.toLocaleString()}`,
    item: o,
    date: o.createdAt
  }));

  const notifications = [...pendingOrders, ...unreadMessages].sort((a, b) => {
    const timeA = a.date?.toDate ? a.date.toDate().getTime() : new Date(a.date || 0).getTime();
    const timeB = b.date?.toDate ? b.date.toDate().getTime() : new Date(b.date || 0).getTime();
    return timeB - timeA;
  });

  const unreadCount = notifications.length;

  const handleNotifClick = (notif) => {
    setNotifOpen(false);
    if (notif.type === 'message') {
      markMessageRead(notif.item.id);
      navigate('/messages');
    } else {
      markOrderRead(notif.item.id);
      navigate('/orders');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 z-10 sticky top-0">
      <div className="flex items-center lg:hidden">
        <button onClick={onMenuClick} className="text-gray-500 hover:text-gray-700">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="hidden md:flex flex-1 items-center px-6">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#B76E79] sm:text-sm sm:leading-6 bg-gray-50"
            placeholder="Search orders, products..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 ml-auto">
        <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Test Role:</span>
          <select 
            value={adminData?.role || 'super_admin'}
            onChange={(e) => {
              const newRole = e.target.value;
              setDemoRole(newRole);
              if (newRole === 'order_handler') {
                navigate('/orders');
              } else if (newRole === 'inventory_manager') {
                navigate('/inventory');
              } else if (newRole === 'content_manager') {
                navigate('/settings');
              } else {
                navigate('/dashboard');
              }
            }}
            className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 font-medium focus:ring-1 focus:ring-[#B76E79] outline-none cursor-pointer"
          >
            <option value="super_admin">Owner</option>
            <option value="order_handler">Kitchen Staff</option>
            <option value="inventory_manager">Inventory Manager</option>
            <option value="content_manager">Content Manager</option>
          </select>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 rounded-full bg-[#B76E79] text-white text-[9px] font-bold ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            {unreadCount === 0 && (
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-[#F08080] ring-2 ring-white" />
            )}
            <Bell className="w-6 h-6" />
          </button>

          {/* Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Notifications</p>
                <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No new notifications</div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {notifications.slice(0, 8).map(notif => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className="w-full text-left px-4 py-3 hover:bg-[#B76E79]/5 transition-colors flex items-start gap-3"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${notif.type === 'order' ? 'bg-orange-100 text-orange-600' : 'bg-[#B76E79]/20 text-[#B76E79]'}`}>
                        {notif.type === 'order' ? '📦' : notif.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{notif.title}</p>
                        <p className="text-xs text-gray-500 truncate">{notif.subtitle}</p>
                        <p className="text-xs text-gray-400 truncate">{notif.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex gap-2">
                <button
                  onClick={() => { setNotifOpen(false); navigate('/orders'); }}
                  className="text-sm font-semibold text-[#B76E79] hover:underline w-1/2 text-center border-r border-gray-200"
                >
                  Orders
                </button>
                <button
                  onClick={() => { setNotifOpen(false); navigate('/messages'); }}
                  className="text-sm font-semibold text-[#B76E79] hover:underline w-1/2 text-center"
                >
                  Messages
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="hidden sm:flex flex-col items-end pl-2">
          <span className="text-sm font-semibold text-gray-900">{adminData?.name || 'Admin User'}</span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
