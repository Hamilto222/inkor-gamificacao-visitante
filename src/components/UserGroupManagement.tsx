
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Edit, UserPlus, Users, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";

interface UserGroup {
  id: string;
  nome: string;
  descricao: string | null;
  data_criacao: string;
  membros_count?: number;
}

interface User {
  id: string;
  matricula: string;
  nome: string;
  ativo: boolean;
  grupo?: string;
}

export const UserGroupManagement = () => {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [isManagingMembers, setIsManagingMembers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [newGroup, setNewGroup] = useState({
    nome: "",
    descricao: ""
  });
  
  const { toast } = useToast();
  
  useEffect(() => {
    loadGroups();
    loadUsers();
  }, []);
  
  const loadGroups = async () => {
    setIsLoading(true);
    try {
      // First get all groups
      const { data: groupsData, error } = await supabase
        .from('grupos_usuarios')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      
      // Now count members in each group
      if (groupsData) {
        const groupsWithCounts = await Promise.all(
          groupsData.map(async (group) => {
            const { count, error: countError } = await supabase
              .from('usuario_grupo')
              .select('*', { count: 'exact', head: true })
              .eq('grupo_id', group.id);
            
            return {
              ...group,
              membros_count: count || 0
            };
          })
        );
        
        setGroups(groupsWithCounts);
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
      
      if (error) throw error;
      
      // For each user, check if they belong to a group
      if (data) {
        const usersWithGroups = await Promise.all(
          data.map(async (user) => {
            const { data: userGroupData, error: userGroupError } = await supabase
              .from('usuario_grupo')
              .select('grupo_id')
              .eq('matricula', user.numero_matricula)
              .single();
            
            if (userGroupData) {
              // Get group name
              const { data: groupData } = await supabase
                .from('grupos_usuarios')
                .select('nome')
                .eq('id', userGroupData.grupo_id)
                .single();
              
              return {
                ...user,
                grupo: groupData?.nome || 'Sem grupo'
              };
            }
            
            return {
              ...user,
              grupo: 'Sem grupo'
            };
          })
        );
        
        setUsers(usersWithGroups);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewGroup({
      ...newGroup,
      [name]: value,
    });
  };
  
  const handleCreateGroup = async () => {
    if (!newGroup.nome) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o nome do grupo.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('grupos_usuarios')
        .insert([{
          nome: newGroup.nome,
          descricao: newGroup.descricao || null
        }])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Grupo criado com sucesso",
        description: "O grupo de usuários foi adicionado ao sistema.",
      });
      
      setIsCreatingGroup(false);
      setNewGroup({
        nome: "",
        descricao: ""
      });
      
      // Reload groups
      loadGroups();
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      toast({
        title: "Erro ao criar grupo",
        description: "Não foi possível criar o grupo de usuários.",
        variant: "destructive",
      });
    }
  };
  
  const handleEditGroup = (group: UserGroup) => {
    setSelectedGroup(group);
    setNewGroup({
      nome: group.nome,
      descricao: group.descricao || ""
    });
    setIsEditingGroup(true);
  };
  
  const handleUpdateGroup = async () => {
    if (!selectedGroup || !newGroup.nome) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o nome do grupo.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('grupos_usuarios')
        .update({
          nome: newGroup.nome,
          descricao: newGroup.descricao || null
        })
        .eq('id', selectedGroup.id);
      
      if (error) throw error;
      
      toast({
        title: "Grupo atualizado com sucesso",
        description: "As alterações foram salvas.",
      });
      
      setIsEditingGroup(false);
      setSelectedGroup(null);
      
      // Reload groups
      loadGroups();
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
      toast({
        title: "Erro ao atualizar grupo",
        description: "Não foi possível atualizar o grupo de usuários.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteGroup = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este grupo? Os usuários ficarão sem grupo.")) {
      try {
        // First, remove all relationships
        await supabase
          .from('usuario_grupo')
          .delete()
          .eq('grupo_id', id);
          
        // Then, delete the group
        const { error } = await supabase
          .from('grupos_usuarios')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        toast({
          title: "Grupo excluído",
          description: "O grupo foi removido com sucesso.",
        });
        
        // Update the groups list
        setGroups(groups.filter(g => g.id !== id));
      } catch (error) {
        console.error("Erro ao excluir grupo:", error);
        toast({
          title: "Erro ao excluir grupo",
          description: "Não foi possível excluir o grupo.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleManageMembers = async (group: UserGroup) => {
    setSelectedGroup(group);
    
    try {
      // Get current members of the group
      const { data, error } = await supabase
        .from('usuario_grupo')
        .select('matricula')
        .eq('grupo_id', group.id);
      
      if (error) throw error;
      
      setSelectedGroupMembers(data?.map(item => item.matricula) || []);
      setIsManagingMembers(true);
    } catch (error) {
      console.error("Erro ao carregar membros do grupo:", error);
      toast({
        title: "Erro ao carregar membros",
        description: "Não foi possível carregar os membros do grupo.",
        variant: "destructive",
      });
    }
  };
  
  const toggleUserSelection = (matricula: string) => {
    if (selectedGroupMembers.includes(matricula)) {
      setSelectedGroupMembers(selectedGroupMembers.filter(m => m !== matricula));
    } else {
      setSelectedGroupMembers([...selectedGroupMembers, matricula]);
    }
  };
  
  const handleSaveMembers = async () => {
    if (!selectedGroup) return;
    
    try {
      // First, remove all current members
      await supabase
        .from('usuario_grupo')
        .delete()
        .eq('grupo_id', selectedGroup.id);
      
      // If we have selected members, add them
      if (selectedGroupMembers.length > 0) {
        const membersToInsert = selectedGroupMembers.map(matricula => ({
          grupo_id: selectedGroup.id,
          matricula
        }));
        
        const { error } = await supabase
          .from('usuario_grupo')
          .insert(membersToInsert);
        
        if (error) throw error;
      }
      
      toast({
        title: "Membros atualizados",
        description: "Os membros do grupo foram atualizados com sucesso.",
      });
      
      setIsManagingMembers(false);
      setSelectedGroup(null);
      setSelectedGroupMembers([]);
      
      // Reload data
      loadGroups();
      loadUsers();
    } catch (error) {
      console.error("Erro ao salvar membros:", error);
      toast({
        title: "Erro ao salvar membros",
        description: "Não foi possível atualizar os membros do grupo.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex-1" />
        <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Grupo</DialogTitle>
              <DialogDescription>
                Crie um grupo para organizar usuários e atribuir missões específicas.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Grupo</Label>
                <Input 
                  id="nome" 
                  name="nome"
                  value={newGroup.nome}
                  onChange={handleInputChange}
                  placeholder="Digite o nome do grupo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição (Opcional)</Label>
                <Textarea 
                  id="descricao" 
                  name="descricao"
                  value={newGroup.descricao}
                  onChange={handleInputChange}
                  placeholder="Digite uma descrição para o grupo"
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreatingGroup(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateGroup}>
                Criar Grupo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog de edição */}
        <Dialog open={isEditingGroup} onOpenChange={setIsEditingGroup}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Grupo</DialogTitle>
              <DialogDescription>
                Altere as informações do grupo selecionado.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome do Grupo</Label>
                <Input 
                  id="edit-nome" 
                  name="nome"
                  value={newGroup.nome}
                  onChange={handleInputChange}
                  placeholder="Digite o nome do grupo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-descricao">Descrição (Opcional)</Label>
                <Textarea 
                  id="edit-descricao" 
                  name="descricao"
                  value={newGroup.descricao}
                  onChange={handleInputChange}
                  placeholder="Digite uma descrição para o grupo"
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditingGroup(false);
                setSelectedGroup(null);
              }}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateGroup}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog para gerenciar membros */}
        <Dialog open={isManagingMembers} onOpenChange={setIsManagingMembers}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Gerenciar Membros do Grupo</DialogTitle>
              <DialogDescription>
                {selectedGroup && `Selecione os usuários que farão parte do grupo "${selectedGroup.nome}"`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <h4 className="font-medium">Usuários Disponíveis</h4>
                <div className="border rounded-md">
                  {users.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Selecionar</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Matrícula</TableHead>
                          <TableHead>Grupo Atual</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedGroupMembers.includes(user.matricula)}
                                onCheckedChange={() => toggleUserSelection(user.matricula)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{user.nome}</div>
                            </TableCell>
                            <TableCell>{user.matricula}</TableCell>
                            <TableCell>{user.grupo}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      Nenhum usuário encontrado.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Usuários Selecionados: {selectedGroupMembers.length}</h4>
                {selectedGroupMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedGroupMembers.map(matricula => {
                      const user = users.find(u => u.matricula === matricula);
                      return (
                        <div key={matricula} className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1">
                          <span className="text-sm">{user?.nome || matricula}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-1 h-5 w-5"
                            onClick={() => toggleUserSelection(matricula)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsManagingMembers(false);
                setSelectedGroup(null);
                setSelectedGroupMembers([]);
              }}>
                Cancelar
              </Button>
              <Button onClick={handleSaveMembers}>
                Salvar Membros
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Grupos de Usuários</CardTitle>
          <CardDescription>
            Gerencie os grupos de usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando grupos...</span>
            </div>
          ) : groups.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Membros</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <div className="font-medium">{group.nome}</div>
                    </TableCell>
                    <TableCell>
                      {group.descricao || <span className="text-muted-foreground italic">Sem descrição</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{group.membros_count || 0} usuários</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleManageMembers(group)}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditGroup(group)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
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
              <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>Nenhum grupo cadastrado</p>
              <p className="text-sm mt-1">
                Clique em "Novo Grupo" para adicionar
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
