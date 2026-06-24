import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { checkFirestoreWritable } from '../../firebase/firestoreStatus';

const FirestoreBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    checkFirestoreWritable().then(ok => {
      if (!ok) setShow(true);
    });
  }, []);

  if (!show) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-start gap-3">
      <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
      <div className="flex-1 text-sm">
        <p className="font-semibold text-amber-800">
          Firestore rules not deployed — product edits won't sync to the website on other devices.
        </p>
        <p className="text-amber-700 mt-0.5">
          To fix: open{' '}
          <a
            href="https://console.firebase.google.com/project/cake-paradise-969e6/firestore/rules"
            target="_blank"
            rel="noreferrer"
            className="underline font-medium"
          >
            Firebase Console → Firestore → Rules
          </a>{' '}
          and replace the contents with:{' '}
          <code className="bg-amber-100 px-1 rounded text-xs">
            rules_version = '2'; service cloud.firestore {'{'} match /databases/{'{'}database{'}'}/documents {'{'} match /{'{'}document=**{'}'} {'{'} allow read, write: if true; {'}'} {'}'} {'}'}
          </code>
        </p>
      </div>
      <button
        onClick={() => setShow(false)}
        className="text-amber-400 hover:text-amber-600 flex-shrink-0 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
};

const AdminLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B76E79]"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <AdminHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        <FirestoreBanner />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F9FAFB] p-4 md:p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
