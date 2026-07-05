import { useState, useEffect } from 'react';
import { subscribeToDocument } from '../lib/firestore';

/**
 * Real-time Firestore document hook
 */
export const useDocument = (collectionName, docId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToDocument(collectionName, docId, (doc) => {
      setData(doc);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, [collectionName, docId]);

  return { data, loading, error };
};

export default useDocument;
