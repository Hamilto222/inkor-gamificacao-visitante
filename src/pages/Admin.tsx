
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { UserCog, ListChecks, FileVideo, Package2, Bell, Users, Gift, MessageSquare } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { UserManagement } from "@/components/UserManagement";
import { MatriculasManagement } from "@/components/MatriculasManagement";
import { MediaManagement } from "@/components/MediaManagement";
import { ProductManagement } from "@/components/ProductManagement";
import { AdminNotifications } from "@/components/AdminNotifications";
import { MissionManagement } from "@/components/MissionManagement";
import { UserGroupManagement } from "@/components/UserGroupManagement";
import { PrizeManagement } from "@/components/PrizeManagement";
import { NewsFeedManagement } from "@/components/NewsFeedManagement";
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
                Gerencie usuários, matrículas, missões e outras configurações do sistema
              </p>
            </div>
          </header>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-9 w-full max-w-6xl">
              <TabsTrigger value="usuarios" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="grupos" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Grupos
              </TabsTrigger>
              <TabsTrigger value="matriculas" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Matrículas
              </TabsTrigger>
              <TabsTrigger value="missoes" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Missões
              </TabsTrigger>
              <TabsTrigger value="premios" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Prêmios
              </TabsTrigger>
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Feed
              </TabsTrigger>
              <TabsTrigger value="midias" className="flex items-center gap-2">
                <FileVideo className="h-4 w-4" />
                Mídias
              </TabsTrigger>
              <TabsTrigger value="produtos" className="flex items-center gap-2">
                <Package2 className="h-4 w-4" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="notificacoes" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="usuarios" className="space-y-4 mt-6">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="grupos" className="space-y-4 mt-6">
              <UserGroupManagement />
            </TabsContent>
            
            <TabsContent value="matriculas" className="space-y-4 mt-6">
              <MatriculasManagement />
            </TabsContent>
            
            <TabsContent value="missoes" className="space-y-4 mt-6">
              <MissionManagement />
            </TabsContent>
            
            <TabsContent value="premios" className="space-y-4 mt-6">
              <PrizeManagement />
            </TabsContent>
            
            <TabsContent value="feed" className="space-y-4 mt-6">
              <NewsFeedManagement />
            </TabsContent>
            
            <TabsContent value="midias" className="space-y-4 mt-6">
              <MediaManagement />
            </TabsContent>
            
            <TabsContent value="produtos" className="space-y-4 mt-6">
              <ProductManagement />
            </TabsContent>
            
            <TabsContent value="notificacoes" className="space-y-4 mt-6">
              <AdminNotifications />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Admin;
