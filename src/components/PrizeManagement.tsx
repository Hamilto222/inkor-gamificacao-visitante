
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Gift, Upload, FileCheck2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Prize {
  id?: string;
  nome: string;
  descricao: string;
  pontos_necessarios: number;
  quantidade: number;
  imagem_url?: string | null;
  ativo: boolean;
  data_criacao?: string;
}

export const PrizeManagement = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [newPrize, setNewPrize] = useState<Prize>({
    nome: "",
    descricao: "",
    pontos_necessarios: 100,
    quantidade: 10,
    ativo: true,
  });
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [availableGroups, setAvailableGroups] = useState<{id: string, nome: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPrizes();
    loadGroups();
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

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('grupos_usuarios')
        .select('id, nome');

      if (error) {
        throw error;
      }

      if (data) {
        setAvailableGroups(data);
      }
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
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
    if (!newPrize.nome || !newPrize.descricao) {
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
      
      // Insert prize
      const { data, error } = await supabase
        .from('premios')
        .insert([{
          nome: newPrize.nome,
          descricao: newPrize.descricao,
          pontos_necessarios: newPrize.pontos_necessarios,
          quantidade: newPrize.quantidade,
          imagem_url: imageUrl || null,
          ativo: newPrize.ativo
        }])
        .select();

      if (error) {
        throw error;
      }

      // If groups were selected, associate the prize with those groups
      if (selectedGroups.length > 0 && data && data.length > 0) {
        const prizeId = data[0].id;
        
        // Create entries in premio_grupo table
        const premioGrupoData = selectedGroups.map(groupId => ({
          premio_id: prizeId,
          grupo_id: groupId
        }));
        
        const { error: groupError } = await supabase
          .from('premio_grupo')
          .insert(premioGrupoData);
          
        if (groupError) {
          console.error("Erro ao associar prêmio a grupos:", groupError);
          toast({
            title: "Aviso",
            description: "Prêmio criado, mas houve um erro ao associá-lo aos grupos.",
            variant: "destructive",
          });
        }
      }

      setShowSuccessDialog(true);
      
      // Reset form
      setNewPrize({
        nome: "",
        descricao: "",
        pontos_necessarios: 100,
        quantidade: 10,
        ativo: true,
      });
      setSelectedGroups([]);
      setSelectedImage(null);
      setImagePreview(null);
      
      loadPrizes();
    } catch (error) {
      console.error("Erro ao criar prêmio:", error);
      toast({
        title: "Erro ao criar prêmio",
        description: "Não foi possível criar o prêmio.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('premios')
        .update({ ativo: !currentStatus })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: currentStatus ? "Prêmio desativado" : "Prêmio ativado",
        description: `O prêmio foi ${currentStatus ? "desativado" : "ativado"} com sucesso.`,
      });

      loadPrizes();
    } catch (error) {
      console.error("Erro ao atualizar status do prêmio:", error);
      toast({
        title: "Erro ao atualizar prêmio",
        description: "Não foi possível atualizar o status do prêmio.",
        variant: "destructive",
      });
    }
  };

  const handleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

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
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Prêmio</DialogTitle>
              <DialogDescription>
                Adicione um novo prêmio que os usuários poderão resgatar com seus pontos.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="pontos">Pontos Necessários</Label>
                  <Input 
                    id="pontos" 
                    type="number"
                    min={1}
                    value={newPrize.pontos_necessarios}
                    onChange={(e) => setNewPrize({...newPrize, pontos_necessarios: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea 
                  id="descricao" 
                  rows={3}
                  value={newPrize.descricao}
                  onChange={(e) => setNewPrize({...newPrize, descricao: e.target.value})}
                  placeholder="Descreva detalhadamente o prêmio"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade Disponível</Label>
                  <Input 
                    id="quantidade" 
                    type="number"
                    min={0}
                    value={newPrize.quantidade}
                    onChange={(e) => setNewPrize({...newPrize, quantidade: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imagem">Imagem (opcional)</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => document.getElementById('prize-image')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Selecionar Imagem
                      </Button>
                    </div>
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
                          ×
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="ativo"
                  checked={newPrize.ativo} 
                  onCheckedChange={(checked) => setNewPrize({...newPrize, ativo: checked})}
                />
                <Label htmlFor="ativo">Prêmio ativo</Label>
              </div>
              
              <div className="space-y-2 border p-4 rounded-md">
                <Label className="block mb-2">Grupos com acesso a este prêmio</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableGroups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Switch 
                        id={`group-${group.id}`}
                        checked={selectedGroups.includes(group.id)} 
                        onCheckedChange={() => handleGroupSelection(group.id)}
                      />
                      <Label htmlFor={`group-${group.id}`}>{group.nome}</Label>
                    </div>
                  ))}
                </div>
                {availableGroups.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum grupo disponível</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Se nenhum grupo for selecionado, o prêmio será visível para todos os usuários.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={handleAddPrize} disabled={isLoading}>
                {isLoading ? "Salvando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Prêmios</CardTitle>
            <div className="relative w-64">
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
            Total de {filteredPrizes.length} prêmios cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrizes.length > 0 ? (
                  filteredPrizes.map((prize) => (
                    <TableRow key={prize.id}>
                      <TableCell className="font-medium">{prize.nome}</TableCell>
                      <TableCell>{prize.pontos_necessarios} pts</TableCell>
                      <TableCell>{prize.quantidade}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={prize.ativo} 
                            onCheckedChange={() => prize.id && handleToggleStatus(prize.id, prize.ativo)} 
                          />
                          <span>{prize.ativo ? "Ativo" : "Inativo"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => prize.id && handleToggleStatus(prize.id, prize.ativo)}>
                          {prize.ativo ? "Desativar" : "Ativar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
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

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <FileCheck2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl mb-2">Prêmio Criado com Sucesso!</DialogTitle>
            <DialogDescription>
              O prêmio foi adicionado e já está disponível para resgate.
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
    </>
  );
};
