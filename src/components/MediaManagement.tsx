
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Download, Image, FileVideo, FilePlus, Film, FileText, Maximize2, Edit, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Textarea } from "@/components/ui/textarea";

interface MediaFile {
  id: string;
  name: string;
  type: string;
  url: string;
  created_at: string;
  title: string;
  description: string | null;
}

export const MediaManagement = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [newMedia, setNewMedia] = useState({
    file: null as File | null,
    title: "",
    description: ""
  });
  const [editMedia, setEditMedia] = useState({
    title: "",
    description: ""
  });
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
              
            // Tentar obter os metadados do arquivo (título e descrição)
            const { data: metaData, error: metaError } = await supabase
              .from('media_metadata')
              .select('*')
              .eq('filename', file.name)
              .single();
              
            return {
              id: file.id,
              name: file.name,
              type: getFileType(file.name),
              url: urlData?.signedUrl || '',
              created_at: file.created_at,
              title: metaData?.title || file.name,
              description: metaData?.description || ''
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewMedia({
        ...newMedia,
        file
      });
    }
  };

  const handleFileUpload = async () => {
    if (!newMedia.file || !newMedia.title) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione um arquivo e adicione um título.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = newMedia.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      // Set initial progress
      setUploadProgress(10);
      
      // Upload file
      const { error } = await supabase.storage
        .from('media-files')
        .upload(fileName, newMedia.file, {
          cacheControl: '3600'
        });

      if (error) {
        throw error;
      }

      // Upload completed
      setUploadProgress(100);

      // Salvar metadados do arquivo (título e descrição)
      const { error: metaError } = await supabase
        .from('media_metadata')
        .insert([
          {
            filename: fileName,
            title: newMedia.title,
            description: newMedia.description
          }
        ]);

      if (metaError) {
        throw metaError;
      }

      toast({
        title: "Arquivo enviado com sucesso",
        description: "O arquivo foi carregado no sistema.",
      });

      setOpenDialog(false);
      setNewMedia({
        file: null,
        title: "",
        description: ""
      });
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
      // Primeiro, excluir metadados
      await supabase
        .from('media_metadata')
        .delete()
        .eq('filename', fileName);
        
      // Depois, excluir o arquivo
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
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenPreview = (file: MediaFile) => {
    setSelectedFile(file);
    setOpenPreviewDialog(true);
  };
  
  const handleOpenEdit = (file: MediaFile) => {
    setSelectedFile(file);
    setEditMedia({
      title: file.title,
      description: file.description || ""
    });
    setOpenEditDialog(true);
  };
  
  const handleUpdateMedia = async () => {
    if (!selectedFile || !editMedia.title) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, adicione um título para a mídia.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('media_metadata')
        .update({
          title: editMedia.title,
          description: editMedia.description || null
        })
        .eq('filename', selectedFile.name);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Mídia atualizada",
        description: "As informações da mídia foram atualizadas com sucesso.",
      });
      
      // Atualizar o arquivo na lista local
      setFiles(files.map(file => 
        file.name === selectedFile.name 
          ? {...file, title: editMedia.title, description: editMedia.description || null} 
          : file
      ));
      
      setOpenEditDialog(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Erro ao atualizar mídia:", error);
      toast({
        title: "Erro ao atualizar mídia",
        description: "Não foi possível atualizar as informações da mídia.",
        variant: "destructive",
      });
    }
  };

  const renderFilePreview = (file: MediaFile, fullSize: boolean = false) => {
    const containerClass = fullSize ? "w-full h-auto max-h-[70vh]" : "rounded-md object-cover w-full h-full";
    
    if (file.type === 'image') {
      return (
        <AspectRatio ratio={16 / 9}>
          <img 
            src={file.url} 
            alt={file.title} 
            className={containerClass}
          />
        </AspectRatio>
      );
    } else if (file.type === 'video') {
      return (
        <AspectRatio ratio={16 / 9}>
          <video 
            src={file.url} 
            controls 
            className={containerClass}
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
                  <Label htmlFor="title">Título</Label>
                  <Input 
                    id="title" 
                    value={newMedia.title}
                    onChange={(e) => setNewMedia({...newMedia, title: e.target.value})}
                    placeholder="Digite um título para o arquivo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea 
                    id="description" 
                    value={newMedia.description}
                    onChange={(e) => setNewMedia({...newMedia, description: e.target.value})}
                    placeholder="Digite uma descrição para o arquivo"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo</Label>
                  <Input 
                    id="file" 
                    type="file" 
                    accept="image/*,video/*,application/pdf"
                    onChange={handleFileChange}
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
                <Button onClick={handleFileUpload} disabled={isUploading || !newMedia.file || !newMedia.title}>
                  {isUploading ? "Enviando..." : "Confirmar"}
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
                  <div className="p-2 cursor-pointer" onClick={() => handleOpenPreview(file)}>
                    {renderFilePreview(file)}
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.type)}
                      <p className="text-sm font-medium truncate flex-1">{file.title}</p>
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
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(file)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenPreview(file)}
                      >
                        <Maximize2 className="h-4 w-4 mr-1" />
                        Visualizar
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

      {/* Dialog de visualização */}
      <Dialog open={openPreviewDialog} onOpenChange={setOpenPreviewDialog}>
        <DialogContent className="sm:max-w-[800px]">
          {selectedFile && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedFile.title}</DialogTitle>
                {selectedFile.description && (
                  <DialogDescription>
                    {selectedFile.description}
                  </DialogDescription>
                )}
              </DialogHeader>
              
              <div className="py-4">
                <div className="mb-4">
                  {renderFilePreview(selectedFile, true)}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => handleDownloadFile(selectedFile.url, selectedFile.name)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar
                </Button>
                <Button variant="default" onClick={() => setOpenPreviewDialog(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog de edição */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          {selectedFile && (
            <>
              <DialogHeader>
                <DialogTitle>Editar Mídia</DialogTitle>
                <DialogDescription>
                  Altere as informações da mídia selecionada
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Título</Label>
                  <Input 
                    id="edit-title" 
                    value={editMedia.title}
                    onChange={(e) => setEditMedia({...editMedia, title: e.target.value})}
                    placeholder="Digite um título para o arquivo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descrição (opcional)</Label>
                  <Textarea 
                    id="edit-description" 
                    value={editMedia.description}
                    onChange={(e) => setEditMedia({...editMedia, description: e.target.value})}
                    placeholder="Digite uma descrição para o arquivo"
                    rows={3}
                  />
                </div>
                
                <div className="mt-2">
                  <Label>Pré-visualização</Label>
                  <div className="mt-2 border rounded-md p-2">
                    {renderFilePreview(selectedFile)}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateMedia}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
