
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Edit, Check, PenSquare, Target, ListTodo, HelpCircle, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Switch } from "@/components/ui/switch";

type MissionType = "quiz" | "task" | "activity";

interface Mission {
  id: string;
  titulo: string;
  descricao: string;
  tipo: MissionType;
  pontos: number;
  imagem_url: string | null;
  ativo: boolean;
  opcoes?: { text: string; value: string }[];
  resposta_correta?: string;
  evidencia_obrigatoria: boolean;
  grupo_id?: string | null;
}

interface UserGroup {
  id: string;
  nome: string;
  descricao: string | null;
}

export const MissionManagement = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [isCreatingMission, setIsCreatingMission] = useState(false);
  const [isEditingMission, setIsEditingMission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [newMission, setNewMission] = useState<Partial<Mission>>({
    titulo: "",
    descricao: "",
    tipo: "task",
    pontos: 10,
    imagem_url: null,
    ativo: true,
    opcoes: [],
    resposta_correta: "",
    evidencia_obrigatoria: false,
    grupo_id: null
  });
  
  const [newOption, setNewOption] = useState("");
  const { toast } = useToast();
  
  useEffect(() => {
    loadMissions();
    loadGroups();
  }, []);
  
  const loadMissions = async () => {
    setIsLoading(true);
    try {
      const { data: missionsData, error } = await supabase
        .from('missoes')
        .select('*')
        .order('data_criacao', { ascending: false });
      
      if (error) throw error;
      
      setMissions(missionsData as Mission[]);
    } catch (error) {
      console.error("Erro ao carregar missões:", error);
      toast({
        title: "Erro ao carregar missões",
        description: "Não foi possível carregar as missões.",
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
        .select('*')
        .order('nome');
      
      if (error) throw error;
      
      setGroups(data as UserGroup[]);
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMission({
      ...newMission,
      [name]: value,
    });
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMission({
      ...newMission,
      [name]: parseInt(value) || 0,
    });
  };
  
  const handleTypeChange = (value: string) => {
    setNewMission({
      ...newMission,
      tipo: value as MissionType,
    });
  };
  
  const handleGroupChange = (value: string) => {
    setNewMission({
      ...newMission,
      grupo_id: value === "none" ? null : value,
    });
  };
  
  const handleSwitchChange = (checked: boolean, name: string) => {
    setNewMission({
      ...newMission,
      [name]: checked,
    });
  };
  
  const handleAddOption = () => {
    if (!newOption.trim()) return;
    
    const option = {
      text: newOption,
      value: newOption.toLowerCase().replace(/\s+/g, '_'),
    };
    
    setNewMission({
      ...newMission,
      opcoes: [...(newMission.opcoes || []), option],
    });
    
    setNewOption("");
  };
  
  const handleRemoveOption = (indexToRemove: number) => {
    setNewMission({
      ...newMission,
      opcoes: (newMission.opcoes || []).filter((_, index) => index !== indexToRemove),
    });
  };
  
  const handleSetCorrectAnswer = (value: string) => {
    setNewMission({
      ...newMission,
      resposta_correta: value,
    });
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `mission_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media-files')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get the URL for the uploaded file
      const { data: urlData } = await supabase.storage
        .from('media-files')
        .createSignedUrl(fileName, 3600);
      
      if (urlData?.signedUrl) {
        setNewMission({
          ...newMission,
          imagem_url: urlData.signedUrl,
        });
        
        toast({
          title: "Imagem enviada com sucesso",
          description: "A imagem foi adicionada à missão.",
        });
      }
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast({
        title: "Erro ao enviar imagem",
        description: "Não foi possível enviar a imagem.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleCreateMission = async () => {
    if (!newMission.titulo || !newMission.descricao) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e a descrição da missão.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Insert mission to missions table
      const { data, error } = await supabase
        .from('missoes')
        .insert([{
          titulo: newMission.titulo,
          descricao: newMission.descricao,
          tipo: newMission.tipo,
          pontos: newMission.pontos,
          imagem_url: newMission.imagem_url,
          ativo: newMission.ativo,
          opcoes: newMission.opcoes && newMission.opcoes.length > 0 ? newMission.opcoes : null,
          resposta_correta: newMission.tipo === 'quiz' ? newMission.resposta_correta : null,
          evidencia_obrigatoria: newMission.tipo === 'task' || newMission.tipo === 'activity' ? newMission.evidencia_obrigatoria : false,
          grupo_id: newMission.grupo_id
        }])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Missão criada com sucesso",
        description: "A missão foi adicionada ao sistema.",
      });
      
      setIsCreatingMission(false);
      setNewMission({
        titulo: "",
        descricao: "",
        tipo: "task",
        pontos: 10,
        imagem_url: null,
        ativo: true,
        opcoes: [],
        resposta_correta: "",
        evidencia_obrigatoria: false,
        grupo_id: null
      });
      
      // Reload missions to include the new one
      loadMissions();
    } catch (error) {
      console.error("Erro ao criar missão:", error);
      toast({
        title: "Erro ao criar missão",
        description: "Não foi possível criar a missão.",
        variant: "destructive",
      });
    }
  };
  
  const handleEditMission = (mission: Mission) => {
    setSelectedMission(mission);
    setNewMission({
      ...mission,
    });
    setIsEditingMission(true);
  };
  
  const handleUpdateMission = async () => {
    if (!selectedMission || !newMission.titulo || !newMission.descricao) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e a descrição da missão.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('missoes')
        .update({
          titulo: newMission.titulo,
          descricao: newMission.descricao,
          tipo: newMission.tipo,
          pontos: newMission.pontos,
          imagem_url: newMission.imagem_url,
          ativo: newMission.ativo,
          opcoes: newMission.opcoes && newMission.opcoes.length > 0 ? newMission.opcoes : null,
          resposta_correta: newMission.tipo === 'quiz' ? newMission.resposta_correta : null,
          evidencia_obrigatoria: newMission.tipo === 'task' || newMission.tipo === 'activity' ? newMission.evidencia_obrigatoria : false,
          grupo_id: newMission.grupo_id
        })
        .eq('id', selectedMission.id);
      
      if (error) throw error;
      
      toast({
        title: "Missão atualizada com sucesso",
        description: "As alterações foram salvas.",
      });
      
      setIsEditingMission(false);
      setSelectedMission(null);
      
      // Reload missions to reflect changes
      loadMissions();
    } catch (error) {
      console.error("Erro ao atualizar missão:", error);
      toast({
        title: "Erro ao atualizar missão",
        description: "Não foi possível atualizar a missão.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteMission = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta missão?")) {
      try {
        const { error } = await supabase
          .from('missoes')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        toast({
          title: "Missão excluída",
          description: "A missão foi removida com sucesso.",
        });
        
        // Update the missions list
        setMissions(missions.filter(m => m.id !== id));
      } catch (error) {
        console.error("Erro ao excluir missão:", error);
        toast({
          title: "Erro ao excluir missão",
          description: "Não foi possível excluir a missão.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('missoes')
        .update({ ativo: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setMissions(missions.map(mission => 
        mission.id === id ? { ...mission, ativo: !currentStatus } : mission
      ));
      
      toast({
        title: `Missão ${!currentStatus ? 'ativada' : 'desativada'}`,
        description: `A missão foi ${!currentStatus ? 'ativada' : 'desativada'} com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao alterar status da missão:", error);
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status da missão.",
        variant: "destructive",
      });
    }
  };
  
  const getMissionTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <HelpCircle className="h-5 w-5" />;
      case 'task':
        return <ListTodo className="h-5 w-5" />;
      case 'activity':
        return <Target className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };
  
  const getMissionTypeName = (type: string) => {
    switch (type) {
      case 'quiz':
        return "Quiz";
      case 'task':
        return "Tarefa";
      case 'activity':
        return "Atividade";
      default:
        return type;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex-1" />
        <Dialog open={isCreatingMission} onOpenChange={setIsCreatingMission}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Missão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Missão</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da missão que deseja criar.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input 
                  id="titulo" 
                  name="titulo"
                  value={newMission.titulo}
                  onChange={handleInputChange}
                  placeholder="Digite o título da missão"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea 
                  id="descricao" 
                  name="descricao"
                  value={newMission.descricao}
                  onChange={handleInputChange}
                  placeholder="Digite uma descrição detalhada da missão"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Missão</Label>
                <Select 
                  value={newMission.tipo} 
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de missão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">
                      <div className="flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        <span>Quiz (Pergunta e Resposta)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="task">
                      <div className="flex items-center">
                        <ListTodo className="h-4 w-4 mr-2" />
                        <span>Tarefa</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="activity">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        <span>Atividade</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pontos">Pontos</Label>
                <Input 
                  id="pontos" 
                  name="pontos"
                  type="number"
                  value={newMission.pontos}
                  onChange={handleNumberChange}
                  min={1}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grupo">Grupo de Usuários</Label>
                <Select 
                  value={newMission.grupo_id || "none"} 
                  onValueChange={handleGroupChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Todos os usuários</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imagem">Imagem (Opcional)</Label>
                <Input 
                  id="imagem"
                  type="file"
                  onChange={handleFileChange}
                  disabled={uploadingImage}
                  accept="image/*"
                />
                {uploadingImage && (
                  <div className="flex items-center mt-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Enviando imagem...</span>
                  </div>
                )}
                {newMission.imagem_url && (
                  <div className="mt-2">
                    <AspectRatio ratio={16 / 9}>
                      <img 
                        src={newMission.imagem_url} 
                        alt="Preview da imagem" 
                        className="rounded-md object-cover w-full h-full"
                      />
                    </AspectRatio>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="ativo"
                  checked={newMission.ativo}
                  onCheckedChange={(checked) => handleSwitchChange(checked, 'ativo')}
                />
                <Label htmlFor="ativo">Missão ativa</Label>
              </div>
              
              {/* Campos específicos para Quiz */}
              {newMission.tipo === 'quiz' && (
                <div className="space-y-4 border p-4 rounded-md">
                  <h4 className="font-semibold flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Configurar Quiz
                  </h4>
                  
                  <div className="space-y-2">
                    <Label>Opções de Resposta</Label>
                    <div className="flex space-x-2">
                      <Input 
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder="Digite uma opção"
                      />
                      <Button type="button" onClick={handleAddOption} variant="outline">
                        Adicionar
                      </Button>
                    </div>
                    
                    {newMission.opcoes && newMission.opcoes.length > 0 ? (
                      <div className="space-y-2 mt-2">
                        <Label>Resposta Correta</Label>
                        <Select 
                          value={newMission.resposta_correta || ""} 
                          onValueChange={handleSetCorrectAnswer}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a resposta correta" />
                          </SelectTrigger>
                          <SelectContent>
                            {newMission.opcoes.map((option, index) => (
                              <SelectItem key={index} value={option.value}>
                                {option.text}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="mt-2">
                          <Label>Lista de Opções</Label>
                          <div className="mt-1 space-y-1">
                            {newMission.opcoes.map((option, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                <div className="flex items-center space-x-2">
                                  {option.value === newMission.resposta_correta && (
                                    <Check className="h-4 w-4 text-green-500" />
                                  )}
                                  <span>{option.text}</span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleRemoveOption(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">
                        Adicione opções de resposta para o quiz.
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Campos específicos para Task e Activity */}
              {(newMission.tipo === 'task' || newMission.tipo === 'activity') && (
                <div className="space-y-4 border p-4 rounded-md">
                  <h4 className="font-semibold flex items-center">
                    {getMissionTypeIcon(newMission.tipo)}
                    <span className="ml-2">Configurar {getMissionTypeName(newMission.tipo)}</span>
                  </h4>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="evidencia"
                      checked={newMission.evidencia_obrigatoria}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'evidencia_obrigatoria')}
                    />
                    <Label htmlFor="evidencia">Exigir evidência para concluir</Label>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreatingMission(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateMission}>
                Criar Missão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog de edição */}
        <Dialog open={isEditingMission} onOpenChange={setIsEditingMission}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Editar Missão</DialogTitle>
              <DialogDescription>
                Altere os detalhes da missão.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              {/* Mesmo conteúdo do dialog de criação */}
              <div className="space-y-2">
                <Label htmlFor="edit-titulo">Título</Label>
                <Input 
                  id="edit-titulo" 
                  name="titulo"
                  value={newMission.titulo}
                  onChange={handleInputChange}
                  placeholder="Digite o título da missão"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-descricao">Descrição</Label>
                <Textarea 
                  id="edit-descricao" 
                  name="descricao"
                  value={newMission.descricao}
                  onChange={handleInputChange}
                  placeholder="Digite uma descrição detalhada da missão"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-tipo">Tipo de Missão</Label>
                <Select 
                  value={newMission.tipo} 
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de missão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">
                      <div className="flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        <span>Quiz (Pergunta e Resposta)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="task">
                      <div className="flex items-center">
                        <ListTodo className="h-4 w-4 mr-2" />
                        <span>Tarefa</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="activity">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        <span>Atividade</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-pontos">Pontos</Label>
                <Input 
                  id="edit-pontos" 
                  name="pontos"
                  type="number"
                  value={newMission.pontos}
                  onChange={handleNumberChange}
                  min={1}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-grupo">Grupo de Usuários</Label>
                <Select 
                  value={newMission.grupo_id || "none"} 
                  onValueChange={handleGroupChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Todos os usuários</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-imagem">Imagem (Opcional)</Label>
                <Input 
                  id="edit-imagem"
                  type="file"
                  onChange={handleFileChange}
                  disabled={uploadingImage}
                  accept="image/*"
                />
                {uploadingImage && (
                  <div className="flex items-center mt-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Enviando imagem...</span>
                  </div>
                )}
                {newMission.imagem_url && (
                  <div className="mt-2">
                    <AspectRatio ratio={16 / 9}>
                      <img 
                        src={newMission.imagem_url} 
                        alt="Preview da imagem" 
                        className="rounded-md object-cover w-full h-full"
                      />
                    </AspectRatio>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="edit-ativo"
                  checked={newMission.ativo}
                  onCheckedChange={(checked) => handleSwitchChange(checked, 'ativo')}
                />
                <Label htmlFor="edit-ativo">Missão ativa</Label>
              </div>
              
              {/* Campos específicos para Quiz */}
              {newMission.tipo === 'quiz' && (
                <div className="space-y-4 border p-4 rounded-md">
                  <h4 className="font-semibold flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Configurar Quiz
                  </h4>
                  
                  <div className="space-y-2">
                    <Label>Opções de Resposta</Label>
                    <div className="flex space-x-2">
                      <Input 
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder="Digite uma opção"
                      />
                      <Button type="button" onClick={handleAddOption} variant="outline">
                        Adicionar
                      </Button>
                    </div>
                    
                    {newMission.opcoes && newMission.opcoes.length > 0 ? (
                      <div className="space-y-2 mt-2">
                        <Label>Resposta Correta</Label>
                        <Select 
                          value={newMission.resposta_correta || ""} 
                          onValueChange={handleSetCorrectAnswer}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a resposta correta" />
                          </SelectTrigger>
                          <SelectContent>
                            {newMission.opcoes.map((option, index) => (
                              <SelectItem key={index} value={option.value}>
                                {option.text}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="mt-2">
                          <Label>Lista de Opções</Label>
                          <div className="mt-1 space-y-1">
                            {newMission.opcoes.map((option, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                <div className="flex items-center space-x-2">
                                  {option.value === newMission.resposta_correta && (
                                    <Check className="h-4 w-4 text-green-500" />
                                  )}
                                  <span>{option.text}</span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleRemoveOption(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">
                        Adicione opções de resposta para o quiz.
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Campos específicos para Task e Activity */}
              {(newMission.tipo === 'task' || newMission.tipo === 'activity') && (
                <div className="space-y-4 border p-4 rounded-md">
                  <h4 className="font-semibold flex items-center">
                    {getMissionTypeIcon(newMission.tipo)}
                    <span className="ml-2">Configurar {getMissionTypeName(newMission.tipo)}</span>
                  </h4>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="edit-evidencia"
                      checked={newMission.evidencia_obrigatoria}
                      onCheckedChange={(checked) => handleSwitchChange(checked, 'evidencia_obrigatoria')}
                    />
                    <Label htmlFor="edit-evidencia">Exigir evidência para concluir</Label>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditingMission(false);
                setSelectedMission(null);
              }}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateMission}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Missões</CardTitle>
          <CardDescription>
            Gerencie as missões disponíveis no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando missões...</span>
            </div>
          ) : missions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missions.map((mission) => (
                  <TableRow key={mission.id}>
                    <TableCell>
                      <Switch 
                        checked={mission.ativo}
                        onCheckedChange={() => handleToggleActive(mission.id, mission.ativo)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{mission.titulo}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getMissionTypeIcon(mission.tipo)}
                        <span>{getMissionTypeName(mission.tipo)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span>{mission.pontos}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {mission.grupo_id ? 
                        groups.find(g => g.id === mission.grupo_id)?.nome || "N/A" : 
                        "Todos"
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditMission(mission)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteMission(mission.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>Nenhuma missão cadastrada</p>
              <p className="text-sm mt-1">
                Clique em "Nova Missão" para adicionar
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
