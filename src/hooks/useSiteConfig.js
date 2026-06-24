import { useState, useEffect } from 'react';
import { getSiteConfig } from '../firebase/firestore';

export const useSiteConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getSiteConfig();
        setConfig(data);
      } catch (err) {
        console.error('Error fetching site config:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading };
};
