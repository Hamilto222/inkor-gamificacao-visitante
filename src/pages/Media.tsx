
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileVideo, Image, Film, FileText, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface MediaFile {
  id: string;
  name: string;
  type: string;
  url: string;
  created_at: string;
}

const Media = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMediaFiles();
  }, []);

  const loadMediaFiles = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
        return <FileVideo className="h-5 w-5" />;
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
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileVideo className="h-8 w-8" />
            Biblioteca de Mídias
          </h1>
          <p className="text-muted-foreground">
            Confira os vídeos, imagens e documentos da Inkor
          </p>
        </header>
        
        <Card>
          <CardHeader>
            <CardTitle>Arquivos Disponíveis</CardTitle>
            <CardDescription>
              {files.length} arquivos para visualização e download
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Carregando arquivos...</span>
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
                      <div className="flex items-center justify-end mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownloadFile(file.url, file.name)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Baixar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <FileVideo className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Nenhuma mídia disponível no momento</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Media;
