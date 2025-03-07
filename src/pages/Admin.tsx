
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { UserCog, ListChecks, FileVideo, Package2 } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { UserManagement } from "@/components/UserManagement";
import { MatriculasManagement } from "@/components/MatriculasManagement";
import { MediaManagement } from "@/components/MediaManagement";
import { ProductManagement } from "@/components/ProductManagement";
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
            <TabsList className="grid grid-cols-4 w-full max-w-[700px]">
              <TabsTrigger value="usuarios" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="matriculas" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Matrículas
              </TabsTrigger>
              <TabsTrigger value="midias" className="flex items-center gap-2">
                <FileVideo className="h-4 w-4" />
                Mídias
              </TabsTrigger>
              <TabsTrigger value="produtos" className="flex items-center gap-2">
                <Package2 className="h-4 w-4" />
                Produtos
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="usuarios" className="space-y-4 mt-6">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="matriculas" className="space-y-4 mt-6">
              <MatriculasManagement />
            </TabsContent>
            
            <TabsContent value="midias" className="space-y-4 mt-6">
              <MediaManagement />
            </TabsContent>
            
            <TabsContent value="produtos" className="space-y-4 mt-6">
              <ProductManagement />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Admin;
