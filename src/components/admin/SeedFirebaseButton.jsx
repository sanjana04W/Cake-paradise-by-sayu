import React, { useState } from 'react';
import { db } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { sampleProducts, sampleCategories } from '../../data/sampleProducts';

export const SeedFirebaseButton = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const seedData = async () => {
    if (!window.confirm('This will write sample products and categories to your Firebase Firestore. Proceed?')) return;
    setLoading(true);
    try {
      setStatus('Uploading categories...');
      for (const cat of sampleCategories) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
      setStatus('Uploading products...');
      for (const prod of sampleProducts) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      setStatus('Success! Firestore is seeded.');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setStatus('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {status && <span className="text-sm font-semibold text-[#B76E79]">{status}</span>}
      <button
        onClick={seedData}
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Seeding...' : 'Sync Products to Firebase'}
      </button>
    </div>
  );
};
