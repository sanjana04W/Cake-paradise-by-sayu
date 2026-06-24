import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, Search, Mail, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { subscribeToMessages, markMessageRead } from '../../utils/messageStore';

const AdminHeader = ({ onMenuClick }) => {
  const { adminData, setDemoRole } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    return subscribeToMessages(setMessages);
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

  const unread = messages.filter(m => !m.read);
  const unreadCount = unread.length;

  const handleNotifClick = (msg) => {
    markMessageRead(msg.id);
    setNotifOpen(false);
    navigate('/messages');
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
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Unread Messages</p>
                <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>

              {unread.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No unread messages</div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {unread.slice(0, 8).map(msg => (
                    <button
                      key={msg.id}
                      onClick={() => handleNotifClick(msg)}
                      className="w-full text-left px-4 py-3 hover:bg-[#B76E79]/5 transition-colors flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#B76E79]/20 text-[#B76E79] flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {msg.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{msg.name}</p>
                        <p className="text-xs text-gray-500 truncate">{msg.subject}</p>
                        <p className="text-xs text-gray-400 truncate">{msg.message}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => { setNotifOpen(false); navigate('/messages'); }}
                  className="text-sm font-semibold text-[#B76E79] hover:underline w-full text-center"
                >
                  View all messages
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
