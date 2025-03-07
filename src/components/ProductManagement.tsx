
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Package2, Loader2, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string;
  technical_details: string;
  image_url: string;
  created_at: string;
}

export const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    technical_details: "",
    image_url: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se o usuário é administrador
    const currentUserStr = localStorage.getItem("currentUser");
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      setIsAdmin(currentUser.role === "admin");
    }

    // Carregar produtos
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      // Criar uma tabela virtual temporária no localStorage até implementarmos no Supabase
      const storedProducts = localStorage.getItem("products");
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        // Inicializar com produtos de exemplo se não existirem
        const exampleProducts: Product[] = [
          {
            id: "1",
            name: "Tinta Inkor Premium",
            description: "Tinta de alta qualidade para paredes internas e externas.",
            technical_details: "Rendimento: 10-12m² por litro. Secagem: 2 horas. Acabamento: fosco.",
            image_url: "/placeholder.svg",
            created_at: new Date().toISOString(),
          }
        ];
        localStorage.setItem("products", JSON.stringify(exampleProducts));
        setProducts(exampleProducts);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar a lista de produtos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `product_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('media-files')
        .upload(fileName, file, {
          cacheControl: '3600',
        });

      if (error) {
        throw error;
      }

      const { data: urlData } = await supabase.storage
        .from('media-files')
        .createSignedUrl(fileName, 3600 * 24 * 7); // URL válida por 7 dias

      if (urlData?.signedUrl) {
        setNewProduct({
          ...newProduct,
          image_url: urlData.signedUrl,
        });

        toast({
          title: "Imagem enviada com sucesso",
          description: "A imagem do produto foi carregada.",
        });
      }
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast({
        title: "Erro ao enviar imagem",
        description: "Não foi possível enviar a imagem do produto.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e descrição são campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const productToAdd: Product = {
        id: editMode && selectedProduct ? selectedProduct.id : Math.random().toString(36).substring(2, 9),
        name: newProduct.name || "",
        description: newProduct.description || "",
        technical_details: newProduct.technical_details || "",
        image_url: newProduct.image_url || "/placeholder.svg",
        created_at: new Date().toISOString(),
      };

      let updatedProducts: Product[];
      
      if (editMode && selectedProduct) {
        // Atualizar produto existente
        updatedProducts = products.map(product => 
          product.id === selectedProduct.id ? productToAdd : product
        );
        
        toast({
          title: "Produto atualizado",
          description: `O produto "${productToAdd.name}" foi atualizado com sucesso.`,
        });
      } else {
        // Adicionar novo produto
        updatedProducts = [...products, productToAdd];
        
        toast({
          title: "Produto adicionado",
          description: `O produto "${productToAdd.name}" foi adicionado com sucesso.`,
        });
      }
      
      setProducts(updatedProducts);
      localStorage.setItem("products", JSON.stringify(updatedProducts));
      
      // Resetar formulário
      setNewProduct({
        name: "",
        description: "",
        technical_details: "",
        image_url: "",
      });
      setEditMode(false);
      setOpenDialog(false);
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      toast({
        title: "Erro ao adicionar produto",
        description: "Não foi possível adicionar o produto.",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      technical_details: product.technical_details,
      image_url: product.image_url,
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDeleteProduct = (productId: string) => {
    try {
      const updatedProducts = products.filter(product => product.id !== productId);
      setProducts(updatedProducts);
      localStorage.setItem("products", JSON.stringify(updatedProducts));
      
      toast({
        title: "Produto excluído",
        description: "O produto foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast({
        title: "Erro ao excluir produto",
        description: "Não foi possível excluir o produto.",
        variant: "destructive",
      });
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setOpenViewDialog(true);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex-1" />
        {isAdmin && (
          <Dialog open={openDialog} onOpenChange={(open) => {
            setOpenDialog(open);
            if (!open) {
              setEditMode(false);
              setNewProduct({
                name: "",
                description: "",
                technical_details: "",
                image_url: "",
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editMode ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
                <DialogDescription>
                  {editMode 
                    ? "Edite as informações do produto selecionado." 
                    : "Adicione um novo produto ao catálogo da empresa."}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="productName" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="productName"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="productImage" className="text-right">
                    Imagem
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Input
                      id="productImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="col-span-3"
                      disabled={isUploading}
                    />
                    {isUploading && (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Enviando imagem...</span>
                      </div>
                    )}
                    {newProduct.image_url && (
                      <div className="mt-2 border rounded-md p-2 max-w-[200px]">
                        <img 
                          src={newProduct.image_url} 
                          alt="Preview" 
                          className="w-full h-auto rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="productDescription" className="text-right pt-2">
                    Descrição
                  </Label>
                  <Textarea
                    id="productDescription"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="productTechnical" className="text-right pt-2">
                    Detalhes Técnicos
                  </Label>
                  <Textarea
                    id="productTechnical"
                    value={newProduct.technical_details}
                    onChange={(e) => setNewProduct({...newProduct, technical_details: e.target.value})}
                    className="col-span-3"
                    rows={4}
                    placeholder="Rendimento, aplicação, secagem, acabamento, etc."
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddProduct} disabled={isUploading}>
                  {editMode ? "Salvar Alterações" : "Adicionar Produto"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {/* Dialog para visualizar detalhes do produto */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.name}</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="mx-auto w-full max-w-[300px] h-auto">
                  <img 
                    src={selectedProduct.image_url} 
                    alt={selectedProduct.name} 
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Descrição do Produto</h3>
                  <p className="text-sm text-gray-700">{selectedProduct.description}</p>
                </div>
                
                <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-semibold">Informações Técnicas</h3>
                  <p className="text-sm whitespace-pre-line">{selectedProduct.technical_details}</p>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenViewDialog(false)}>
                  Fechar
                </Button>
                {isAdmin && (
                  <Button onClick={() => {
                    setOpenViewDialog(false);
                    handleEditProduct(selectedProduct);
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Produtos da Empresa</CardTitle>
          <CardDescription>
            Catálogo de produtos Inkor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando produtos...</span>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden h-full flex flex-col">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4 flex-1">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{product.description}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewProduct(product)}
                      >
                        Ver Detalhes
                      </Button>
                      
                      {isAdmin && (
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Package2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>Nenhum produto cadastrado</p>
              {isAdmin && (
                <p className="text-sm mt-1">
                  Clique em "Novo Produto" para adicionar ao catálogo
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
