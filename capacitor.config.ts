
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
    },
    CapacitorHttp: {
      enabled: true
    },
    // Add more plugin configurations for app store requirements
    CapacitorCookies: {
      enabled: true
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#C10519"
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  android: {
    backgroundColor: "#FFFFFF",
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    // Configurations for Play Store
    buildOptions: {
      keystorePath: null, // Set this in your build environment
      keystorePassword: null, // Set this in your build environment
      keystoreAlias: null, // Set this in your build environment
      keystoreAliasPassword: null, // Set this in your build environment
      releaseType: "production" // or "development" for testing
    }
  },
  ios: {
    backgroundColor: "#FFFFFF",
    contentInset: "always",
    allowsLinkPreview: false,
    scrollEnabled: true,
    // Configurations for App Store
    limitsNavigationsToAppBoundDomains: true,
    preferredContentMode: "mobile"
  }
};

export default config;
