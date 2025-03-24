
// This file contains utility functions for interacting with Capacitor plugins
// We wrap native calls in try/catch with fallbacks for web environments

// Check if Capacitor is available
export const isCapacitorAvailable = () => {
  return typeof window !== 'undefined' && window.hasOwnProperty('Capacitor');
};

// Get Capacitor plugins object
export const getCapacitor = () => {
  if (isCapacitorAvailable()) {
    return (window as any).Capacitor;
  }
  return null;
};

// Get a specific Capacitor plugin
export const getPlugin = (pluginName: string) => {
  const capacitor = getCapacitor();
  if (capacitor && capacitor.Plugins && capacitor.Plugins[pluginName]) {
    return capacitor.Plugins[pluginName];
  }
  return null;
};

// Show a native toast if available, or fall back to web implementation
export const showNativeToast = async (message: string, duration: 'short' | 'long' = 'short') => {
  try {
    const Toast = getPlugin('Toast');
    if (Toast) {
      await Toast.show({
        text: message,
        duration: duration
      });
      return true;
    }
  } catch (error) {
    console.error('Error showing native toast:', error);
  }
  return false;
};

// Vibrate the device (if supported)
export const vibrateDevice = (duration: number = 300) => {
  try {
    const Haptics = getPlugin('Haptics');
    if (Haptics) {
      Haptics.vibrate({ duration });
      return true;
    } else if ('vibrate' in navigator) {
      navigator.vibrate(duration);
      return true;
    }
  } catch (error) {
    console.error('Error vibrating device:', error);
  }
  return false;
};

// Take a photo using device camera
export const takePhoto = async () => {
  try {
    const Camera = getPlugin('Camera');
    if (Camera) {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'base64',
        source: 'CAMERA'
      });
      
      return {
        base64String: `data:image/jpeg;base64,${image.base64String}`,
        path: image.path,
        webPath: image.webPath
      };
    }
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
  return null;
};

// Scan a barcode/QR code (actual implementation for Scanner.tsx)
export const scanBarcode = async () => {
  try {
    const BarcodeScanner = getPlugin('BarcodeScanner');
    if (BarcodeScanner) {
      // Prepare the scanner
      await BarcodeScanner.prepare();
      
      // Start scanning
      const result = await BarcodeScanner.startScan();
      
      // Return scan results
      if (result.hasContent) {
        return {
          content: result.content,
          format: result.format
        };
      }
    }
  } catch (error) {
    console.error('Error scanning barcode:', error);
  }
  return null;
};

// Get device info
export const getDeviceInfo = async () => {
  try {
    const Device = getPlugin('Device');
    if (Device) {
      return await Device.getInfo();
    }
  } catch (error) {
    console.error('Error getting device info:', error);
  }
  return null;
};

// Check network status
export const getNetworkStatus = async () => {
  try {
    const Network = getPlugin('Network');
    if (Network) {
      return await Network.getStatus();
    }
  } catch (error) {
    console.error('Error getting network status:', error);
  }
  return { connected: navigator.onLine, connectionType: navigator.onLine ? 'wifi' : 'none' };
};

// Set status bar style
export const setStatusBarStyle = (style: 'dark' | 'light') => {
  try {
    const StatusBar = getPlugin('StatusBar');
    if (StatusBar) {
      style === 'dark' ? StatusBar.setStyle({ style: 'DARK' }) : StatusBar.setStyle({ style: 'LIGHT' });
      return true;
    }
  } catch (error) {
    console.error('Error setting status bar style:', error);
  }
  return false;
};
