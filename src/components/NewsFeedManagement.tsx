import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Trash2, MessageSquare, Calendar, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsPost {
  id?: string;
  titulo: string;
  conteudo: string;
  imagem_url?: string | null;
  ativo: boolean;
  data_criacao?: string;
  grupos_alvo?: string[] | null;
}

export const NewsFeedManagement = () => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [newPost, setNewPost] = useState<NewsPost>({
    titulo: "",
    conteudo: "",
    ativo: true,
    grupos_alvo: [],
  });
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [availableGroups, setAvailableGroups] = useState<{id: string, nome: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
    loadGroups();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('posts_feed')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const { data: postGroupData, error: postGroupError } = await supabase
          .from('post_grupo')
          .select('*');
          
        if (postGroupError) {
          console.error("Error fetching post groups:", postGroupError);
        }
        
        const processedPosts = data.map(post => {
          let grupos_alvo: string[] = [];
          
          if (postGroupData) {
            const postGroups = postGroupData.filter(pg => pg.post_id === post.id);
            grupos_alvo = postGroups.map(pg => pg.grupo_id);
          }
          
          return {
            ...post,
            grupos_alvo
          };
        });
        
        setPosts(processedPosts);
      }
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
      toast({
        title: "Erro ao carregar posts",
        description: "Não foi possível carregar os posts do feed.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('grupos_usuarios')
        .select('id, nome');

      if (error) {
        throw error;
      }

      if (data) {
        setAvailableGroups(data);
      }
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
    }
  };

  const handleAddPost = async () => {
    if (!newPost.titulo || !newPost.conteudo) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('posts_feed')
        .insert([{
          titulo: newPost.titulo,
          conteudo: newPost.conteudo,
          imagem_url: newPost.imagem_url || null,
          ativo: newPost.ativo
        }])
        .select();

      if (error) {
        throw error;
      }

      if (selectedGroups.length > 0 && data && data.length > 0) {
        const postId = data[0].id;
        
        const grupoPostData = selectedGroups.map(groupId => ({
          post_id: postId,
          grupo_id: groupId
        }));
        
        const { error: groupError } = await supabase
          .from('post_grupo')
          .insert(grupoPostData);
          
        if (groupError) {
          console.error("Erro ao associar post a grupos:", groupError);
          toast({
            title: "Aviso",
            description: "Post criado, mas houve um erro ao associá-lo aos grupos.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Post criado",
        description: `O post "${newPost.titulo}" foi criado com sucesso.`,
      });
      
      setNewPost({
        titulo: "",
        conteudo: "",
        ativo: true,
        grupos_alvo: [],
      });
      setSelectedGroups([]);
      
      setOpenDialog(false);
      loadPosts();
    } catch (error) {
      console.error("Erro ao criar post:", error);
      toast({
        title: "Erro ao criar post",
        description: "Não foi possível criar o post.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('posts_feed')
        .update({ ativo: !currentStatus })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: currentStatus ? "Post desativado" : "Post ativado",
        description: `O post foi ${currentStatus ? "desativado" : "ativado"} com sucesso.`,
      });

      loadPosts();
    } catch (error) {
      console.error("Erro ao atualizar status do post:", error);
      toast({
        title: "Erro ao atualizar post",
        description: "Não foi possível atualizar o status do post.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const { error: pgError } = await supabase
        .from('post_grupo')
        .delete()
        .eq('post_id', id);
        
      if (pgError) {
        console.error("Error deleting post_grupo records:", pgError);
      }
        
      const { error: commentsError } = await supabase
        .from('comentarios_post')
        .delete()
        .eq('post_id', id);
        
      if (commentsError) {
        console.error("Error deleting comments:", commentsError);
      }
        
      const { error: reactionsError } = await supabase
        .from('reacoes_post')
        .delete()
        .eq('post_id', id);
        
      if (reactionsError) {
        console.error("Error deleting reactions:", reactionsError);
      }
        
      const { error } = await supabase
        .from('posts_feed')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Post excluído",
        description: "O post foi excluído com sucesso.",
      });

      loadPosts();
    } catch (error) {
      console.error("Erro ao excluir post:", error);
      toast({
        title: "Erro ao excluir post",
        description: "Não foi possível excluir o post.",
        variant: "destructive",
      });
    }
  };

  const handleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
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

  const filteredPosts = posts.filter(post => 
    post.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.conteudo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex-1" />
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Publicação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Publicação</DialogTitle>
              <DialogDescription>
                Adicione uma nova publicação ao feed de notícias
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título da Publicação</Label>
                <Input 
                  id="titulo" 
                  value={newPost.titulo}
                  onChange={(e) => setNewPost({...newPost, titulo: e.target.value})}
                  placeholder="Digite o título da publicação"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="conteudo">Conteúdo</Label>
                <Textarea 
                  id="conteudo" 
                  rows={5}
                  value={newPost.conteudo}
                  onChange={(e) => setNewPost({...newPost, conteudo: e.target.value})}
                  placeholder="Escreva o conteúdo da publicação"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imagem">URL da Imagem (opcional)</Label>
                <Input 
                  id="imagem" 
                  value={newPost.imagem_url || ""}
                  onChange={(e) => setNewPost({...newPost, imagem_url: e.target.value})}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="ativo"
                  checked={newPost.ativo} 
                  onCheckedChange={(checked) => setNewPost({...newPost, ativo: checked})}
                />
                <Label htmlFor="ativo">Publicação ativa</Label>
              </div>
              
              <div className="space-y-2 border p-4 rounded-md">
                <Label className="block mb-2">Grupos que podem ver esta publicação</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableGroups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Switch 
                        id={`group-${group.id}`}
                        checked={selectedGroups.includes(group.id)} 
                        onCheckedChange={() => handleGroupSelection(group.id)}
                      />
                      <Label htmlFor={`group-${group.id}`}>{group.nome}</Label>
                    </div>
                  ))}
                </div>
                {availableGroups.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum grupo disponível</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Se nenhum grupo for selecionado, a publicação será visível para todos os usuários.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={handleAddPost} disabled={isLoading}>
                {isLoading ? "Salvando..." : "Publicar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Feed de Notícias</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar publicações"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            Total de {filteredPosts.length} publicações no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Grupos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.titulo}</TableCell>
                      <TableCell>{post.data_criacao ? formatDate(post.data_criacao) : '-'}</TableCell>
                      <TableCell>
                        {post.grupos_alvo && post.grupos_alvo.length > 0 
                          ? <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{post.grupos_alvo.length} grupo(s)</span>
                            </div>
                          : "Todos"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={post.ativo} 
                            onCheckedChange={() => post.id && handleToggleStatus(post.id, post.ativo)} 
                          />
                          <span>{post.ativo ? "Ativa" : "Inativa"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => post.id && handleToggleStatus(post.id, post.ativo)}>
                            {post.ativo ? "Desativar" : "Ativar"}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => post.id && handleDeletePost(post.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      {searchTerm 
                        ? "Nenhuma publicação encontrada com estes termos de busca." 
                        : "Nenhuma publicação cadastrada no sistema."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
