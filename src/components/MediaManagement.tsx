
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Download, Image, FileVideo, FilePlus, Film, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface MediaFile {
  id: string;
  name: string;
  type: string;
  url: string;
  created_at: string;
}

export const MediaManagement = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se o usuário é administrador
    const currentUserStr = localStorage.getItem("currentUser");
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      setIsAdmin(currentUser.role === "admin");
    }

    // Carregar arquivos de mídia
    loadMediaFiles();
  }, []);

  const loadMediaFiles = async () => {
    try {
      const { data, error } = await supabase.storage.from('media-files').list();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const filesWithUrls = await Promise.all(
          data.map(async (file) => {
            const { data: urlData } = await supabase.storage
              .from('media-files')
              .createSignedUrl(file.name, 3600); // URL válida por 1 hora
              
            return {
              id: file.id,
              name: file.name,
              type: getFileType(file.name),
              url: urlData?.signedUrl || '',
              created_at: file.created_at
            };
          })
        );
        
        setFiles(filesWithUrls);
      }
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
      toast({
        title: "Erro ao carregar arquivos",
        description: "Não foi possível carregar os arquivos de mídia.",
        variant: "destructive",
      });
    }
  };

  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return 'image';
    } else if (['mp4', 'mov', 'avi'].includes(extension || '')) {
      return 'video';
    } else if (['pdf'].includes(extension || '')) {
      return 'pdf';
    }
    return 'other';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'video':
        return <Film className="h-5 w-5" />;
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      default:
        return <FilePlus className="h-5 w-5" />;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('media-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          onUploadProgress: (progress) => {
            const percent = progress.percent ? Math.round(progress.percent) : 0;
            setUploadProgress(percent);
          }
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Arquivo enviado com sucesso",
        description: "O arquivo foi carregado no sistema.",
      });

      setOpenDialog(false);
      await loadMediaFiles(); // Recarregar a lista
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      toast({
        title: "Erro ao enviar arquivo",
        description: "Não foi possível enviar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    try {
      const { error } = await supabase.storage
        .from('media-files')
        .remove([fileName]);

      if (error) {
        throw error;
      }

      toast({
        title: "Arquivo excluído",
        description: "O arquivo foi removido com sucesso.",
      });

      // Atualizar lista de arquivos
      setFiles(files.filter(file => file.name !== fileName));
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error);
      toast({
        title: "Erro ao excluir arquivo",
        description: "Não foi possível excluir o arquivo.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadFile = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFilePreview = (file: MediaFile) => {
    if (file.type === 'image') {
      return (
        <AspectRatio ratio={16 / 9}>
          <img 
            src={file.url} 
            alt={file.name} 
            className="rounded-md object-cover w-full h-full"
          />
        </AspectRatio>
      );
    } else if (file.type === 'video') {
      return (
        <AspectRatio ratio={16 / 9}>
          <video 
            src={file.url} 
            controls 
            className="rounded-md w-full h-full"
          />
        </AspectRatio>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-32 bg-gray-100 rounded-md">
          {getFileIcon(file.type)}
        </div>
      );
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex-1" />
        {isAdmin && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Mídia
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Mídia</DialogTitle>
                <DialogDescription>
                  Adicione imagens, vídeos ou documentos para compartilhar com os usuários.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo</Label>
                  <Input 
                    id="file" 
                    type="file" 
                    accept="image/*,video/*,application/pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="mt-2 space-y-2">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-center">{uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)} disabled={isUploading}>
                  Cancelar
                </Button>
                <Button disabled={true} className="opacity-0">
                  Confirmar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Biblioteca de Mídias</CardTitle>
          <CardDescription>
            {files.length} arquivos disponíveis para visualização
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isUploading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Enviando arquivo...</span>
            </div>
          ) : files.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <Card key={file.id} className="overflow-hidden">
                  <div className="p-2">
                    {renderFilePreview(file)}
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.type)}
                      <p className="text-sm font-medium truncate flex-1">{file.name}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDownloadFile(file.url, file.name)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                      </Button>
                      
                      {isAdmin && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteFile(file.name)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <FileVideo className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>Nenhuma mídia disponível</p>
              {isAdmin && (
                <p className="text-sm mt-1">
                  Clique em "Nova Mídia" para adicionar arquivos
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
