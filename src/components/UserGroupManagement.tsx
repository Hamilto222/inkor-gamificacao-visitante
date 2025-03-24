
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, User, Users, Award, ListChecks } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserGroup {
  id?: string;
  nome: string;
  descricao?: string | null;
  data_criacao?: string;
}

interface UserInfo {
  id?: string;
  nome: string;
  numero_matricula: string;
  ativo: boolean;
}

interface Mission {
  id: string;
  titulo: string;
  tipo: string;
  pontos: number;
  ativo: boolean;
}

interface Prize {
  id: string;
  nome: string;
  pontos_necessarios: number;
  ativo: boolean;
}

export const UserGroupManagement = () => {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [newGroup, setNewGroup] = useState<UserGroup>({
    nome: "",
    descricao: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUserSearch, setSelectedUserSearch] = useState("");
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [selectedPrizes, setSelectedPrizes] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "users" | "missions" | "prizes">("create");
  const [groupUsers, setGroupUsers] = useState<UserInfo[]>([]);

  useEffect(() => {
    loadGroups();
    loadUsers();
    loadMissions();
    loadPrizes();
  }, []);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('grupos_usuarios')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setGroups(data);
      }
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
      toast({
        title: "Erro ao carregar grupos",
        description: "Não foi possível carregar os grupos de usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('matriculas_funcionarios')
        .select('*')
        .order('nome');

      if (error) {
        throw error;
      }

      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    }
  };

  const loadMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('missoes')
        .select('id, titulo, tipo, pontos, ativo');

      if (error) {
        throw error;
      }

      if (data) {
        setMissions(data);
      }
    } catch (error) {
      console.error("Erro ao carregar missões:", error);
    }
  };

  const loadPrizes = async () => {
    try {
      const { data, error } = await supabase
        .from('premios')
        .select('id, nome, pontos_necessarios, ativo');

      if (error) {
        throw error;
      }

      if (data) {
        setPrizes(data);
      }
    } catch (error) {
      console.error("Erro ao carregar prêmios:", error);
    }
  };

  const loadGroupUsers = async (groupId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('usuario_grupo')
        .select('matricula')
        .eq('grupo_id', groupId);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const matriculas = data.map(item => item.matricula);
        
        const { data: userData, error: userError } = await supabase
          .from('matriculas_funcionarios')
          .select('*')
          .in('numero_matricula', matriculas);
        
        if (userError) {
          throw userError;
        }
        
        setGroupUsers(userData || []);
        setSelectedUsers(matriculas);
      } else {
        setGroupUsers([]);
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários do grupo:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar os usuários deste grupo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroupMissions = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('missao_grupo')
        .select('missao_id')
        .eq('grupo_id', groupId);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setSelectedMissions(data.map(item => item.missao_id));
      } else {
        setSelectedMissions([]);
      }
    } catch (error) {
      console.error("Erro ao carregar missões do grupo:", error);
    }
  };

  const loadGroupPrizes = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('premio_grupo')
        .select('premio_id')
        .eq('grupo_id', groupId);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setSelectedPrizes(data.map(item => item.premio_id));
      } else {
        setSelectedPrizes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar prêmios do grupo:", error);
    }
  };

  const handleAddGroup = async () => {
    if (!newGroup.nome) {
      toast({
        title: "Nome obrigatório",
        description: "O nome do grupo é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Create the group
      const { data, error } = await supabase
        .from('grupos_usuarios')
        .insert([{
          nome: newGroup.nome,
          descricao: newGroup.descricao || null
        }])
        .select();

      if (error) {
        throw error;
      }

      // Add users to the group if any are selected
      if (selectedUsers.length > 0 && data && data.length > 0) {
        const groupId = data[0].id;
        
        // Prepare the user-group relations
        const userGroupRelations = selectedUsers.map(matricula => ({
          grupo_id: groupId,
          matricula: matricula
        }));
        
        // Insert the relations
        const { error: userGroupError } = await supabase
          .from('usuario_grupo')
          .insert(userGroupRelations);
        
        if (userGroupError) {
          console.error("Erro ao adicionar usuários ao grupo:", userGroupError);
          toast({
            title: "Aviso",
            description: "Grupo criado, mas houve um erro ao adicionar alguns usuários.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Grupo criado",
        description: `O grupo "${newGroup.nome}" foi criado com sucesso.`,
      });
      
      // Reset form
      setNewGroup({
        nome: "",
        descricao: "",
      });
      setSelectedUsers([]);
      
      setOpenDialog(false);
      loadGroups();
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      toast({
        title: "Erro ao criar grupo",
        description: "Não foi possível criar o grupo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateGroupUsers = async () => {
    if (!selectedGroup?.id) return;
    
    try {
      setIsLoading(true);
      
      // First, remove all existing user-group relations
      const { error: deleteError } = await supabase
        .from('usuario_grupo')
        .delete()
        .eq('grupo_id', selectedGroup.id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Then add the new relations if any users are selected
      if (selectedUsers.length > 0) {
        const userGroupRelations = selectedUsers.map(matricula => ({
          grupo_id: selectedGroup.id,
          matricula: matricula
        }));
        
        const { error: insertError } = await supabase
          .from('usuario_grupo')
          .insert(userGroupRelations);
        
        if (insertError) {
          throw insertError;
        }
      }
      
      toast({
        title: "Usuários atualizados",
        description: `Os usuários do grupo "${selectedGroup.nome}" foram atualizados com sucesso.`,
      });
      
      setOpenDialog(false);
      loadGroups();
    } catch (error) {
      console.error("Erro ao atualizar usuários do grupo:", error);
      toast({
        title: "Erro ao atualizar usuários",
        description: "Não foi possível atualizar os usuários do grupo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateGroupMissions = async () => {
    if (!selectedGroup?.id) return;
    
    try {
      setIsLoading(true);
      
      // First, remove all existing mission-group relations
      const { error: deleteError } = await supabase
        .from('missao_grupo')
        .delete()
        .eq('grupo_id', selectedGroup.id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Then add the new relations if any missions are selected
      if (selectedMissions.length > 0) {
        const missionGroupRelations = selectedMissions.map(missionId => ({
          grupo_id: selectedGroup.id,
          missao_id: missionId
        }));
        
        const { error: insertError } = await supabase
          .from('missao_grupo')
          .insert(missionGroupRelations);
        
        if (insertError) {
          throw insertError;
        }
      }
      
      toast({
        title: "Missões atualizadas",
        description: `As missões do grupo "${selectedGroup.nome}" foram atualizadas com sucesso.`,
      });
      
      setOpenDialog(false);
    } catch (error) {
      console.error("Erro ao atualizar missões do grupo:", error);
      toast({
        title: "Erro ao atualizar missões",
        description: "Não foi possível atualizar as missões do grupo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateGroupPrizes = async () => {
    if (!selectedGroup?.id) return;
    
    try {
      setIsLoading(true);
      
      // First, remove all existing prize-group relations
      const { error: deleteError } = await supabase
        .from('premio_grupo')
        .delete()
        .eq('grupo_id', selectedGroup.id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Then add the new relations if any prizes are selected
      if (selectedPrizes.length > 0) {
        const prizeGroupRelations = selectedPrizes.map(prizeId => ({
          grupo_id: selectedGroup.id,
          premio_id: prizeId
        }));
        
        const { error: insertError } = await supabase
          .from('premio_grupo')
          .insert(prizeGroupRelations);
        
        if (insertError) {
          throw insertError;
        }
      }
      
      toast({
        title: "Prêmios atualizados",
        description: `Os prêmios do grupo "${selectedGroup.nome}" foram atualizados com sucesso.`,
      });
      
      setOpenDialog(false);
    } catch (error) {
      console.error("Erro ao atualizar prêmios do grupo:", error);
      toast({
        title: "Erro ao atualizar prêmios",
        description: "Não foi possível atualizar os prêmios do grupo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelection = (matricula: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(matricula)) {
        return prev.filter(id => id !== matricula);
      } else {
        return [...prev, matricula];
      }
    });
  };

  const handleMissionSelection = (missionId: string) => {
    setSelectedMissions(prev => {
      if (prev.includes(missionId)) {
        return prev.filter(id => id !== missionId);
      } else {
        return [...prev, missionId];
      }
    });
  };

  const handlePrizeSelection = (prizeId: string) => {
    setSelectedPrizes(prev => {
      if (prev.includes(prizeId)) {
        return prev.filter(id => id !== prizeId);
      } else {
        return [...prev, prizeId];
      }
    });
  };

  const openCreateDialog = () => {
    setDialogMode("create");
    setNewGroup({ nome: "", descricao: "" });
    setSelectedUsers([]);
    setOpenDialog(true);
  };

  const openEditUsersDialog = (group: UserGroup) => {
    setDialogMode("users");
    setSelectedGroup(group);
    setSelectedUserSearch("");
    loadGroupUsers(group.id!);
    setOpenDialog(true);
  };

  const openEditMissionsDialog = (group: UserGroup) => {
    setDialogMode("missions");
    setSelectedGroup(group);
    loadGroupMissions(group.id!);
    setOpenDialog(true);
  };

  const openEditPrizesDialog = (group: UserGroup) => {
    setDialogMode("prizes");
    setSelectedGroup(group);
    loadGroupPrizes(group.id!);
    setOpenDialog(true);
  };

  const filteredGroups = groups.filter(group => 
    group.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (group.descricao && group.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredUsers = users.filter(user => 
    user.nome.toLowerCase().includes(selectedUserSearch.toLowerCase()) || 
    user.numero_matricula.includes(selectedUserSearch)
  );

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex-1" />
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {dialogMode === "create" && (
              <>
                <DialogHeader>
                  <DialogTitle>Criar Novo Grupo</DialogTitle>
                  <DialogDescription>
                    Adicione um novo grupo para organizar usuários, missões e prêmios.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Grupo</Label>
                    <Input 
                      id="nome" 
                      value={newGroup.nome}
                      onChange={(e) => setNewGroup({...newGroup, nome: e.target.value})}
                      placeholder="Digite o nome do grupo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição (opcional)</Label>
                    <Textarea 
                      id="descricao" 
                      rows={2}
                      value={newGroup.descricao || ""}
                      onChange={(e) => setNewGroup({...newGroup, descricao: e.target.value})}
                      placeholder="Descreva a finalidade deste grupo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Adicionar Usuários (opcional)</Label>
                    <Input 
                      placeholder="Buscar usuários por nome ou matrícula"
                      value={selectedUserSearch}
                      onChange={(e) => setSelectedUserSearch(e.target.value)}
                      className="mb-2"
                    />
                    
                    <div className="border rounded-md p-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedUsers.length > 0 ? (
                          selectedUsers.map(matricula => {
                            const user = users.find(u => u.numero_matricula === matricula);
                            return (
                              <Badge key={matricula} variant="secondary" className="flex items-center gap-1">
                                <span>{user?.nome}</span>
                                <button 
                                  onClick={() => handleUserSelection(matricula)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  ×
                                </button>
                              </Badge>
                            );
                          })
                        ) : (
                          <p className="text-sm text-muted-foreground">Nenhum usuário selecionado</p>
                        )}
                      </div>
                      
                      <ScrollArea className="h-40 rounded border p-2">
                        <div className="space-y-2">
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                              <div 
                                key={user.numero_matricula} 
                                className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm"
                              >
                                <Checkbox 
                                  id={`user-${user.numero_matricula}`}
                                  checked={selectedUsers.includes(user.numero_matricula)}
                                  onCheckedChange={() => handleUserSelection(user.numero_matricula)}
                                />
                                <Label 
                                  htmlFor={`user-${user.numero_matricula}`}
                                  className="flex-1 flex justify-between cursor-pointer"
                                >
                                  <span>{user.nome}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {user.numero_matricula}
                                  </span>
                                </Label>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground p-2">
                              Nenhum usuário encontrado com esse termo.
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
                  <Button onClick={handleAddGroup} disabled={isLoading}>
                    {isLoading ? "Salvando..." : "Confirmar"}
                  </Button>
                </DialogFooter>
              </>
            )}
            
            {dialogMode === "users" && selectedGroup && (
              <>
                <DialogHeader>
                  <DialogTitle>Gerenciar Usuários</DialogTitle>
                  <DialogDescription>
                    Adicione ou remova usuários do grupo "{selectedGroup.nome}".
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <Input 
                    placeholder="Buscar usuários por nome ou matrícula"
                    value={selectedUserSearch}
                    onChange={(e) => setSelectedUserSearch(e.target.value)}
                    className="mb-2"
                  />
                  
                  <div className="border rounded-md p-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedUsers.length > 0 ? (
                        selectedUsers.map(matricula => {
                          const user = users.find(u => u.numero_matricula === matricula);
                          return (
                            <Badge key={matricula} variant="secondary" className="flex items-center gap-1">
                              <span>{user?.nome}</span>
                              <button 
                                onClick={() => handleUserSelection(matricula)}
                                className="ml-1 hover:text-destructive"
                              >
                                ×
                              </button>
                            </Badge>
                          );
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum usuário selecionado</p>
                      )}
                    </div>
                    
                    <ScrollArea className="h-60 rounded border p-2">
                      <div className="space-y-2">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map(user => (
                            <div 
                              key={user.numero_matricula} 
                              className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm"
                            >
                              <Checkbox 
                                id={`user-edit-${user.numero_matricula}`}
                                checked={selectedUsers.includes(user.numero_matricula)}
                                onCheckedChange={() => handleUserSelection(user.numero_matricula)}
                              />
                              <Label 
                                htmlFor={`user-edit-${user.numero_matricula}`}
                                className="flex-1 flex justify-between cursor-pointer"
                              >
                                <span>{user.nome}</span>
                                <span className="text-sm text-muted-foreground">
                                  {user.numero_matricula}
                                </span>
                              </Label>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground p-2">
                            Nenhum usuário encontrado com esse termo.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
                  <Button onClick={updateGroupUsers} disabled={isLoading}>
                    {isLoading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </DialogFooter>
              </>
            )}
            
            {dialogMode === "missions" && selectedGroup && (
              <>
                <DialogHeader>
                  <DialogTitle>Gerenciar Missões</DialogTitle>
                  <DialogDescription>
                    Selecione quais missões estarão disponíveis para os usuários do grupo "{selectedGroup.nome}".
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <ScrollArea className="h-80 rounded border p-4">
                    <div className="space-y-2">
                      {missions.length > 0 ? (
                        missions.filter(mission => mission.ativo).map(mission => (
                          <div 
                            key={mission.id} 
                            className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm"
                          >
                            <Checkbox 
                              id={`mission-${mission.id}`}
                              checked={selectedMissions.includes(mission.id)}
                              onCheckedChange={() => handleMissionSelection(mission.id)}
                            />
                            <Label 
                              htmlFor={`mission-${mission.id}`}
                              className="flex-1 flex justify-between cursor-pointer"
                            >
                              <div className="flex items-center space-x-2">
                                <ListChecks className="h-4 w-4 text-primary" />
                                <span>{mission.titulo}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {mission.pontos} pts
                              </span>
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground p-2">
                          Nenhuma missão ativa disponível.
                        </p>
                      )}
                      
                      {missions.length > 0 && missions.filter(mission => mission.ativo).length === 0 && (
                        <p className="text-sm text-muted-foreground p-2">
                          Não existem missões ativas no momento.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
                  <Button onClick={updateGroupMissions} disabled={isLoading}>
                    {isLoading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </DialogFooter>
              </>
            )}
            
            {dialogMode === "prizes" && selectedGroup && (
              <>
                <DialogHeader>
                  <DialogTitle>Gerenciar Prêmios</DialogTitle>
                  <DialogDescription>
                    Selecione quais prêmios estarão disponíveis para resgate pelos usuários do grupo "{selectedGroup.nome}".
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <ScrollArea className="h-80 rounded border p-4">
                    <div className="space-y-2">
                      {prizes.length > 0 ? (
                        prizes.filter(prize => prize.ativo).map(prize => (
                          <div 
                            key={prize.id} 
                            className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm"
                          >
                            <Checkbox 
                              id={`prize-${prize.id}`}
                              checked={selectedPrizes.includes(prize.id)}
                              onCheckedChange={() => handlePrizeSelection(prize.id)}
                            />
                            <Label 
                              htmlFor={`prize-${prize.id}`}
                              className="flex-1 flex justify-between cursor-pointer"
                            >
                              <div className="flex items-center space-x-2">
                                <Award className="h-4 w-4 text-primary" />
                                <span>{prize.nome}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {prize.pontos_necessarios} pts
                              </span>
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground p-2">
                          Nenhum prêmio ativo disponível.
                        </p>
                      )}
                      
                      {prizes.length > 0 && prizes.filter(prize => prize.ativo).length === 0 && (
                        <p className="text-sm text-muted-foreground p-2">
                          Não existem prêmios ativos no momento.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
                  <Button onClick={updateGroupPrizes} disabled={isLoading}>
                    {isLoading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <CardTitle>Grupos de Usuários</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar grupos"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            Total de {filteredGroups.length} grupos cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Descrição</TableHead>
                  <TableHead className="text-center">Usuários</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.nome}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {group.descricao || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-1"
                          onClick={() => openEditUsersDialog(group)}
                        >
                          <Users className="h-4 w-4" />
                          <span className="hidden sm:inline">Gerenciar</span>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditMissionsDialog(group)}
                          >
                            <ListChecks className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Missões</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditPrizesDialog(group)}
                          >
                            <Award className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Prêmios</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      {searchTerm 
                        ? "Nenhum grupo encontrado com estes termos de busca." 
                        : "Nenhum grupo cadastrado no sistema."}
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
