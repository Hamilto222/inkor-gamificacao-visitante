
import React from "react";
import { Layout } from "@/components/Layout";
import { UserCog } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { UserManagement } from "@/components/UserManagement";

const Admin = () => {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <Layout>
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <UserCog className="h-8 w-8" />
                Administração de Usuários
              </h1>
              <p className="text-muted-foreground">
                Gerencie os usuários e suas permissões no sistema
              </p>
            </div>
          </header>
          
          <UserManagement />
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Admin;
