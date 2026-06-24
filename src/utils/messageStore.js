import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

const isDemoMode = !import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID === 'demo-project';
const KEY = 'cp_contact_messages';

const loadLocal = () => {
  try { 
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch { 
    return []; 
  }
};

const persistLocal = (messages) => {
  localStorage.setItem(KEY, JSON.stringify(messages));
  window.dispatchEvent(new Event('messages_updated'));
};

window.addEventListener('storage', (e) => {
  if (e.key === KEY) {
    window.dispatchEvent(new Event('messages_updated'));
  }
});

export const subscribeToMessages = (callback) => {
  if (isDemoMode) {
    const emit = () => callback(loadLocal());
    emit();
    window.addEventListener('messages_updated', emit);
    const storageHandler = (e) => { if (e.key === KEY) emit(); };
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('messages_updated', emit);
      window.removeEventListener('storage', storageHandler);
    };
  }

  const q = query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(msgs);
  }, (err) => {
    console.error("Messages subscription error:", err);
    callback([]);
  });
};

export const saveContactMessage = async ({ name, email, subject, message }) => {
  if (isDemoMode) {
    const all = loadLocal();
    const newMsg = {
      id: 'MSG-' + Date.now(),
      name, email, subject, message, read: false, createdAt: new Date().toISOString(),
    };
    persistLocal([newMsg, ...all]);
    return newMsg;
  }

  const docRef = await addDoc(collection(db, 'contactMessages'), {
    name, email, subject, message, read: false, createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const markMessageRead = async (id) => {
  if (isDemoMode) {
    persistLocal(loadLocal().map(m => m.id === id ? { ...m, read: true } : m));
    return;
  }
  await updateDoc(doc(db, 'contactMessages', id), { read: true });
};

export const markMessageUnread = async (id) => {
  if (isDemoMode) {
    persistLocal(loadLocal().map(m => m.id === id ? { ...m, read: false } : m));
    return;
  }
  await updateDoc(doc(db, 'contactMessages', id), { read: false });
};

export const deleteMessage = async (id) => {
  if (isDemoMode) {
    persistLocal(loadLocal().filter(m => m.id !== id));
    return;
  }
  await deleteDoc(doc(db, 'contactMessages', id));
};
