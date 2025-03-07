
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Bell, CheckCircle2, Loader2, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  data_criacao: string;
  lida: boolean;
  admin_only: boolean;
  usuario_matricula?: string;
  dados_extras?: Record<string, any>;
}

export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    loadNotifications();
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes',
          filter: 'admin_only=eq.true',
        },
        (payload) => {
          // Add the new notification to the list
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show a toast
          toast({
            title: "Nova notificação",
            description: newNotification.titulo,
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('admin_only', true)
        .order('data_criacao', { ascending: false });
      
      if (error) throw error;
      
      setNotifications(data as Notification[]);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      toast({
        title: "Erro ao carregar notificações",
        description: "Não foi possível carregar as notificações administrativas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMarkAsRead = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, lida: !currentStatus } : notif
      ));
      
      toast({
        title: `Notificação marcada como ${!currentStatus ? 'lida' : 'não lida'}`,
        description: "Status atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar notificação:", error);
      toast({
        title: "Erro ao atualizar notificação",
        description: "Não foi possível atualizar o status da notificação.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove from local state
      setNotifications(notifications.filter(notif => notif.id !== id));
      
      toast({
        title: "Notificação excluída",
        description: "A notificação foi removida com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir notificação:", error);
      toast({
        title: "Erro ao excluir notificação",
        description: "Não foi possível excluir a notificação.",
        variant: "destructive",
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
  };
  
  const getNotificationTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'missao_completada':
        return "Missão Completada";
      default:
        return tipo;
    }
  };
  
  const getNotificationBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'missao_completada':
        return "success";
      default:
        return "default";
    }
  };
  
  const getNotificationDetails = (notification: Notification) => {
    if (notification.tipo === 'missao_completada' && notification.dados_extras) {
      return (
        <div className="mt-1 text-sm text-muted-foreground">
          <p>Missão ID: {notification.dados_extras.missao_id}</p>
          <p>Pontos ganhos: {notification.dados_extras.pontos_ganhos}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações Administrativas
          </CardTitle>
          <CardDescription>
            Acompanhe as atividades que requerem atenção
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadNotifications}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando notificações...</span>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`border rounded-lg p-4 ${notification.lida ? '' : 'bg-primary/5 border-primary/30'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getNotificationBadgeVariant(notification.tipo) as any}>
                        {getNotificationTypeLabel(notification.tipo)}
                      </Badge>
                      {!notification.lida && (
                        <Badge variant="outline" className="bg-primary/10">
                          Nova
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold mt-2">{notification.titulo}</h4>
                    <p className="text-muted-foreground">{notification.mensagem}</p>
                    {getNotificationDetails(notification)}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(notification.data_criacao)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleMarkAsRead(notification.id, notification.lida)}
                      title={notification.lida ? "Marcar como não lida" : "Marcar como lida"}
                    >
                      <CheckCircle2 className={`h-4 w-4 ${notification.lida ? 'text-muted-foreground' : 'text-green-500'}`} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-destructive"
                      title="Excluir notificação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Nenhuma notificação administrativa</p>
            <p className="text-sm mt-1">As notificações aparecerão aqui quando houver atividade.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
