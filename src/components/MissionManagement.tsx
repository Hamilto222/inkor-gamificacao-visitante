
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Trash2, Image, HelpCircle, Activity, ListChecks, FileCheck2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface MissionOption {
  text: string;
  value: string;
}

interface Mission {
  id?: string;
  titulo: string;
  descricao: string;
  tipo: string;
  pontos: number;
  imagem_url?: string | null;
  ativo: boolean;
  opcoes?: MissionOption[] | null;
  resposta_correta?: string | null;
  evidencia_obrigatoria: boolean;
  grupo_id?: string | null;
}

export const MissionManagement = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [newMission, setNewMission] = useState<Mission>({
    titulo: "",
    descricao: "",
    tipo: "multipla_escolha",
    pontos: 10,
    ativo: true,
    evidencia_obrigatoria: false,
    opcoes: [
      { text: "Opção 1", value: "opcao1" },
      { text: "Opção 2", value: "opcao2" },
      { text: "Opção 3", value: "opcao3" },
    ],
    resposta_correta: "opcao1"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<MissionOption[]>([
    { text: "Opção 1", value: "opcao1" },
    { text: "Opção 2", value: "opcao2" },
    { text: "Opção 3", value: "opcao3" },
  ]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setIsLoading(true);
      console.log("Carregando missões do admin...");
      
      const { data, error } = await supabase
        .from('missoes')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) {
        console.error("Erro ao carregar missões (admin):", error);
        throw error;
      }

      console.log("Missões carregadas (admin):", data);
      
      if (data) {
        // Transform the data to match our Mission type
        const transformedData = data.map(mission => {
          return {
            ...mission,
            // Convert opcoes to our expected format if it exists
            opcoes: mission.opcoes ? 
              (typeof mission.opcoes === 'string' ? 
                JSON.parse(mission.opcoes) : 
                mission.opcoes as unknown as MissionOption[]) 
              : null
          };
        });
        
        console.log("Dados transformados (admin):", transformedData);
        setMissions(transformedData as Mission[]);
      }
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

  const handleAddOption = () => {
    if (options.length < 10) {
      const newOptions = [...options];
      newOptions.push({ text: `Opção ${options.length + 1}`, value: `opcao${options.length + 1}` });
      setOptions(newOptions);
      setNewMission({
        ...newMission,
        opcoes: newOptions
      });
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
      
      // If the correct answer was the removed option, reset it to the first option
      let updatedCorrectAnswer = newMission.resposta_correta;
      if (newMission.resposta_correta === options[index].value) {
        updatedCorrectAnswer = newOptions[0].value;
      }
      
      setNewMission({
        ...newMission,
        opcoes: newOptions,
        resposta_correta: updatedCorrectAnswer
      });
    } else {
      toast({
        title: "Mínimo de opções",
        description: "Uma pergunta de múltipla escolha precisa ter ao menos 2 opções.",
        variant: "destructive",
      });
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
    setNewMission({
      ...newMission,
      opcoes: newOptions
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      console.log("Upload de imagem de missão iniciado");
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `mission-images/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('media-files')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error("Erro no upload de imagem:", uploadError);
        throw uploadError;
      }
      
      console.log("Imagem enviada, obtendo URL...");
      
      // Get public URL
      const { data } = supabase.storage
        .from('media-files')
        .getPublicUrl(filePath);
      
      console.log("URL da imagem obtida:", data.publicUrl);
      
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erro ao enviar imagem",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleAddMission = async () => {
    if (!newMission.titulo || !newMission.descricao) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (newMission.tipo === "multipla_escolha" && (!newMission.opcoes || !newMission.resposta_correta)) {
      toast({
        title: "Campos obrigatórios",
        description: "Defina as opções e a resposta correta para a pergunta de múltipla escolha.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("Iniciando criação de missão:", newMission);
      
      // Upload image if selected
      let imageUrl = null;
      if (selectedImage) {
        console.log("Enviando imagem...");
        imageUrl = await uploadImage(selectedImage);
      }
      
      // Map frontend types to database types
      let dbTipo = newMission.tipo;
      if (dbTipo === "multipla_escolha") {
        dbTipo = "quiz";
      } else if (dbTipo === "tarefa") {
        dbTipo = "task";
      } else if (dbTipo === "atividade") {
        dbTipo = "activity";
      }
      
      // Prepare mission data for saving
      const missionData: any = {
        titulo: newMission.titulo,
        descricao: newMission.descricao,
        tipo: dbTipo,
        pontos: newMission.pontos,
        ativo: newMission.ativo,
        evidencia_obrigatoria: newMission.evidencia_obrigatoria,
        imagem_url: imageUrl || newMission.imagem_url || null
      };
      
      // Add type-specific fields
      if (newMission.tipo === "multipla_escolha") {
        missionData.opcoes = newMission.opcoes;
        missionData.resposta_correta = newMission.resposta_correta;
      }

      // Debug log to see what data we're sending
      console.log("Dados da missão para salvar:", missionData);

      const { data, error } = await supabase
        .from('missoes')
        .insert([missionData])
        .select();

      if (error) {
        console.error("Erro ao inserir missão:", error);
        throw error;
      }

      console.log("Missão criada com sucesso:", data);

      // Show success dialog
      setShowSuccessDialog(true);
      
      // Reset form
      setNewMission({
        titulo: "",
        descricao: "",
        tipo: "multipla_escolha",
        pontos: 10,
        ativo: true,
        evidencia_obrigatoria: false,
        opcoes: [
          { text: "Opção 1", value: "opcao1" },
          { text: "Opção 2", value: "opcao2" },
          { text: "Opção 3", value: "opcao3" },
        ],
        resposta_correta: "opcao1"
      });
      
      setOptions([
        { text: "Opção 1", value: "opcao1" },
        { text: "Opção 2", value: "opcao2" },
        { text: "Opção 3", value: "opcao3" },
      ]);
      
      setSelectedImage(null);
      setImagePreview(null);
      
      // Reload missions after a short delay
      setTimeout(() => {
        loadMissions();
      }, 500);
    } catch (error: any) {
      console.error("Erro ao criar missão:", error);
      toast({
        title: "Erro ao criar missão",
        description: error.message || "Não foi possível criar a missão.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      console.log(`Alternando status da missão ${id} de ${currentStatus} para ${!currentStatus}`);
      setIsLoading(true);
      
      const { error } = await supabase
        .from('missoes')
        .update({ ativo: !currentStatus })
        .eq('id', id);

      if (error) {
        console.error("Erro ao alternar status:", error);
        throw error;
      }

      console.log("Status da missão atualizado com sucesso");
      
      toast({
        title: currentStatus ? "Missão desativada" : "Missão ativada",
        description: `A missão foi ${currentStatus ? "desativada" : "ativada"} com sucesso.`,
      });

      loadMissions();
    } catch (error) {
      console.error("Erro ao atualizar status da missão:", error);
      toast({
        title: "Erro ao atualizar missão",
        description: "Não foi possível atualizar o status da missão.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAllMissions = async () => {
    try {
      setIsLoading(true);
      console.log("Excluindo todas as missões...");
      
      const { error } = await supabase
        .from('missoes')
        .delete()
        .neq('id', ''); // This will delete all records
      
      if (error) {
        console.error("Erro ao excluir missões:", error);
        throw error;
      }
      
      console.log("Todas as missões foram excluídas com sucesso");
      
      toast({
        title: "Missões excluídas",
        description: "Todas as missões foram excluídas com sucesso.",
      });
      
      setMissions([]);
      setShowDeleteAllDialog(false);
    } catch (error) {
      console.error("Erro ao excluir missões:", error);
      toast({
        title: "Erro ao excluir missões",
        description: "Não foi possível excluir as missões.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMissionTypeIcon = (type: string) => {
    switch (type) {
      case "multipla_escolha":
      case "quiz":
        return <HelpCircle className="h-4 w-4" />;
      case "atividade":
      case "activity":
        return <Activity className="h-4 w-4" />;
      case "tarefa":
      case "task":
        return <ListChecks className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getMissionTypeName = (type: string) => {
    switch (type) {
      case "multipla_escolha":
      case "quiz":
        return "Pergunta de Múltipla Escolha";
      case "atividade":
      case "activity":
        return "Atividade";
      case "tarefa":
      case "task":
        return "Tarefa";
      default:
        return type;
    }
  };

  const filteredMissions = missions.filter(mission => 
    mission.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    mission.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center flex-wrap gap-2">
        <Button 
          variant="destructive" 
          onClick={() => setShowDeleteAllDialog(true)}
          className="sm:order-2"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir Todas as Missões
        </Button>
        
        <div className="flex-1" />
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="sm:order-3">
              <Plus className="mr-2 h-4 w-4" />
              Nova Missão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dialog-overflow-fix">
            <DialogHeader>
              <DialogTitle>Criar Nova Missão</DialogTitle>
              <DialogDescription>
                Adicione uma nova missão para os usuários completarem e ganharem pontos.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título da Missão</Label>
                  <Input 
                    id="titulo" 
                    value={newMission.titulo}
                    onChange={(e) => setNewMission({...newMission, titulo: e.target.value})}
                    placeholder="Digite o título da missão"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Missão</Label>
                  <Select 
                    value={newMission.tipo} 
                    onValueChange={(value) => setNewMission({...newMission, tipo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multipla_escolha">
                        <div className="flex items-center">
                          <HelpCircle className="h-4 w-4 mr-2" />
                          <span>Pergunta de Múltipla Escolha</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="atividade">
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-2" />
                          <span>Atividade</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="tarefa">
                        <div className="flex items-center">
                          <ListChecks className="h-4 w-4 mr-2" />
                          <span>Tarefa</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea 
                  id="descricao" 
                  rows={3}
                  value={newMission.descricao}
                  onChange={(e) => setNewMission({...newMission, descricao: e.target.value})}
                  placeholder="Descreva detalhadamente o que o usuário deve fazer"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pontos">Pontos</Label>
                  <Input 
                    id="pontos" 
                    type="number"
                    min={1}
                    value={newMission.pontos}
                    onChange={(e) => setNewMission({...newMission, pontos: parseInt(e.target.value) || 0})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Quantidade de pontos que o usuário ganhará ao completar essa missão
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imagem">Imagem (opcional)</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => document.getElementById('mission-image')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Selecionar Imagem
                      </Button>
                    </div>
                    <Input 
                      id="mission-image" 
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    
                    {imagePreview && (
                      <div className="mt-2 relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-24 object-cover rounded-md" 
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="evidencia"
                  checked={newMission.evidencia_obrigatoria} 
                  onCheckedChange={(checked) => setNewMission({...newMission, evidencia_obrigatoria: checked})}
                />
                <Label htmlFor="evidencia">Exigir evidência para conclusão</Label>
              </div>
              
              {newMission.tipo === "multipla_escolha" && (
                <div className="space-y-4 border p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Opções de Resposta</h4>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleAddOption}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Opção
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input 
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Opção ${index + 1}`}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                          disabled={options.length <= 2}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="resposta_correta">Resposta Correta</Label>
                    <Select 
                      value={newMission.resposta_correta || ""} 
                      onValueChange={(value) => setNewMission({...newMission, resposta_correta: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a resposta correta" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option, index) => (
                          <SelectItem key={index} value={option.value}>
                            {option.text}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={handleAddMission} disabled={isLoading}>
                {isLoading ? "Salvando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <CardTitle>Lista de Missões</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar missões"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            Total de {filteredMissions.length} missões cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                  <TableHead className="hidden sm:table-cell">Pontos</TableHead>
                  <TableHead className="hidden sm:table-cell">Evidência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMissions.length > 0 ? (
                  filteredMissions.map((mission) => (
                    <TableRow key={mission.id}>
                      <TableCell className="font-medium">{mission.titulo}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center space-x-2">
                          {getMissionTypeIcon(mission.tipo)}
                          <span>{getMissionTypeName(mission.tipo)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{mission.pontos} pts</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {mission.evidencia_obrigatoria ? "Obrigatória" : "Não obrigatória"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={mission.ativo} 
                            onCheckedChange={() => mission.id && handleToggleStatus(mission.id, mission.ativo)} 
                          />
                          <span className="hidden sm:inline">{mission.ativo ? "Ativa" : "Inativa"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => mission.id && handleToggleStatus(mission.id, mission.ativo)}>
                          {mission.ativo ? "Desativar" : "Ativar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      {searchTerm 
                        ? "Nenhuma missão encontrada com estes termos de busca." 
                        : "Nenhuma missão cadastrada no sistema."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <FileCheck2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl mb-2">Missão Criada com Sucesso!</DialogTitle>
            <DialogDescription>
              A missão foi adicionada e já está disponível para os usuários.
            </DialogDescription>
            <Button 
              className="mt-6 w-full" 
              onClick={() => {
                setShowSuccessDialog(false);
                setOpenDialog(false);
              }}
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir todas as missões?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente todas as missões 
              cadastradas no sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAllMissions} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading ? "Excluindo..." : "Sim, excluir todas"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
