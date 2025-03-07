
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
import { Plus, Search } from "lucide-react";

interface User {
  id?: string;
  matricula: string;
  nome: string;
  role: "admin" | "user";
  ativo: boolean;
  senha?: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<User>({
    matricula: "",
    nome: "",
    role: "user",
    ativo: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [matriculaExists, setMatriculaExists] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load users from localStorage
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);

  // Validate matricula when it changes
  useEffect(() => {
    if (newUser.matricula) {
      // Check if the matricula exists in the users array
      const userExists = users.some(user => user.matricula === newUser.matricula);
      setMatriculaExists(userExists);
    } else {
      setMatriculaExists(true); // Reset if empty
    }
  }, [newUser.matricula, users]);

  const handleAddUser = () => {
    if (!newUser.matricula || !newUser.nome) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Check if matricula already exists
    const userExists = users.some(user => user.matricula === newUser.matricula);
    if (!userExists) {
      toast({
        title: "Matrícula inválida",
        description: "Esta matrícula não está cadastrada no sistema.",
        variant: "destructive",
      });
      return;
    }

    // Check if the user already has a role assigned (already configured in the system)
    const existingUserWithRole = users.find(user => 
      user.matricula === newUser.matricula && user.role !== undefined
    );
    
    if (existingUserWithRole) {
      toast({
        title: "Usuário já configurado",
        description: "Este usuário já possui um perfil configurado no sistema.",
        variant: "destructive",
      });
      return;
    }

    // Update the existing user with new information
    const updatedUsers = users.map(user => {
      if (user.matricula === newUser.matricula) {
        return { 
          ...user, 
          nome: newUser.nome,
          role: newUser.role,
          ativo: true
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    toast({
      title: "Usuário atualizado",
      description: `O usuário ${newUser.nome} foi configurado com sucesso.`,
    });
    
    // Reset form
    setNewUser({
      matricula: "",
      nome: "",
      role: "user",
      ativo: true,
    });
    
    setOpenDialog(false);
  };

  const handleToggleStatus = (matricula: string) => {
    const updatedUsers = users.map(user => {
      if (user.matricula === matricula) {
        return { ...user, ativo: !user.ativo };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    const targetUser = updatedUsers.find(user => user.matricula === matricula);
    toast({
      title: targetUser?.ativo ? "Usuário ativado" : "Usuário desativado",
      description: `O usuário ${targetUser?.nome} foi ${targetUser?.ativo ? "ativado" : "desativado"}.`,
    });
  };

  const handleChangeRole = (matricula: string, newRole: "admin" | "user") => {
    const updatedUsers = users.map(user => {
      if (user.matricula === matricula) {
        return { ...user, role: newRole };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    const targetUser = updatedUsers.find(user => user.matricula === matricula);
    toast({
      title: "Perfil atualizado",
      description: `O usuário ${targetUser?.nome} agora é ${newRole === "admin" ? "Administrador" : "Usuário comum"}.`,
    });
  };

  const filteredUsers = users.filter(user => 
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex-1" />
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar Usuário</DialogTitle>
              <DialogDescription>
                Configure o acesso para um usuário que já possui matrícula cadastrada no sistema.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <Input 
                  id="matricula" 
                  value={newUser.matricula}
                  onChange={(e) => setNewUser({...newUser, matricula: e.target.value})}
                  placeholder="Digite a matrícula existente"
                  className={!matriculaExists && newUser.matricula ? "border-red-500" : ""}
                />
                {!matriculaExists && newUser.matricula && (
                  <p className="text-sm text-red-500 mt-1">
                    Matrícula não encontrada no sistema
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input 
                  id="nome" 
                  value={newUser.nome}
                  onChange={(e) => setNewUser({...newUser, nome: e.target.value})}
                  placeholder="Digite o nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Perfil</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value: "admin" | "user") => 
                    setNewUser({...newUser, role: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário Comum</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button 
                onClick={handleAddUser}
                disabled={!matriculaExists}
              >
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Usuários</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            Total de {filteredUsers.length} usuários cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.matricula}>
                      <TableCell className="font-medium">{user.matricula}</TableCell>
                      <TableCell>{user.nome}</TableCell>
                      <TableCell>
                        <Select 
                          value={user.role} 
                          onValueChange={(value: "admin" | "user") => 
                            handleChangeRole(user.matricula, value)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Usuário Comum</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={user.ativo} 
                            onCheckedChange={() => handleToggleStatus(user.matricula)} 
                          />
                          <span>{user.ativo ? "Ativo" : "Inativo"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleToggleStatus(user.matricula)}>
                          {user.ativo ? "Desativar" : "Ativar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      {searchTerm 
                        ? "Nenhum usuário encontrado com estes termos de busca." 
                        : "Nenhum usuário cadastrado no sistema."}
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
