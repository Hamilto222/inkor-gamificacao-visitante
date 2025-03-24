
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
import { Plus, Search, Trash2, Award, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Prize {
  id?: string;
  nome: string;
  descricao: string;
  pontos_necessarios: number;
  quantidade: number;
  imagem_url?: string | null;
  ativo: boolean;
}

export const PrizeManagement = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [newPrize, setNewPrize] = useState<Prize>({
    nome: "",
    descricao: "",
    pontos_necessarios: 100,
    quantidade: 10,
    ativo: true
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPrizes();
  }, []);

  const loadPrizes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('premios')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setPrizes(data);
      }
    } catch (error) {
      console.error("Erro ao carregar prêmios:", error);
      toast({
        title: "Erro ao carregar prêmios",
        description: "Não foi possível carregar os prêmios.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `prize-images/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('media-files')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from('media-files')
        .getPublicUrl(filePath);
        
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

  const handleAddPrize = async () => {
    if (!newPrize.nome || !newPrize.descricao || !newPrize.pontos_necessarios) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Upload image if selected
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }
      
      // Prepare prize data for saving
      const prizeData = {
        nome: newPrize.nome,
        descricao: newPrize.descricao,
        pontos_necessarios: newPrize.pontos_necessarios,
        quantidade: newPrize.quantidade,
        ativo: newPrize.ativo,
        imagem_url: imageUrl
      };

      const { data, error } = await supabase
        .from('premios')
        .insert([prizeData])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Prêmio adicionado",
        description: `O prêmio "${newPrize.nome}" foi adicionado com sucesso.`,
      });
      
      // Reset form
      setNewPrize({
        nome: "",
        descricao: "",
        pontos_necessarios: 100,
        quantidade: 10,
        ativo: true
      });
      setSelectedImage(null);
      setImagePreview(null);
      setOpenDialog(false);
      
      // Reload prizes
      loadPrizes();
    } catch (error) {
      console.error("Erro ao adicionar prêmio:", error);
      toast({
        title: "Erro ao adicionar prêmio",
        description: "Não foi possível adicionar o prêmio.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      console.log(`Updating prize ${id} status to ${!currentStatus}`);
      
      const { error } = await supabase
        .from('premios')
        .update({ ativo: !currentStatus })
        .eq('id', id);

      if (error) {
        console.error("Error updating prize status:", error);
        throw error;
      }

      toast({
        title: currentStatus ? "Prêmio desativado" : "Prêmio ativado",
        description: `O prêmio foi ${currentStatus ? "desativado" : "ativado"} com sucesso.`,
      });

      // Reload prizes to reflect the change
      await loadPrizes();
    } catch (error) {
      console.error("Erro ao atualizar status do prêmio:", error);
      toast({
        title: "Erro ao atualizar prêmio",
        description: "Não foi possível atualizar o status do prêmio.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter prizes based on search term
  const filteredPrizes = prizes.filter(prize => 
    prize.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    prize.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex-1" />
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Prêmio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Prêmio</DialogTitle>
              <DialogDescription>
                Adicione um novo prêmio para ser resgatado com pontos.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Prêmio</Label>
                <Input 
                  id="nome" 
                  value={newPrize.nome}
                  onChange={(e) => setNewPrize({...newPrize, nome: e.target.value})}
                  placeholder="Digite o nome do prêmio"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea 
                  id="descricao" 
                  rows={3}
                  value={newPrize.descricao}
                  onChange={(e) => setNewPrize({...newPrize, descricao: e.target.value})}
                  placeholder="Descreva o prêmio"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pontos">Pontos Necessários</Label>
                <Input 
                  id="pontos" 
                  type="number"
                  min={1}
                  value={newPrize.pontos_necessarios}
                  onChange={(e) => setNewPrize({...newPrize, pontos_necessarios: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade Disponível</Label>
                <Input 
                  id="quantidade" 
                  type="number"
                  min={0}
                  value={newPrize.quantidade}
                  onChange={(e) => setNewPrize({...newPrize, quantidade: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imagem">Imagem (opcional)</Label>
                <div className="flex flex-col space-y-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => document.getElementById('prize-image')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Selecionar Imagem
                  </Button>
                  <Input 
                    id="prize-image" 
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
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="ativo"
                  checked={newPrize.ativo} 
                  onCheckedChange={(checked) => setNewPrize({...newPrize, ativo: checked})}
                />
                <Label htmlFor="ativo">Prêmio Ativo</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={handleAddPrize} disabled={isLoading}>
                {isLoading ? "Salvando..." : "Adicionar Prêmio"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <CardTitle>Lista de Prêmios</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar prêmios"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            Total de {filteredPrizes.length} prêmios cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Descrição</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead className="hidden md:table-cell">Quantidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrizes.length > 0 ? (
                  filteredPrizes.map((prize) => (
                    <TableRow key={prize.id}>
                      <TableCell className="font-medium">{prize.nome}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {prize.descricao.length > 50 
                          ? `${prize.descricao.substring(0, 50)}...` 
                          : prize.descricao
                        }
                      </TableCell>
                      <TableCell>{prize.pontos_necessarios} pts</TableCell>
                      <TableCell className="hidden md:table-cell">{prize.quantidade}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={prize.ativo} 
                            onCheckedChange={() => prize.id && handleToggleStatus(prize.id, prize.ativo)}
                            disabled={isLoading}
                          />
                          <span>{prize.ativo ? "Ativo" : "Inativo"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => prize.id && handleToggleStatus(prize.id, prize.ativo)}
                          disabled={isLoading}
                        >
                          {prize.ativo ? "Desativar" : "Ativar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      {searchTerm 
                        ? "Nenhum prêmio encontrado com estes termos de busca." 
                        : "Nenhum prêmio cadastrado no sistema."}
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
