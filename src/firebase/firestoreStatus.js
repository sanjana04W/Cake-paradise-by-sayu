/**
 * Checks whether Firestore writes are allowed by attempting a test write.
 * Returns true if rules are open, false if permission-denied.
 */
import { db } from './config';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

let _status = null; // null=unchecked, true=open, false=blocked

export const checkFirestoreWritable = async () => {
  if (_status !== null) return _status;
  try {
    const ref = doc(db, '_setup_check', 'ping');
    await setDoc(ref, { ts: serverTimestamp() });
    await deleteDoc(ref);
    _status = true;
  } catch {
    _status = false;
  }
  return _status;
};

export const isFirestoreOpen = () => _status === true;
