import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './constants';

/**
 * Generic Firestore CRUD helpers
 */
export const getCollectionRef = (collectionName) => collection(db, collectionName);

export const getDocRef = (collectionName, docId) => doc(db, collectionName, docId);

export const createDocument = async (collectionName, data) => {
  const docRef = await addDoc(getCollectionRef(collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const setDocument = async (collectionName, docId, data) => {
  await setDoc(getDocRef(collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const updateDocument = async (collectionName, docId, data) => {
  await updateDoc(getDocRef(collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDocument = async (collectionName, docId) => {
  await deleteDoc(getDocRef(collectionName, docId));
};

export const getDocument = async (collectionName, docId) => {
  const snap = await getDoc(getDocRef(collectionName, docId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const getAllDocuments = async (collectionName, orderField = 'createdAt', orderDirection = 'desc') => {
  const q = query(getCollectionRef(collectionName), orderBy(orderField, orderDirection));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToCollection = (collectionName, callback, orderField = 'createdAt', orderDirection = 'desc') => {
  const q = query(getCollectionRef(collectionName), orderBy(orderField, orderDirection));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(data);
  });
};

export const subscribeToDocument = (collectionName, docId, callback) => {
  return onSnapshot(getDocRef(collectionName, docId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback(null);
    }
  });
};

export const logActivity = async (action, collectionName, docId, userEmail) => {
  await addDoc(getCollectionRef(COLLECTIONS.ACTIVITY_LOGS), {
    action,
    collection: collectionName,
    docId,
    userEmail,
    timestamp: serverTimestamp(),
  });
};

export const generateInvoiceNumber = async () => {
  const counterRef = doc(db, COLLECTIONS.SETTINGS, 'counters');

  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(counterRef);
    const current = snap.exists() ? snap.data().invoiceNumber || 1000 : 1000;
    const next = current + 1;
    transaction.set(counterRef, { invoiceNumber: next }, { merge: true });
    return `MC-${String(next).padStart(5, '0')}`;
  });
};

export const batchWrite = () => writeBatch(db);

export { serverTimestamp, query, where, orderBy, limit };
