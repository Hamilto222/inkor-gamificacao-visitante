
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BellIcon, Check, Info, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Notification {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  data_criacao: string;
  lida: boolean;
  usuario_matricula: string | null;
  dados_extras: any;
}

export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    
    // Set up subscription to new notifications
    const channel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificacoes',
        filter: 'admin_only=eq.true'
      }, (payload) => {
        // Add new notification to the list
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        
        // Show a toast alert
        toast({
          title: "Nova notificação",
          description: newNotification.titulo,
        });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Get admin notifications
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('admin_only', true)
        .order('data_criacao', { ascending: false });

      if (error) {
        throw error;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      toast({
        title: "Erro ao carregar notificações",
        description: "Não foi possível carregar as notificações do administrador.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setOpenDialog(true);
    
    // Mark as read if not already
    if (!notification.lida) {
      markAsRead(notification.id);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', notificationId);

      if (error) {
        throw error;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, lida: true } 
            : notification
        )
      );
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsLoading(true);
      
      const unreadIds = notifications
        .filter(notification => !notification.lida)
        .map(notification => notification.id);
        
      if (unreadIds.length === 0) return;
      
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .in('id', unreadIds);

      if (error) {
        throw error;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, lida: true }))
      );
      
      toast({
        title: "Notificações",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar as notificações como lidas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case "missao_completada":
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <BellIcon className="h-6 w-6" />
              Notificações
            </CardTitle>
            <CardDescription>
              Notificações do sistema para administradores
            </CardDescription>
          </div>
          {notifications.some(n => !n.lida) && (
            <Button variant="outline" onClick={markAllAsRead} disabled={isLoading}>
              Marcar todas como lidas
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-2">Carregando notificações...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <BellIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>Nenhuma notificação no momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex items-start space-x-4 p-4 rounded-lg border ${notification.lida ? '' : 'bg-muted/50'}`}
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.tipo)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{notification.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(notification.data_criacao)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.mensagem}
                    </p>
                    
                    {notification.usuario_matricula && (
                      <p className="text-xs text-muted-foreground">
                        Usuário: {notification.usuario_matricula}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleOpenNotification(notification)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          {selectedNotification && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedNotification.titulo}</DialogTitle>
                <DialogDescription>
                  {formatDate(selectedNotification.data_criacao)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <p>{selectedNotification.mensagem}</p>
                
                {selectedNotification.usuario_matricula && (
                  <div className="text-sm">
                    <span className="font-medium">Usuário:</span> {selectedNotification.usuario_matricula}
                  </div>
                )}
                
                {selectedNotification.dados_extras && (
                  <div className="text-sm space-y-2">
                    <span className="font-medium">Informações adicionais:</span>
                    <div className="bg-muted p-3 rounded-md">
                      <pre className="whitespace-pre-wrap text-xs">
                        {JSON.stringify(selectedNotification.dados_extras, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button onClick={() => setOpenDialog(false)}>Fechar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
