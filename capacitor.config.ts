
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inkor.tour',
  appName: 'Inkor Tour',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FFFFFF",
      showSpinner: true,
      spinnerColor: "#C10519", // Primary red color
      androidSpinnerStyle: "large"
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#FFFFFF"
    }
  },
  android: {
    backgroundColor: "#FFFFFF"
  },
  ios: {
    backgroundColor: "#FFFFFF"
  }
};

export default config;
