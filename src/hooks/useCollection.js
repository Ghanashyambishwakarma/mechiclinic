import { useState, useEffect } from 'react';
import { subscribeToCollection } from '../lib/firestore';

/**
 * Real-time Firestore collection hook
 */
export const useCollection = (collectionName, orderField = 'createdAt', orderDirection = 'desc') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToCollection(
      collectionName,
      (items) => {
        setData(items);
        setLoading(false);
        setError(null);
      },
      orderField,
      orderDirection
    );

    return unsubscribe;
  }, [collectionName, orderField, orderDirection]);

  return { data, loading, error };
};

export default useCollection;
