
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Package2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface Product {
  id: string;
  name: string;
  description: string;
  technical_details: string;
  image_url: string;
  created_at: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setIsLoading(true);
    try {
      const storedProducts = localStorage.getItem("products");
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setOpenViewDialog(true);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package2 className="h-8 w-8" />
            Produtos Inkor
          </h1>
          <p className="text-muted-foreground">
            Conheça nossa linha completa de produtos
          </p>
        </header>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewProduct(product)}>
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  <Button variant="link" className="p-0 h-auto mt-2">
                    Ver detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-xl font-medium text-muted-foreground">
              {searchTerm 
                ? "Nenhum produto encontrado com estes termos de busca." 
                : "Nenhum produto disponível no momento."}
            </p>
          </div>
        )}

        {/* Dialog para visualizar detalhes do produto */}
        <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
          <DialogContent className="sm:max-w-[600px]">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedProduct.name}</DialogTitle>
                  <DialogDescription>
                    Detalhes completos do produto
                  </DialogDescription>
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
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Products;
