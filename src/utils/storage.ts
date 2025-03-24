
// Abstraction for storage to handle both web and native environments
// This allows us to easily swap implementations or add encrypted storage for mobile

import { isCapacitorAvailable, getPlugin } from "../capacitor";

// Default implementation using localStorage
const webStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },
  
  getItem: async (key: string): Promise<string | null> => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  },
  
  clear: async (): Promise<void> => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
};

// Get platform specific storage implementation
const getStorage = () => {
  // Check if running in Capacitor and Preferences plugin is available
  if (isCapacitorAvailable()) {
    const Preferences = getPlugin('Preferences');
    
    if (Preferences) {
      // Return native storage implementation
      return {
        setItem: async (key: string, value: string): Promise<void> => {
          try {
            await Preferences.set({ key, value });
          } catch (error) {
            console.error('Error storing data in Preferences:', error);
            // Fall back to web storage
            await webStorage.setItem(key, value);
          }
        },
        
        getItem: async (key: string): Promise<string | null> => {
          try {
            const result = await Preferences.get({ key });
            return result.value;
          } catch (error) {
            console.error('Error retrieving data from Preferences:', error);
            // Fall back to web storage
            return await webStorage.getItem(key);
          }
        },
        
        removeItem: async (key: string): Promise<void> => {
          try {
            await Preferences.remove({ key });
          } catch (error) {
            console.error('Error removing data from Preferences:', error);
            // Fall back to web storage
            await webStorage.removeItem(key);
          }
        },
        
        clear: async (): Promise<void> => {
          try {
            await Preferences.clear();
          } catch (error) {
            console.error('Error clearing data from Preferences:', error);
            // Fall back to web storage
            await webStorage.clear();
          }
        }
      };
    }
  }
  
  // Return web storage implementation as fallback
  return webStorage;
};

// Export the storage interface
const storage = getStorage();
export default storage;

// Helper functions for storing complex objects
export const setObject = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await storage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error storing object:', error);
  }
};

export const getObject = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await storage.getItem(key);
    if (jsonValue) {
      return JSON.parse(jsonValue) as T;
    }
  } catch (error) {
    console.error('Error retrieving object:', error);
  }
  return null;
};
