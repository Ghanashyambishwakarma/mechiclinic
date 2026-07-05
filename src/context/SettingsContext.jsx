import { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToDocument } from '../lib/firestore';
import { COLLECTIONS, DEFAULT_SETTINGS } from '../lib/constants';
import { setGlobalCurrency } from '../lib/utils';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let latestWebsite = null;
    let latestClinic = null;

    const updateCombinedSettings = (websiteData, clinicData) => {
      setSettings(() => {
        // Always start from DEFAULT_SETTINGS as the base fallback
        const merged = { ...DEFAULT_SETTINGS };

        // Deep-merge Firestore website data (only non-null values)
        if (websiteData && typeof websiteData === 'object') {
          Object.keys(websiteData).forEach((key) => {
            const val = websiteData[key];
            if (val === null || val === undefined) return;
            if (
              typeof val === 'object' &&
              !Array.isArray(val) &&
              typeof merged[key] === 'object' &&
              merged[key] !== null &&
              !Array.isArray(merged[key])
            ) {
              // Deep merge nested objects (hero, about, contact, etc.)
              merged[key] = { ...merged[key], ...val };
            } else {
              merged[key] = val;
            }
          });
        }

        // Merge clinic operational settings on top
        if (clinicData && typeof clinicData === 'object') {
          Object.keys(clinicData).forEach((key) => {
            const val = clinicData[key];
            if (val !== null && val !== undefined) {
              merged[key] = val;
            }
          });
          if (clinicData.currency) {
            setGlobalCurrency(clinicData.currency);
          }
        }

        return merged;
      });
      setLoading(false);
    };

    const unsubWebsite = subscribeToDocument(COLLECTIONS.SETTINGS, 'website', (data) => {
      latestWebsite = data;
      updateCombinedSettings(latestWebsite, latestClinic);
    });

    const unsubClinic = subscribeToDocument(COLLECTIONS.SETTINGS, 'clinic', (data) => {
      latestClinic = data;
      updateCombinedSettings(latestWebsite, latestClinic);
    });

    return () => {
      unsubWebsite();
      unsubClinic();
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export default SettingsContext;
