import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { User, Package, Settings, LogOut, ChevronRight, Edit2, Heart, Shield, Award, Calendar, MapPin, Phone, Mail, Clock, Star } from 'lucide-react';
import { subscribeToOrders } from '../../firebase/firestore';
import { formatDate, getOrderStatusDisplay, formatCurrency } from '../../utils/formatters';
import CustomerOrderDetailModal from '../../components/public/CustomerOrderDetailModal';

const CustomerDashboard = () => {
  const { user, loading, logoutCustomer, updateCustomerProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    newsletter: false,
    smsAlerts: false
  });
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' });
  
  // Track which fields are currently in edit mode
  const [editingFields, setEditingFields] = useState({
    name: false,
    phone: false,
    address: false
  });

  const toggleEdit = (field) => {
    setEditingFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  React.useEffect(() => {
    if (user) {
      setSettingsForm(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        newsletter: user.newsletter || false,
        smsAlerts: user.smsAlerts || false
      }));
    }
  }, [user]);

  React.useEffect(() => {
    if (!loading && (!user || user.role === 'admin')) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  React.useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToOrders((data) => {
      // Filter by the logged-in user's email. If no user email, fallback to all (for demo purposes)
      const myOrders = user?.email 
        ? data.filter(o => o.customerInfo?.email === user.email)
        : data;
      setOrders(myOrders);
    });
    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-cream"><div className="w-8 h-8 border-4 border-rose-gold border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!user || user.role === 'admin') {
    return null;
  }

  const handleLogout = () => {
    logoutCustomer();
    navigate('/');
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsMessage({ type: '', text: '' });

    if (settingsForm.newPassword && settingsForm.newPassword !== settingsForm.confirmPassword) {
      setSettingsMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    try {
      await updateCustomerProfile(user.email, settingsForm);
      setSettingsMessage({ type: 'success', text: 'Profile updated successfully!' });
      // clear passwords & close edit modes
      setSettingsForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setEditingFields({ name: false, phone: false, address: false });
      
      // Auto dismiss success message after 3 seconds
      setTimeout(() => setSettingsMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setSettingsMessage({ type: 'error', text: err.message });
    }
  };

  // --- Derived data for enhanced UI ---
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const lastOrder = orders.length > 0
    ? orders.reduce((latest, o) => {
        const oDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        const lDate = latest.createdAt?.toDate ? latest.createdAt.toDate() : new Date(latest.createdAt);
        return oDate > lDate ? o : latest;
      })
    : null;
  const memberSince = user.createdAt
    ? (user.createdAt?.toDate ? formatDate(user.createdAt) : formatDate(user.createdAt))
    : 'Recently';

  // Profile completeness
  const profileFields = [
    { filled: !!user.name, label: 'Name' },
    { filled: !!user.email, label: 'Email' },
    { filled: !!user.phone, label: 'Phone' },
    { filled: !!user.address, label: 'Address' },
  ];
  const profileCompleteness = Math.round((profileFields.filter(f => f.filled).length / profileFields.length) * 100);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="bg-champagne-light rounded-3xl p-6 md:p-8 shadow-sm border border-champagne">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-display font-bold text-dark-chocolate">Order History</h2>
                <p className="text-charcoal/50 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-rose-gold/20 to-champagne rounded-2xl flex items-center justify-center">
                <Package size={22} className="text-rose-gold" />
              </div>
            </div>
            {orders.length > 0 ? (
              <>
                {/* Mobile: Card-based layout */}
                <div className="md:hidden space-y-4">
                  {orders.map((order, index) => {
                    const statusDisplay = getOrderStatusDisplay(order.orderStatus || 'pending-confirmation');
                    return (
                      <div key={order.id || index} className="bg-cream/40 rounded-2xl p-5 border border-cream-dark/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-display font-bold text-dark-chocolate text-sm">#{order.id?.slice(0, 8) || order.orderId?.slice(0, 8) || 'Unknown'}</span>
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-bold tracking-wide"
                            style={{ backgroundColor: `${statusDisplay.color}18`, color: statusDisplay.color }}
                          >
                            {statusDisplay.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-charcoal/60 text-xs mb-3">
                          <Calendar size={13} />
                          <span>{order.createdAt?.toDate ? formatDate(order.createdAt) : (order.createdAt && !isNaN(new Date(order.createdAt)) ? formatDate(order.createdAt) : '—')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-dark-chocolate text-lg">{formatCurrency(order.totalAmount || 0)}</span>
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="text-rose-gold hover:text-deep-burgundy text-sm font-semibold flex items-center gap-1 transition-colors"
                          >
                            Details <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop: Enhanced table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-cream-dark/30 text-xs text-charcoal/50 uppercase tracking-widest">
                        <th className="pb-4 font-semibold pl-4">Order ID</th>
                        <th className="pb-4 font-semibold">Date</th>
                        <th className="pb-4 font-semibold">Status</th>
                        <th className="pb-4 font-semibold">Total</th>
                        <th className="pb-4 font-semibold pr-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => {
                        const statusDisplay = getOrderStatusDisplay(order.orderStatus || 'pending-confirmation');
                        return (
                          <tr 
                            key={order.id || index} 
                            className={`text-charcoal hover:bg-rose-gold/5 transition-all duration-200 ${index % 2 === 0 ? 'bg-cream/20' : 'bg-white'}`}
                          >
                            <td className="py-4 pl-4 font-display font-semibold text-dark-chocolate">#{order.id?.slice(0, 8) || order.orderId?.slice(0, 8) || 'Unknown'}</td>
                            <td className="py-4 text-sm text-charcoal/70">{order.createdAt?.toDate ? formatDate(order.createdAt) : (order.createdAt && !isNaN(new Date(order.createdAt)) ? formatDate(order.createdAt) : '—')}</td>
                            <td className="py-4">
                              <span 
                                className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wide inline-flex items-center gap-1"
                                style={{ backgroundColor: `${statusDisplay.color}15`, color: statusDisplay.color, border: `1px solid ${statusDisplay.color}30` }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusDisplay.color }}></span>
                                {statusDisplay.label}
                              </span>
                            </td>
                            <td className="py-4 font-bold text-dark-chocolate">{formatCurrency(order.totalAmount || 0)}</td>
                            <td className="py-4 pr-4">
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="text-rose-gold hover:text-deep-burgundy text-sm font-semibold transition-colors flex items-center gap-1 hover:gap-2"
                              >
                                View Details <ChevronRight size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={32} className="text-rose-gold/40" />
                </div>
                <h3 className="font-display font-bold text-dark-chocolate text-lg mb-2">No Orders Yet</h3>
                <p className="text-charcoal/50 text-sm">Your order history will appear here once you place your first order.</p>
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-champagne-light rounded-3xl p-6 shadow-sm border border-champagne flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-dark-chocolate">Account Settings</h2>
                <p className="text-charcoal/50 text-sm mt-1">Manage your profile and preferences</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-rose-gold/20 to-champagne rounded-2xl flex items-center justify-center">
                <Settings size={22} className="text-rose-gold" />
              </div>
            </div>
            
            {settingsMessage.text && (
              <div className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-3 ${settingsMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                {settingsMessage.type === 'error' ? <Shield size={18} /> : <Award size={18} />}
                {settingsMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
              
              {/* Personal Information Card */}
              <div className="bg-champagne-light rounded-3xl p-6 md:p-8 shadow-sm border border-champagne">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-gold/15 to-champagne/50 rounded-xl flex items-center justify-center">
                    <User size={18} className="text-rose-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-dark-chocolate font-display">Personal Information</h3>
                    <p className="text-xs text-charcoal/40">Your basic account details</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-charcoal flex items-center gap-1.5">
                        <User size={13} className="text-rose-gold/60" /> Full Name
                      </label>
                      {!editingFields.name && (
                        <button type="button" onClick={() => toggleEdit('name')} className="text-rose-gold hover:text-deep-burgundy text-xs font-bold flex items-center gap-1 transition-colors">
                          <Edit2 size={12} /> Edit
                        </button>
                      )}
                    </div>
                    <input 
                      type="text" 
                      value={settingsForm.name}
                      onChange={e => setSettingsForm({...settingsForm, name: e.target.value})}
                      disabled={!editingFields.name}
                      className={`w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 transition-all duration-200 ${!editingFields.name ? 'bg-cream/50 border-cream-dark/30 text-charcoal/60' : 'bg-white border-rose-gold/40 shadow-sm'}`} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-charcoal mb-2 flex items-center gap-1.5">
                      <Mail size={13} className="text-rose-gold/60" /> Email Address
                    </label>
                    <input 
                      type="email" 
                      defaultValue={user.email} 
                      disabled 
                      className="w-full border border-cream-dark/30 bg-cream/50 px-4 py-3 rounded-xl text-charcoal/60 cursor-not-allowed" 
                    />
                    <p className="text-xs text-charcoal/30 mt-1.5 flex items-center gap-1"><Shield size={10} /> Email address cannot be changed</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-charcoal flex items-center gap-1.5">
                        <Phone size={13} className="text-rose-gold/60" /> Phone Number
                      </label>
                      {!editingFields.phone && (
                        <button type="button" onClick={() => toggleEdit('phone')} className="text-rose-gold hover:text-deep-burgundy text-xs font-bold flex items-center gap-1 transition-colors">
                          <Edit2 size={12} /> Edit
                        </button>
                      )}
                    </div>
                    <input 
                      type="tel" 
                      value={settingsForm.phone}
                      onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})}
                      placeholder="e.g. 077 123 4567"
                      disabled={!editingFields.phone}
                      className={`w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 transition-all duration-200 ${!editingFields.phone ? 'bg-cream/50 border-cream-dark/30 text-charcoal/60' : 'bg-white border-rose-gold/40 shadow-sm'}`} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-charcoal flex items-center gap-1.5">
                        <MapPin size={13} className="text-rose-gold/60" /> Default Delivery Address
                      </label>
                      {!editingFields.address && (
                        <button type="button" onClick={() => toggleEdit('address')} className="text-rose-gold hover:text-deep-burgundy text-xs font-bold flex items-center gap-1 transition-colors">
                          <Edit2 size={12} /> Edit
                        </button>
                      )}
                    </div>
                    <textarea 
                      value={settingsForm.address}
                      onChange={e => setSettingsForm({...settingsForm, address: e.target.value})}
                      rows="2"
                      placeholder="Enter your full delivery address"
                      disabled={!editingFields.address}
                      className={`w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 resize-none transition-all duration-200 ${!editingFields.address ? 'bg-cream/50 border-cream-dark/30 text-charcoal/60' : 'bg-white border-rose-gold/40 shadow-sm'}`} 
                    />
                  </div>
                </div>
              </div>

              {/* Change Password Card */}
              <div className="bg-champagne-light rounded-3xl p-6 md:p-8 shadow-sm border border-champagne">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-deep-burgundy/10 to-rose-gold/10 rounded-xl flex items-center justify-center">
                    <Shield size={18} className="text-deep-burgundy" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-dark-chocolate font-display">Change Password</h3>
                    <p className="text-xs text-charcoal/40">Leave fields blank if you don't want to change your password</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-charcoal mb-2">Current Password</label>
                    <input 
                      type="password" 
                      value={settingsForm.currentPassword}
                      onChange={e => setSettingsForm({...settingsForm, currentPassword: e.target.value})}
                      className="w-full border border-cream-dark/30 bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 transition-all duration-200" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">New Password</label>
                    <input 
                      type="password" 
                      value={settingsForm.newPassword}
                      onChange={e => setSettingsForm({...settingsForm, newPassword: e.target.value})}
                      className="w-full border border-cream-dark/30 bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 transition-all duration-200" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={settingsForm.confirmPassword}
                      onChange={e => setSettingsForm({...settingsForm, confirmPassword: e.target.value})}
                      className="w-full border border-cream-dark/30 bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 transition-all duration-200" 
                    />
                  </div>
                </div>
              </div>

              {/* Preferences Card */}
              <div className="bg-champagne-light rounded-3xl p-6 md:p-8 shadow-sm border border-champagne">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-sage-green/20 to-champagne/50 rounded-xl flex items-center justify-center">
                    <Star size={18} className="text-sage-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-dark-chocolate font-display">Preferences</h3>
                    <p className="text-xs text-charcoal/40">Manage your notification preferences</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Newsletter toggle */}
                  <label className="flex items-center justify-between p-4 rounded-2xl bg-cream/30 border border-cream-dark/20 cursor-pointer hover:bg-cream/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Mail size={16} className="text-rose-gold" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-dark-chocolate block">Newsletter</span>
                        <span className="text-xs text-charcoal/40">Special offers and updates</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.newsletter}
                        onChange={e => setSettingsForm({...settingsForm, newsletter: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-rose-gold transition-colors duration-300 peer-focus:ring-2 peer-focus:ring-rose-gold/30"></div>
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 peer-checked:translate-x-5"></div>
                    </div>
                  </label>
                  {/* SMS toggle */}
                  <label className="flex items-center justify-between p-4 rounded-2xl bg-cream/30 border border-cream-dark/20 cursor-pointer hover:bg-cream/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Phone size={16} className="text-rose-gold" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-dark-chocolate block">SMS Alerts</span>
                        <span className="text-xs text-charcoal/40">Order update notifications</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={settingsForm.smsAlerts}
                        onChange={e => setSettingsForm({...settingsForm, smsAlerts: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-rose-gold transition-colors duration-300 peer-focus:ring-2 peer-focus:ring-rose-gold/30"></div>
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 peer-checked:translate-x-5"></div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="bg-gradient-to-r from-rose-gold to-deep-burgundy text-white px-10 py-3.5 rounded-2xl font-bold hover:shadow-lg hover:shadow-rose-gold/25 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]">
                  Save All Changes
                </button>
              </div>
            </form>
          </div>
        );
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            {/* Profile Completeness */}
            <div className="bg-champagne-light rounded-3xl p-6 md:p-8 shadow-sm border border-champagne">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-gold/15 to-champagne/50 rounded-xl flex items-center justify-center">
                    <Award size={18} className="text-rose-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-chocolate font-display">Profile Completeness</h3>
                    {profileCompleteness < 100 && (
                      <p className="text-xs text-charcoal/40">Complete your profile to unlock the best experience</p>
                    )}
                  </div>
                </div>
                <span className={`text-2xl font-bold font-display ${profileCompleteness === 100 ? 'text-sage-green' : 'text-rose-gold'}`}>{profileCompleteness}%</span>
              </div>
              <div className="w-full bg-cream-dark/30 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${profileCompleteness === 100 ? 'bg-gradient-to-r from-sage-green to-sage-green/80' : 'bg-gradient-to-r from-rose-gold to-warm-pink'}`}
                  style={{ width: `${profileCompleteness}%` }}
                ></div>
              </div>
              {profileCompleteness < 100 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {profileFields.filter(f => !f.filled).map(f => (
                    <span key={f.label} className="text-xs bg-rose-gold/10 text-rose-gold px-3 py-1 rounded-full font-medium">
                      Add {f.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-champagne-light rounded-2xl p-5 shadow-sm border border-champagne group hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-gold/15 to-champagne/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Package size={18} className="text-rose-gold" />
                  </div>
                  <span className="text-xs font-semibold text-charcoal/40 uppercase tracking-wider">Total Orders</span>
                </div>
                <p className="text-3xl font-bold font-display text-dark-chocolate">{orders.length}</p>
              </div>
              <div className="bg-champagne-light rounded-2xl p-5 shadow-sm border border-champagne group hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sage-green/15 to-champagne/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Star size={18} className="text-sage-green" />
                  </div>
                  <span className="text-xs font-semibold text-charcoal/40 uppercase tracking-wider">Total Spent</span>
                </div>
                <p className="text-3xl font-bold font-display text-dark-chocolate">{formatCurrency(totalSpent)}</p>
              </div>
              <div className="bg-champagne-light rounded-2xl p-5 shadow-sm border border-champagne group hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-deep-burgundy/10 to-champagne/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Clock size={18} className="text-deep-burgundy" />
                  </div>
                  <span className="text-xs font-semibold text-charcoal/40 uppercase tracking-wider">Last Order</span>
                </div>
                <p className="text-lg font-bold font-display text-dark-chocolate truncate">
                  {lastOrder 
                    ? (lastOrder.createdAt?.toDate ? formatDate(lastOrder.createdAt) : (lastOrder.createdAt && !isNaN(new Date(lastOrder.createdAt)) ? formatDate(lastOrder.createdAt) : '—'))
                    : 'No orders yet'}
                </p>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div 
                className="bg-champagne-light rounded-3xl p-6 shadow-sm border border-champagne hover:border-champagne hover:shadow-md transition-all duration-300 cursor-pointer group" 
                onClick={() => setActiveTab('orders')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cream to-champagne rounded-2xl flex items-center justify-center text-rose-gold group-hover:scale-110 transition-transform duration-300">
                    <Package size={24} />
                  </div>
                  <ChevronRight size={20} className="text-charcoal/20 group-hover:text-rose-gold group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="font-bold text-dark-chocolate text-lg mb-1 font-display">Recent Orders</h3>
                <p className="text-charcoal/50 text-sm">Check the status of your recent orders.</p>
              </div>
              
              <div 
                className="bg-champagne-light rounded-3xl p-6 shadow-sm border border-champagne hover:border-champagne hover:shadow-md transition-all duration-300 cursor-pointer group" 
                onClick={() => setActiveTab('settings')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cream to-champagne rounded-2xl flex items-center justify-center text-rose-gold group-hover:scale-110 transition-transform duration-300">
                    <Settings size={24} />
                  </div>
                  <ChevronRight size={20} className="text-charcoal/20 group-hover:text-rose-gold group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="font-bold text-dark-chocolate text-lg mb-1 font-display">Account Details</h3>
                <p className="text-charcoal/50 text-sm">Update your personal information.</p>
              </div>

              {/* Wishlist / Favorites Placeholder */}
              <div className="bg-champagne-light rounded-3xl p-6 shadow-sm border border-dashed border-champagne hover:border-champagne hover:shadow-md transition-all duration-300 cursor-default group relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-bold text-white bg-warm-pink/80 px-2.5 py-1 rounded-full uppercase tracking-wider">Coming Soon</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-warm-pink/10 to-champagne rounded-2xl flex items-center justify-center text-warm-pink group-hover:scale-110 transition-transform duration-300">
                    <Heart size={24} />
                  </div>
                </div>
                <h3 className="font-bold text-dark-chocolate text-lg mb-1 font-display">Favorites</h3>
                <p className="text-charcoal/50 text-sm">Save your favorite cakes for later.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="pt-28 md:pt-32 pb-16 min-h-screen bg-cream">
      <Helmet>
        <title>Dashboard | Cake Paradise</title>
      </Helmet>

      {/* ===== Premium Hero Banner ===== */}
      <div className="relative overflow-hidden bg-gradient-to-r from-deep-burgundy via-dark-chocolate to-deep-burgundy">
        {/* Polka-dot pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        ></div>
        {/* Decorative gradient blobs */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-rose-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-warm-pink/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10 py-10 md:py-14">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-rose-gold to-warm-pink ring-4 ring-white shadow-xl flex items-center justify-center mb-5">
              <span className="text-3xl md:text-4xl font-bold font-display text-white">{userInitial}</span>
            </div>

            {/* User Info */}
            <h1 className="text-2xl md:text-3xl font-display font-bold !text-white mb-1">
              {user.name || 'Welcome Back!'}
            </h1>
            <p className="text-white/60 text-sm md:text-base font-body">{user.email}</p>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 flex items-center gap-3">
                <Package size={18} className="text-rose-gold-light" />
                <div className="text-left">
                  <p className="text-white text-lg font-bold font-display leading-tight">{orders.length}</p>
                  <p className="text-white/50 text-xs">Total Orders</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 flex items-center gap-3">
                <Calendar size={18} className="text-rose-gold-light" />
                <div className="text-left">
                  <p className="text-white text-lg font-bold font-display leading-tight">{memberSince}</p>
                  <p className="text-white/50 text-xs">Member Since</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ===== Main Content ===== */}
      <div className="container mx-auto px-4 md:px-8 max-w-6xl -mt-6 relative z-20">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-champagne-light rounded-3xl shadow-sm border border-champagne overflow-hidden lg:sticky top-24">
              {/* Sidebar Profile Summary */}
              <div className="p-5 border-b border-cream-dark/20 bg-gradient-to-br from-cream/50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-gold to-warm-pink flex items-center justify-center">
                    <span className="text-sm font-bold font-display text-white">{userInitial}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-dark-chocolate truncate">{user.name || user.email.split('@')[0]}</p>
                    <p className="text-xs text-charcoal/40 font-medium">Customer</p>
                  </div>
                </div>
              </div>

              <nav className="p-3 space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                        isActive 
                          ? 'bg-gradient-to-r from-rose-gold/20 to-rose-gold/5 text-rose-gold font-bold border-l-4 border-rose-gold shadow-sm' 
                          : 'text-charcoal hover:bg-cream/60 hover:text-rose-gold border-l-4 border-transparent'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
                <div className="pt-3 mt-3 border-t border-cream-dark/20">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left text-red-400 hover:bg-red-50 hover:text-red-500 border-l-4 border-transparent"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {renderContent()}
          </div>
        </div>
      </div>

      {selectedOrder && (
        <CustomerOrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
