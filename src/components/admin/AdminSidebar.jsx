import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Cake, 
  ClipboardList, 
  Package, 
  Users, 
  Image as ImageIcon, 
  Tag, 
  Settings as SettingsIcon,
  LogOut,
  X,
  Mail,
} from 'lucide-react';
import { subscribeToMessages } from '../../utils/messageStore';

const AdminSidebar = ({ onClose }) => {
  const { adminData, checkPermission, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  useEffect(() => {
    return subscribeToMessages((msgs) => {
      setUnreadMsgs(msgs.filter(m => !m.read).length);
    });
  }, []);

  const handleLogout = async () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', module: 'dashboard' },
    { name: 'Orders', icon: ClipboardList, path: '/orders', module: 'orders' },
    { name: 'Products', icon: Cake, path: '/products', module: 'products' },
    { name: 'Inventory', icon: Package, path: '/inventory', module: 'inventory' },
    { name: 'Customers', icon: Users, path: '/customers', module: 'customers' },
    { name: 'Messages', icon: Mail, path: '/messages', module: 'dashboard', badge: unreadMsgs },
    { name: 'Media', icon: ImageIcon, path: '/media', module: 'media' },
    { name: 'Reports & Promos', icon: Tag, path: '/promotions', module: 'dashboard' },
    { name: 'Settings & CMS', icon: SettingsIcon, path: '/settings', module: 'cms' },
  ];

  return (
    <div className="w-64 h-full bg-gradient-to-b from-[#722F37] to-[#2C1810] text-white flex flex-col shadow-xl">
      <div className="p-6 border-b border-white/10 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-display font-extrabold" style={{background: 'linear-gradient(90deg, #FFD700 0%, #FFB347 50%, #FF8C69 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Cake Paradise</h2>
          <p className="text-xs text-rose-300 font-inter mt-0.5 tracking-widest uppercase font-semibold">✦ Admin Panel ✦</p>
        </div>
        <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white p-1 -mr-2">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 border-b border-white/10 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-[#B76E79] flex items-center justify-center font-bold text-lg">
          {adminData?.name?.charAt(0) || 'A'}
        </div>
        <div>
          <p className="font-semibold text-sm">{adminData?.name || 'Admin User'}</p>
          <p className="text-xs text-gray-300 capitalize">{adminData?.role?.replace('-', ' ')}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (!checkPermission(item.module)) return null;
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[#B76E79] text-white' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium font-inter flex-1">{item.name}</span>
              {item.badge > 0 && (
                <span className="ml-auto flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-[#B76E79] text-white text-[10px] font-bold">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-left rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
