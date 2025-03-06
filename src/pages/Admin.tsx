
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Filter, Plus, Search, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";

interface User {
  id?: string;
  matricula: string;
  nome: string;
  role: "admin" | "user";
  ativo: boolean;
  senha?: string;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<User>({
    matricula: "",
    nome: "",
    role: "user",
    ativo: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Load users from localStorage
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Initialize with a default admin if no users exist
      const defaultAdmin = {
        matricula: "admin",
        nome: "Administrador",
        role: "admin",
        senha: "admin",
        ativo: true,
      };
      localStorage.setItem("users", JSON.stringify([defaultAdmin]));
      setUsers([defaultAdmin]);
    }
  }, []);

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
    if (userExists) {
      toast({
        title: "Matrícula duplicada",
        description: "Esta matrícula já está cadastrada no sistema.",
        variant: "destructive",
      });
      return;
    }

    const updatedUsers = [...users, { ...newUser, id: Date.now().toString() }];
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    toast({
      title: "Usuário adicionado",
      description: `O usuário ${newUser.nome} foi adicionado com sucesso.`,
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
    <AuthGuard allowedRoles={["admin"]}>
      <Layout>
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <UserCog className="h-8 w-8" />
                Administração de Usuários
              </h1>
              <p className="text-muted-foreground">
                Gerencie os usuários e suas permissões no sistema
              </p>
            </div>
            
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do novo usuário. O usuário precisará definir sua senha no primeiro acesso.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="matricula">Matrícula</Label>
                    <Input 
                      id="matricula" 
                      value={newUser.matricula}
                      onChange={(e) => setNewUser({...newUser, matricula: e.target.value})}
                      placeholder="Digite a matrícula"
                    />
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
                  <Button onClick={handleAddUser}>Adicionar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </header>
          
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
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Admin;
