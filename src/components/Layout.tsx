
import React, { useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { UserMenu } from "./UserMenu";
import { useIsMobile, isMobileApp } from "@/hooks/use-mobile";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const isApp = isMobileApp();
  
  // Handle mobile app-specific behaviors
  useEffect(() => {
    if (isApp) {
      // Prevent browser default gestures for mobile apps
      document.addEventListener('touchmove', (e) => {
        // Allow scrolling of page content but prevent pull-to-refresh
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }, { passive: false });
      
      // Set status bar color for mobile apps if using Capacitor
      if (window.hasOwnProperty('Capacitor') && (window as any).Capacitor?.Plugins?.StatusBar) {
        try {
          const { StatusBar } = (window as any).Capacitor.Plugins;
          StatusBar.setBackgroundColor({ color: '#FFFFFF' });
          StatusBar.setStyle({ style: 'dark' });
        } catch (error) {
          console.error('Error setting status bar:', error);
        }
      }
    }
    
    // Add safe area insets for notches, etc.
    const root = document.documentElement;
    root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top, 0px)');
    root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)');
    
    return () => {
      // Cleanup if needed
    };
  }, [isApp]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-white/50 backdrop-blur-sm p-4 flex justify-end sticky top-0 z-10 pt-[calc(var(--safe-area-inset-top)+1rem)]">
            <UserMenu />
          </header>
          <main className="flex-1 p-4 md:p-6 space-y-6 pb-[calc(var(--safe-area-inset-bottom)+1.5rem)]">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
