
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { UserCog, ListChecks } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { UserManagement } from "@/components/UserManagement";
import { MatriculasManagement } from "@/components/MatriculasManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("usuarios");

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <Layout>
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <UserCog className="h-8 w-8" />
                Painel de Administração
              </h1>
              <p className="text-muted-foreground">
                Gerencie usuários, matrículas e outras configurações do sistema
              </p>
            </div>
          </header>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-[400px]">
              <TabsTrigger value="usuarios" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="matriculas" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Matrículas
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="usuarios" className="space-y-4 mt-6">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="matriculas" className="space-y-4 mt-6">
              <MatriculasManagement />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Admin;
