
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Users, UserSquare, ListChecks, Package2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface User {
  matricula: string;
  nome: string;
  id?: string;
  grupo?: string;
  grupo_id?: string;
}

interface Group {
  id: string;
  nome: string;
  descricao: string | null;
  data_criacao: string;
  usuario_count?: number;
}

interface Mission {
  id: string;
  titulo: string;
}

interface Product {
  id: string;
  nome: string;
}

export const UserGroupManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupUsers, setGroupUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newGroup, setNewGroup] = useState({
    nome: "",
    descricao: "",
    selectedUsers: [] as string[],
    selectedMissions: [] as string[],
    selectedProducts: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    loadGroups();
    loadUsers();
    loadMissions();
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupDetails(selectedGroupId);
      loadGroupUsers(selectedGroupId);
    }
  }, [selectedGroupId]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('matriculas_funcionarios')
        .select('id, nome, numero_matricula, grupo_id')
        .order('nome');

      if (error) {
        throw error;
      }

      if (data) {
        // Transform data to match our User interface
        const transformedUsers: User[] = data.map(user => ({
          id: user.id,
          nome: user.nome,
          matricula: user.numero_matricula,
          grupo_id: user.grupo_id || undefined
        }));
        
        setUsers(transformedUsers);
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

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      
      // Get all groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('grupos_usuarios')
        .select('*')
        .order('nome');

      if (groupsError) {
        throw groupsError;
      }

      if (groupsData) {
        // For each group, count the users
        const groupsWithCount = await Promise.all(
          groupsData.map(async (group) => {
            const { count, error: countError } = await supabase
              .from('usuario_grupo')
              .select('*', { count: 'exact', head: true })
              .eq('grupo_id', group.id);
              
            if (countError) {
              console.error("Erro ao contar usuários do grupo:", countError);
              return { ...group, usuario_count: 0 };
            }
            
            return { ...group, usuario_count: count || 0 };
          })
        );
        
        setGroups(groupsWithCount);
        
        // Select the first group by default if there's no selection
        if (groupsWithCount.length > 0 && !selectedGroupId) {
          setSelectedGroupId(groupsWithCount[0].id);
        }
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

  const loadMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('missoes')
        .select('id, titulo')
        .order('titulo');

      if (error) {
        throw error;
      }

      setMissions(data || []);
    } catch (error) {
      console.error("Erro ao carregar missões:", error);
    }
  };

  const loadProducts = async () => {
    try {
      // If you have a products table:
      // const { data, error } = await supabase
      //   .from('produtos')
      //   .select('id, nome')
      //   .order('nome');
      
      // For demonstration, using mock data
      setProducts([
        { id: "produto1", nome: "Produto 1" },
        { id: "produto2", nome: "Produto 2" },
        { id: "produto3", nome: "Produto 3" },
      ]);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  };

  const loadGroupDetails = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('grupos_usuarios')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) {
        throw error;
      }

      setSelectedGroup(data);
    } catch (error) {
      console.error("Erro ao carregar detalhes do grupo:", error);
    }
  };

  const loadGroupUsers = async (groupId: string) => {
    try {
      // Get users in this group
      const { data, error } = await supabase
        .from('usuario_grupo')
        .select('matricula')
        .eq('grupo_id', groupId);

      if (error) {
        throw error;
      }

      if (data) {
        // Get full user details for these matriculas
        const matriculas = data.map(item => item.matricula);
        
        if (matriculas.length > 0) {
          const { data: userData, error: userError } = await supabase
            .from('matriculas_funcionarios')
            .select('*')
            .in('numero_matricula', matriculas);
            
          if (userError) {
            throw userError;
          }
          
          // Transform data to include group information
          const userList = userData.map(user => ({
            id: user.id,
            nome: user.nome,
            matricula: user.numero_matricula,
            grupo: selectedGroup?.nome || "",
            grupo_id: selectedGroup?.id
          }));
          
          setGroupUsers(userList);
        } else {
          setGroupUsers([]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar usuários do grupo:", error);
    }
  };

  const handleAddGroup = async () => {
    if (!newGroup.nome) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do grupo é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // 1. Insert the new group
      const { data: groupData, error: groupError } = await supabase
        .from('grupos_usuarios')
        .insert([{
          nome: newGroup.nome,
          descricao: newGroup.descricao || null
        }])
        .select();

      if (groupError) {
        throw groupError;
      }
      
      const newGroupId = groupData[0].id;
      
      // 2. Add selected users to the group
      if (newGroup.selectedUsers.length > 0) {
        const userGroupEntries = newGroup.selectedUsers.map(matricula => ({
          grupo_id: newGroupId,
          matricula
        }));
        
        const { error: userGroupError } = await supabase
          .from('usuario_grupo')
          .insert(userGroupEntries);
          
        if (userGroupError) {
          throw userGroupError;
        }
      }
      
      // 3. Add selected missions to the group
      if (newGroup.selectedMissions.length > 0) {
        const missionGroupEntries = newGroup.selectedMissions.map(missionId => ({
          grupo_id: newGroupId,
          missao_id: missionId
        }));
        
        const { error: missionGroupError } = await supabase
          .from('missao_grupo')
          .insert(missionGroupEntries);
          
        if (missionGroupError) {
          throw missionGroupError;
        }
      }
      
      // 4. Add selected products to the group
      if (newGroup.selectedProducts.length > 0) {
        const productGroupEntries = newGroup.selectedProducts.map(productId => ({
          grupo_id: newGroupId,
          premio_id: productId
        }));
        
        const { error: productGroupError } = await supabase
          .from('premio_grupo')
          .insert(productGroupEntries);
          
        if (productGroupError) {
          throw productGroupError;
        }
      }

      toast({
        title: "Grupo criado",
        description: `O grupo "${newGroup.nome}" foi criado com sucesso.`,
      });
      
      // Reset form and reload data
      setNewGroup({
        nome: "",
        descricao: "",
        selectedUsers: [],
        selectedMissions: [],
        selectedProducts: []
      });
      
      setOpenDialog(false);
      loadGroups();
      
      // Select the newly created group
      setSelectedGroupId(newGroupId);
      
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

  const handleAddUserToGroup = async () => {
    if (!selectedGroupId) return;
    
    try {
      // Open a dialog to select users to add to the group
      // This functionality would be implemented separately
    } catch (error) {
      console.error("Erro ao adicionar usuário ao grupo:", error);
    }
  };

  const handleRemoveUserFromGroup = async (matricula: string) => {
    if (!selectedGroupId) return;
    
    try {
      const { error } = await supabase
        .from('usuario_grupo')
        .delete()
        .eq('grupo_id', selectedGroupId)
        .eq('matricula', matricula);

      if (error) {
        throw error;
      }

      toast({
        title: "Usuário removido",
        description: `O usuário foi removido do grupo com sucesso.`,
      });
      
      loadGroupUsers(selectedGroupId);
    } catch (error) {
      console.error("Erro ao remover usuário do grupo:", error);
      toast({
        title: "Erro ao remover usuário",
        description: "Não foi possível remover o usuário do grupo.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = groupUsers.filter(user => 
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <Select 
            value={selectedGroupId || ""} 
            onValueChange={(value) => setSelectedGroupId(value)}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecione um grupo" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  <div className="flex items-center gap-2">
                    <UserSquare className="h-4 w-4" />
                    <span>{group.nome}</span>
                    <span className="text-muted-foreground text-xs">
                      ({group.usuario_count} usuários)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Grupo</DialogTitle>
              <DialogDescription>
                Crie um novo grupo e selecione os usuários, missões e produtos associados.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Grupo</Label>
                  <Input 
                    id="nome" 
                    value={newGroup.nome}
                    onChange={(e) => setNewGroup({...newGroup, nome: e.target.value})}
                    placeholder="Digite o nome do grupo"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea 
                  id="descricao" 
                  rows={2}
                  value={newGroup.descricao}
                  onChange={(e) => setNewGroup({...newGroup, descricao: e.target.value})}
                  placeholder="Descrição breve sobre o grupo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="usuarios">Selecionar Usuários</Label>
                <Select 
                  value="placeholder"
                  onValueChange={(value) => {
                    if (value !== "placeholder" && !newGroup.selectedUsers.includes(value)) {
                      setNewGroup({
                        ...newGroup, 
                        selectedUsers: [...newGroup.selectedUsers, value]
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione usuários para adicionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>
                      Selecione usuários para adicionar
                    </SelectItem>
                    {users
                      .filter(user => !newGroup.selectedUsers.includes(user.matricula))
                      .map((user) => (
                        <SelectItem key={user.matricula} value={user.matricula}>
                          {user.nome} ({user.matricula})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                
                {newGroup.selectedUsers.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <Label>Usuários selecionados:</Label>
                    <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                      <ul className="space-y-1">
                        {newGroup.selectedUsers.map((matricula) => {
                          const user = users.find(u => u.matricula === matricula);
                          return (
                            <li key={matricula} className="flex justify-between items-center text-sm">
                              <span>{user?.nome} ({matricula})</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setNewGroup({
                                    ...newGroup,
                                    selectedUsers: newGroup.selectedUsers.filter(m => m !== matricula)
                                  });
                                }}
                              >
                                Remover
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="missoes">Selecionar Missões</Label>
                <Select 
                  value="placeholder"
                  onValueChange={(value) => {
                    if (value !== "placeholder" && !newGroup.selectedMissions.includes(value)) {
                      setNewGroup({
                        ...newGroup, 
                        selectedMissions: [...newGroup.selectedMissions, value]
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione missões para o grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>
                      Selecione missões para o grupo
                    </SelectItem>
                    {missions
                      .filter(mission => !newGroup.selectedMissions.includes(mission.id))
                      .map((mission) => (
                        <SelectItem key={mission.id} value={mission.id}>
                          {mission.titulo}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                
                {newGroup.selectedMissions.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <Label>Missões selecionadas:</Label>
                    <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                      <ul className="space-y-1">
                        {newGroup.selectedMissions.map((missionId) => {
                          const mission = missions.find(m => m.id === missionId);
                          return (
                            <li key={missionId} className="flex justify-between items-center text-sm">
                              <span>{mission?.titulo}</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setNewGroup({
                                    ...newGroup,
                                    selectedMissions: newGroup.selectedMissions.filter(id => id !== missionId)
                                  });
                                }}
                              >
                                Remover
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="produtos">Selecionar Produtos</Label>
                <Select 
                  value="placeholder"
                  onValueChange={(value) => {
                    if (value !== "placeholder" && !newGroup.selectedProducts.includes(value)) {
                      setNewGroup({
                        ...newGroup, 
                        selectedProducts: [...newGroup.selectedProducts, value]
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione produtos para o grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>
                      Selecione produtos para o grupo
                    </SelectItem>
                    {products
                      .filter(product => !newGroup.selectedProducts.includes(product.id))
                      .map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                
                {newGroup.selectedProducts.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <Label>Produtos selecionados:</Label>
                    <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                      <ul className="space-y-1">
                        {newGroup.selectedProducts.map((productId) => {
                          const product = products.find(p => p.id === productId);
                          return (
                            <li key={productId} className="flex justify-between items-center text-sm">
                              <span>{product?.nome}</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setNewGroup({
                                    ...newGroup,
                                    selectedProducts: newGroup.selectedProducts.filter(id => id !== productId)
                                  });
                                }}
                              >
                                Remover
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={handleAddGroup} disabled={isLoading}>
                {isLoading ? "Salvando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {selectedGroup ? (
        <div className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserSquare className="h-5 w-5" />
                {selectedGroup.nome}
              </CardTitle>
              {selectedGroup.descricao && (
                <CardDescription>
                  {selectedGroup.descricao}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Usuários do Grupo
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar usuários"
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAddUserToGroup}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.matricula}>
                            <TableCell className="font-medium">{user.matricula}</TableCell>
                            <TableCell>{user.nome}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRemoveUserFromGroup(user.matricula)}
                              >
                                Remover do Grupo
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                            {searchTerm 
                              ? "Nenhum usuário encontrado com estes termos de busca." 
                              : "Nenhum usuário neste grupo."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ListChecks className="h-4 w-4" />
                      Missões do Grupo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Missões do grupo seriam exibidas aqui */}
                    <div className="text-center py-6 text-muted-foreground">
                      Funcionalidade em desenvolvimento
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package2 className="h-4 w-4" />
                      Produtos do Grupo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Produtos do grupo seriam exibidos aqui */}
                    <div className="text-center py-6 text-muted-foreground">
                      Funcionalidade em desenvolvimento
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>Selecione um grupo para ver seus detalhes</p>
          {groups.length === 0 && (
            <p className="text-sm mt-1">
              Ou crie um novo grupo clicando em "Novo Grupo"
            </p>
          )}
        </div>
      )}
    </>
  );
};
