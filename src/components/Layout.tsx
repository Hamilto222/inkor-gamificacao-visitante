
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { UserMenu } from "./UserMenu";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-white/50 backdrop-blur-sm p-4 flex justify-end">
            <UserMenu />
          </header>
          <main className="flex-1 p-6 space-y-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
