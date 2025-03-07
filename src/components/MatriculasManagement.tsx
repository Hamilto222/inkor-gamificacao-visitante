
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, FileInput, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Matricula {
  id: string;
  numero_matricula: string;
  nome: string;
  ativo: boolean;
  created_at: string;
}

export const MatriculasManagement = () => {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [newMatricula, setNewMatricula] = useState({
    numero_matricula: "",
    nome: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadMatriculas = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('matriculas_funcionarios')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setMatriculas(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar matrículas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatriculas();
  }, []);

  const handleAddMatricula = async () => {
    if (!newMatricula.numero_matricula || !newMatricula.nome) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('matriculas_funcionarios')
        .insert([
          { 
            numero_matricula: newMatricula.numero_matricula,
            nome: newMatricula.nome,
            ativo: true
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Matrícula adicionada",
        description: `A matrícula ${newMatricula.numero_matricula} foi adicionada com sucesso.`,
      });
      
      // Adicionar também uma entrada de pontos para o usuário
      await supabase
        .from('pontos_usuarios')
        .insert([
          { 
            matricula: newMatricula.numero_matricula,
            total_pontos: 0
          }
        ]);
      
      setNewMatricula({
        numero_matricula: "",
        nome: "",
      });
      
      setOpenDialog(false);
      loadMatriculas();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar matrícula",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('matriculas_funcionarios')
        .update({ ativo: !ativo })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: ativo ? "Matrícula desativada" : "Matrícula ativada",
        description: `A matrícula foi ${ativo ? "desativada" : "ativada"} com sucesso.`,
      });
      
      loadMatriculas();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredMatriculas = matriculas.filter(matricula => 
    matricula.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    matricula.numero_matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciamento de Matrículas</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nova Matrícula
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Matrícula</DialogTitle>
              <DialogDescription>
                Cadastre uma nova matrícula de funcionário no sistema.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="matricula">Número da Matrícula</Label>
                <Input 
                  id="matricula" 
                  value={newMatricula.numero_matricula}
                  onChange={(e) => setNewMatricula({...newMatricula, numero_matricula: e.target.value})}
                  placeholder="Digite o número da matrícula"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input 
                  id="nome" 
                  value={newMatricula.nome}
                  onChange={(e) => setNewMatricula({...newMatricula, nome: e.target.value})}
                  placeholder="Digite o nome completo"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={handleAddMatricula}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Matrículas</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar matrículas"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            Total de {filteredMatriculas.length} matrículas cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Carregando matrículas...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatriculas.length > 0 ? (
                    filteredMatriculas.map((matricula) => (
                      <TableRow key={matricula.id}>
                        <TableCell className="font-medium">{matricula.numero_matricula}</TableCell>
                        <TableCell>{matricula.nome}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={matricula.ativo} 
                              onCheckedChange={() => handleToggleStatus(matricula.id, matricula.ativo)} 
                            />
                            <span>{matricula.ativo ? "Ativo" : "Inativo"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleToggleStatus(matricula.id, matricula.ativo)}>
                            {matricula.ativo ? "Desativar" : "Ativar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        {searchTerm 
                          ? "Nenhuma matrícula encontrada com estes termos de busca." 
                          : "Nenhuma matrícula cadastrada no sistema."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
