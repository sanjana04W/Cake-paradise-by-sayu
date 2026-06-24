import { db, auth } from './config';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const loginAdmin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const adminDoc = await getDoc(doc(db, 'adminUsers', userCredential.user.uid));
    
    if (!adminDoc.exists()) {
      await signOut(auth);
      throw new Error('Not authorized as admin');
    }

    if (!adminDoc.data().isActive) {
      await signOut(auth);
      throw new Error('Account is deactivated');
    }

    return { user: userCredential.user, adminData: adminDoc.data() };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutAdmin = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const createAdminUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'adminUsers', userCredential.user.uid), {
      uid: userCredential.user.uid,
      name: userData.name,
      email: email,
      role: userData.role || 'kitchen-staff',
      assignedPermissions: userData.permissions || [],
      isActive: true,
      lastLoginAt: null,
      createdAt: serverTimestamp(),
    });
    return userCredential.user.uid;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = () => auth.currentUser;

// Role permission mapping
export const ROLE_PERMISSIONS = {
  owner: {
    label: 'Owner / Super Administrator',
    permissions: ['all'],
    modules: ['dashboard', 'products', 'orders', 'inventory', 'customers', 'inquiries', 'media', 'promotions', 'reports', 'settings'],
  },
  'kitchen-staff': {
    label: 'Kitchen Staff / Order Handler',
    permissions: ['orders.view', 'orders.update', 'inquiries.view', 'inquiries.notes', 'products.view'],
    modules: ['orders', 'inquiries'],
  },
  'inventory-manager': {
    label: 'Bakery Inventory Manager',
    permissions: ['products.edit-stock', 'products.edit-flavors', 'inventory.full'],
    modules: ['products', 'inventory'],
  },
  'content-manager': {
    label: 'Digital Content Manager',
    permissions: ['media.full', 'products.edit-descriptions', 'promotions.full'],
    modules: ['products', 'media', 'promotions'],
  },
};

export const hasPermission = (role, requiredModule) => {
  if (role === 'owner') return true;
  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return false;
  return roleConfig.modules.includes(requiredModule);
};
