
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">{children}</main>
      </div>
    </SidebarProvider>
  );
};

