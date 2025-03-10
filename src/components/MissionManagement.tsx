
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
import { Plus, Search, Trash2, Image, HelpCircle, Activity, ListChecks } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('missoes')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Transform the data to match our Mission type
        const transformedData = data.map(mission => {
          return {
            ...mission,
            // Convert opcoes to our expected format if it exists
            opcoes: mission.opcoes ? (mission.opcoes as unknown as MissionOption[]) : null
          };
        });
        
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
      
      // Prepare mission data for saving
      const missionData = {
        titulo: newMission.titulo,
        descricao: newMission.descricao,
        tipo: newMission.tipo,
        pontos: newMission.pontos,
        ativo: newMission.ativo,
        evidencia_obrigatoria: newMission.evidencia_obrigatoria,
        imagem_url: newMission.imagem_url || null
      };
      
      // Add type-specific fields
      if (newMission.tipo === "multipla_escolha") {
        Object.assign(missionData, {
          opcoes: newMission.opcoes,
          resposta_correta: newMission.resposta_correta
        });
      } else {
        // For other types, we don't need these fields
        Object.assign(missionData, {
          opcoes: null,
          resposta_correta: null
        });
      }

      const { data, error } = await supabase
        .from('missoes')
        .insert([missionData])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Missão criada",
        description: `A missão "${newMission.titulo}" foi criada com sucesso.`,
      });
      
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
      
      setOpenDialog(false);
      loadMissions();
    } catch (error) {
      console.error("Erro ao criar missão:", error);
      toast({
        title: "Erro ao criar missão",
        description: "Não foi possível criar a missão.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('missoes')
        .update({ ativo: !currentStatus })
        .eq('id', id);

      if (error) {
        throw error;
      }

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
    }
  };

  const getMissionTypeIcon = (type: string) => {
    switch (type) {
      case "multipla_escolha":
        return <HelpCircle className="h-4 w-4" />;
      case "atividade":
        return <Activity className="h-4 w-4" />;
      case "tarefa":
        return <ListChecks className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getMissionTypeName = (type: string) => {
    switch (type) {
      case "multipla_escolha":
        return "Pergunta de Múltipla Escolha";
      case "atividade":
        return "Atividade";
      case "tarefa":
        return "Tarefa";
      default:
        return type;
    }
  };

  const filteredMissions = missions.filter(mission => 
    mission.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    mission.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex-1" />
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Missão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
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
                    onChange={(e) => setNewMission({...newMission, pontos: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Quantidade de pontos que o usuário ganhará ao completar essa missão
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imagem">URL da Imagem (opcional)</Label>
                  <Input 
                    id="imagem" 
                    value={newMission.imagem_url || ""}
                    onChange={(e) => setNewMission({...newMission, imagem_url: e.target.value})}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Adicione uma imagem ilustrativa para a missão
                  </p>
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
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Missões</CardTitle>
            <div className="relative w-64">
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
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Evidência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMissions.length > 0 ? (
                  filteredMissions.map((mission) => (
                    <TableRow key={mission.id}>
                      <TableCell className="font-medium">{mission.titulo}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getMissionTypeIcon(mission.tipo)}
                          <span>{getMissionTypeName(mission.tipo)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{mission.pontos} pts</TableCell>
                      <TableCell>
                        {mission.evidencia_obrigatoria ? "Obrigatória" : "Não obrigatória"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={mission.ativo} 
                            onCheckedChange={() => mission.id && handleToggleStatus(mission.id, mission.ativo)} 
                          />
                          <span>{mission.ativo ? "Ativa" : "Inativa"}</span>
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
    </>
  );
};
