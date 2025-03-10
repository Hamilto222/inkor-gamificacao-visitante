
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Heart, Send, Calendar, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  titulo: string;
  conteudo: string;
  imagem_url: string | null;
  data_criacao: string;
  reacoes: {
    id: string;
    tipo: string;
    matricula: string;
  }[];
  comentarios: {
    id: string;
    texto: string;
    matricula: string;
    nome_usuario: string;
    data_criacao: string;
  }[];
  reacao_usuario?: string | null;
}

const NewsFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [userMatricula, setUserMatricula] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    // Carregar matrícula do usuário atual
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      setUserMatricula(currentUser.matricula);
      setUserName(currentUser.nome);
      
      loadPosts(currentUser.matricula);
    }
    
    // Set up subscription to new posts
    const channel = supabase
      .channel('posts-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts_feed'
      }, (payload) => {
        loadPosts(userMatricula);
        
        toast({
          title: "Nova publicação",
          description: "Uma nova publicação foi adicionada ao feed.",
        });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPosts = async (matricula: string) => {
    try {
      setIsLoading(true);
      
      // Get user groups
      const { data: userData, error: userError } = await supabase
        .from('matriculas_funcionarios')
        .select('grupo_id')
        .eq('numero_matricula', matricula)
        .single();
      
      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }
      
      const userGroupId = userData?.grupo_id;
      
      // Get posts that are either for all groups or for the user's group
      let query = supabase
        .from('posts_feed')
        .select(`
          *,
          post_grupo (grupo_id)
        `)
        .eq('ativo', true)
        .order('data_criacao', { ascending: false });
        
      const { data: postsData, error: postsError } = await query;
      
      if (postsError) {
        throw postsError;
      }
      
      if (postsData) {
        // Filter posts based on group access
        let filteredPosts = postsData.filter(post => {
          // If post has no groups, it's available to everyone
          if (!post.post_grupo || post.post_grupo.length === 0) {
            return true;
          }
          
          // If user has no group but post has groups, check if post is available to all
          if (!userGroupId) {
            return false;
          }
          
          // Check if post's groups include user's group
          return post.post_grupo.some((pg: any) => pg.grupo_id === userGroupId);
        });
        
        // Get reactions for each post
        const postsWithReactions = await Promise.all(
          filteredPosts.map(async (post) => {
            // Get reactions
            const { data: reacoes, error: reacoesError } = await supabase
              .from('reacoes_post')
              .select('id, tipo, matricula')
              .eq('post_id', post.id);
              
            if (reacoesError) {
              console.error("Erro ao carregar reações:", reacoesError);
              return { ...post, reacoes: [], comentarios: [] };
            }
            
            // Get comments
            const { data: comentarios, error: comentariosError } = await supabase
              .from('comentarios_post')
              .select(`
                id, 
                texto, 
                matricula,
                data_criacao,
                matriculas_funcionarios (nome)
              `)
              .eq('post_id', post.id)
              .order('data_criacao', { ascending: true });
              
            if (comentariosError) {
              console.error("Erro ao carregar comentários:", comentariosError);
              return { ...post, reacoes: reacoes || [], comentarios: [] };
            }
            
            // Format comments to include user name
            const formattedComentarios = comentarios ? comentarios.map((comentario: any) => ({
              id: comentario.id,
              texto: comentario.texto,
              matricula: comentario.matricula,
              nome_usuario: comentario.matriculas_funcionarios?.nome || "Usuário",
              data_criacao: comentario.data_criacao
            })) : [];
            
            // Check if user has reacted to this post
            const userReaction = reacoes?.find(r => r.matricula === matricula)?.tipo || null;
            
            return { 
              ...post, 
              reacoes: reacoes || [], 
              comentarios: formattedComentarios,
              reacao_usuario: userReaction
            };
          })
        );
        
        setPosts(postsWithReactions);
      }
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
      toast({
        title: "Erro ao carregar feed",
        description: "Não foi possível carregar as publicações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (postId: string, tipo: string) => {
    if (!userMatricula) {
      toast({
        title: "Usuário não identificado",
        description: "Você precisa estar logado para reagir às publicações.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Check if user has already reacted
      const post = posts.find(p => p.id === postId);
      const existingReaction = post?.reacoes.find(r => r.matricula === userMatricula);
      
      if (existingReaction) {
        // If same reaction type, remove it (toggle off)
        if (existingReaction.tipo === tipo) {
          await supabase
            .from('reacoes_post')
            .delete()
            .eq('id', existingReaction.id);
        } else {
          // If different reaction type, update it
          await supabase
            .from('reacoes_post')
            .update({ tipo })
            .eq('id', existingReaction.id);
        }
      } else {
        // Create new reaction
        await supabase
          .from('reacoes_post')
          .insert([{
            post_id: postId,
            matricula: userMatricula,
            tipo
          }]);
      }
      
      // Reload posts to update reactions
      loadPosts(userMatricula);
    } catch (error) {
      console.error("Erro ao reagir à publicação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar sua reação.",
        variant: "destructive",
      });
    }
  };

  const handleComment = async (postId: string) => {
    if (!userMatricula) {
      toast({
        title: "Usuário não identificado",
        description: "Você precisa estar logado para comentar nas publicações.",
        variant: "destructive",
      });
      return;
    }
    
    const commentText = newComment[postId];
    
    if (!commentText || commentText.trim() === "") {
      toast({
        title: "Comentário vazio",
        description: "Por favor, escreva algo para comentar.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await supabase
        .from('comentarios_post')
        .insert([{
          post_id: postId,
          matricula: userMatricula,
          texto: commentText.trim()
        }]);
        
      // Clear comment input
      setNewComment({...newComment, [postId]: ""});
      
      // Reload posts to update comments
      loadPosts(userMatricula);
    } catch (error) {
      console.error("Erro ao comentar na publicação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar seu comentário.",
        variant: "destructive",
      });
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
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="text-center space-y-4">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Feed de Notícias
          </h1>
          <p className="text-muted-foreground">
            Fique por dentro das novidades e interaja com a comunidade
          </p>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3">Carregando publicações...</span>
          </div>
        ) : posts.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhuma publicação encontrada</p>
              <p className="text-muted-foreground">
                Não há publicações disponíveis no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{post.titulo}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(post.data_criacao)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="whitespace-pre-line">{post.conteudo}</p>
                  
                  {post.imagem_url && (
                    <div className="mt-4">
                      <img 
                        src={post.imagem_url} 
                        alt={post.titulo}
                        className="rounded-md max-h-[400px] w-auto mx-auto object-contain"  
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className={`h-5 w-5 ${post.reacao_usuario === 'like' ? 'text-blue-500 fill-blue-500' : 'text-muted-foreground'}`} />
                      <span>{post.reacoes.filter(r => r.tipo === 'like').length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className={`h-5 w-5 ${post.reacao_usuario === 'dislike' ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
                      <span>{post.reacoes.filter(r => r.tipo === 'dislike').length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      <span>{post.comentarios.length}</span>
                    </div>
                  </div>
                </CardContent>
                
                <Separator />
                
                <CardFooter className="flex flex-col p-0">
                  <div className="flex w-full">
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-none border-r"
                      onClick={() => handleReaction(post.id, 'like')}
                    >
                      <ThumbsUp className={`mr-2 h-5 w-5 ${post.reacao_usuario === 'like' ? 'text-blue-500 fill-blue-500' : ''}`} />
                      Curtir
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-none"
                      onClick={() => handleReaction(post.id, 'dislike')}
                    >
                      <ThumbsDown className={`mr-2 h-5 w-5 ${post.reacao_usuario === 'dislike' ? 'text-red-500 fill-red-500' : ''}`} />
                      Não curtir
                    </Button>
                  </div>
                  
                  {post.comentarios.length > 0 && (
                    <div className="w-full p-4 space-y-4">
                      <h4 className="font-medium text-sm">Comentários</h4>
                      <div className="space-y-4">
                        {post.comentarios.map(comment => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {comment.nome_usuario.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="font-medium text-sm">{comment.nome_usuario}</div>
                                <p className="text-sm">{comment.texto}</p>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDate(comment.data_criacao)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="w-full p-4">
                    <div className="flex gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Escreva um comentário..."
                          value={newComment[post.id] || ""}
                          onChange={(e) => setNewComment({...newComment, [post.id]: e.target.value})}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleComment(post.id);
                            }
                          }}
                        />
                        <Button size="icon" onClick={() => handleComment(post.id)}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NewsFeed;
