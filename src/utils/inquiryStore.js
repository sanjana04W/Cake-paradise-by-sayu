/**
 * inquiryStore.js
 * Saves custom order inquiries to Firestore so admin panel can see them.
 */
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';

const COLLECTION = 'inquiries';

/** Save a new inquiry to Firestore */
export async function saveLocalInquiry(data) {
  const id = 'INQ-' + Date.now();
  const newInquiry = {
    id,
    ...data,
    status: 'new',
    createdAt: serverTimestamp(),
    referenceImages: [],
  };
  await addDoc(collection(db, COLLECTION), newInquiry);
  return newInquiry;
}

/** Load all inquiries from Firestore */
export async function loadLocalInquiries() {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

/** Update the status of an inquiry */
export async function updateLocalInquiryStatus(id, newStatus) {
  try {
    const q = query(collection(db, COLLECTION));
    const snapshot = await getDocs(q);
    const docRef = snapshot.docs.find(d => d.data().id === id);
    if (docRef) {
      await updateDoc(doc(db, COLLECTION, docRef.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (e) {
    console.error('Error updating inquiry:', e);
  }
}

/** Delete an inquiry from Firestore */
export async function deleteLocalInquiry(docId) {
  try {
    if (docId) {
      await deleteDoc(doc(db, COLLECTION, docId));
    }
  } catch (e) {
    console.error('Error deleting inquiry:', e);
  }
}
