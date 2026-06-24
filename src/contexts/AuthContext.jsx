import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Demo credentials
const DEMO_CREDENTIALS = {
  email: 'admin@sayu.com',
  password: 'admin123',
};

// Available roles for the RBAC system
const roles = {
  super_admin:       { name: 'Owner / Super Admin',       permissions: ['all'] },
  order_handler:     { name: 'Kitchen Staff',              permissions: ['orders_read', 'orders_update', 'inquiries_read', 'inquiries_update'] },
  inventory_manager: { name: 'Bakery Inventory Manager',   permissions: ['inventory_read', 'inventory_update', 'products_read', 'products_update'] },
  content_manager:   { name: 'Digital Content Manager',    permissions: ['media_read', 'media_update', 'cms_read', 'cms_update'] },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [isAdmin, setIsAdmin]     = useState(false);

  // On mount, check if there's a saved session
  useEffect(() => {
    const adminSaved = sessionStorage.getItem('cake_admin_session');
    if (adminSaved) {
      try {
        const session = JSON.parse(adminSaved);
        setUser(session.user);
        setAdminData(session.adminData);
        setIsAdmin(true);
      } catch (e) {
        sessionStorage.removeItem('cake_admin_session');
      }
    } else {
      const customerSaved = localStorage.getItem('cake_customer_session');
      if (customerSaved) {
        try {
          const session = JSON.parse(customerSaved);
          setUser(session.user);
          setIsAdmin(false);
        } catch (e) {
          localStorage.removeItem('cake_customer_session');
        }
      }
    }
    setLoading(false);
  }, []);

  // Demo login — validates credentials locally
  const login = async (email, password) => {
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      const userData  = { uid: 'demo-super-admin-123', email };
      const admin     = { role: 'super_admin', isActive: true, name: 'Owner / Super Admin' };
      setUser(userData);
      setAdminData(admin);
      setIsAdmin(true);
      sessionStorage.setItem('cake_admin_session', JSON.stringify({ user: userData, adminData: admin }));
      return { user: userData, adminData: admin };
    }
    throw new Error('Invalid email or password. Use admin@sayu.com / admin123');
  };

  // Logout — clears all state and session
  const logout = () => {
    setUser(null);
    setAdminData(null);
    setIsAdmin(false);
    sessionStorage.removeItem('cake_admin_session');
  };

  const logoutCustomer = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('cake_customer_session');
  };

  // Helper to manage local user registry
  const getRegistry = () => {
    try {
      return JSON.parse(localStorage.getItem('cake_user_registry') || '[]');
    } catch {
      return [];
    }
  };

  const saveRegistry = (registry) => {
    localStorage.setItem('cake_user_registry', JSON.stringify(registry));
  };

  const customerLogin = async (email, password) => {
    // Check local registry
    const registry = getRegistry();
    const userRecord = registry.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!userRecord) {
      throw new Error('No account found with this email. Please register first.');
    }

    if (userRecord.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    // Login successful
    const userData = { uid: userRecord.uid, email: userRecord.email, name: userRecord.name, role: 'customer' };
    setUser(userData);
    setIsAdmin(false);
    localStorage.setItem('cake_customer_session', JSON.stringify({ user: userData }));
    return { user: userData };
  };

  const customerRegister = async (name, email, password) => {
    const registry = getRegistry();
    const existing = registry.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existing) {
      throw new Error('An account with this email already exists. Please log in.');
    }

    // Add new user to registry
    const newUser = {
      uid: `customer-${Date.now()}`,
      name,
      email,
      password // Storing in plain text only for demo purposes!
    };
    
    registry.push(newUser);
    saveRegistry(registry);

    // Auto log in after registration
    const userData = { uid: newUser.uid, email: newUser.email, name: newUser.name, role: 'customer' };
    setUser(userData);
    setIsAdmin(false);
    localStorage.setItem('cake_customer_session', JSON.stringify({ user: userData }));
    return { user: userData };
  };

  const updateCustomerProfile = async (email, updates) => {
    const registry = getRegistry();
    let index = registry.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (index === -1) {
      // Auto-register old mock sessions so they can save settings
      const newUser = {
        uid: user?.uid || `customer-${Date.now()}`,
        name: user?.name || '',
        email: email,
        password: updates.newPassword || 'default123'
      };
      registry.push(newUser);
      index = registry.length - 1;
    }

    // Check if updating password and current password doesn't match
    if (updates.newPassword && updates.currentPassword) {
      if (registry[index].password !== updates.currentPassword) {
        throw new Error('Current password is incorrect.');
      }
      registry[index].password = updates.newPassword;
    }

    // Update other fields
    if (updates.name) registry[index].name = updates.name;
    if (updates.phone !== undefined) registry[index].phone = updates.phone;
    if (updates.address !== undefined) registry[index].address = updates.address;
    if (updates.newsletter !== undefined) registry[index].newsletter = updates.newsletter;
    if (updates.smsAlerts !== undefined) registry[index].smsAlerts = updates.smsAlerts;

    saveRegistry(registry);

    // Update session
    const updatedUser = { 
      ...user, 
      name: registry[index].name,
      phone: registry[index].phone,
      address: registry[index].address,
      newsletter: registry[index].newsletter,
      smsAlerts: registry[index].smsAlerts
    };
    setUser(updatedUser);
    localStorage.setItem('cake_customer_session', JSON.stringify({ user: updatedUser }));
    return updatedUser;
  };

  // Switch demo role (from the header role switcher)
  const setDemoRole = (roleKey) => {
    const admin = { role: roleKey, isActive: true, name: roles[roleKey]?.name || 'Admin' };
    const userData = { uid: `demo-${roleKey}-123`, email: `${roleKey}@cakeparadise.lk` };
    setUser(userData);
    setAdminData(admin);
    setIsAdmin(true);
    sessionStorage.setItem('cake_admin_session', JSON.stringify({ user: userData, adminData: admin }));
  };

  const checkPermission = (module) => {
    if (!adminData) return false;
    if (adminData.role === 'super_admin') return true;
    const rolePermissions = roles[adminData.role]?.permissions || [];
    return rolePermissions.includes(`${module}_read`) || rolePermissions.includes(`${module}_update`);
  };

  const value = {
    user,
    adminData,
    loading,
    isAdmin,
    login,
    logout,
    customerLogin,
    customerRegister,
    updateCustomerProfile,
    logoutCustomer,
    checkPermission,
    role: adminData?.role || null,
    setDemoRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
