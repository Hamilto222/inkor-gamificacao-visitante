
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Medal, Umbrella, Coffee, Palmtree, CircuitBoard, 
  ShoppingCart, CheckCircle, AlertCircle, LockIcon 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/integrations/supabase/client";

interface Prize {
  id: string;
  name: string;
  points: number;
  icon: any;
  description: string;
}

const prizes: Prize[] = [
  {
    id: "bone-inkor",
    name: "Boné Inkor",
    points: 500,
    icon: CircuitBoard,
    description: "Boné exclusivo com a marca Inkor"
  },
  {
    id: "copo-personalizado",
    name: "Copo Personalizado",
    points: 1000,
    icon: Coffee,
    description: "Copo térmico com seu nome"
  },
  {
    id: "guarda-sol",
    name: "Guarda-sol",
    points: 2000,
    icon: Umbrella,
    description: "Guarda-sol de praia Inkor"
  },
  {
    id: "cadeira-praia",
    name: "Cadeira de Praia",
    points: 3000,
    icon: Palmtree,
    description: "Cadeira de praia dobrável"
  },
];

const Store = () => {
  const { toast } = useToast();
  const [userPoints, setUserPoints] = useState<number>(0);
  const [redeemedPrizes, setRedeemedPrizes] = useState<string[]>([]);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(false);
  const [userMatricula, setUserMatricula] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        // Carregar matrícula do usuário atual
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          setUserMatricula(currentUser.matricula);
          
          // Carregar pontos do usuário
          const { data: pointsData, error: pointsError } = await supabase
            .from('pontos_usuarios')
            .select('total_pontos')
            .eq('matricula', currentUser.matricula)
            .single();
          
          if (pointsError) throw pointsError;
          
          if (pointsData) {
            setUserPoints(pointsData.total_pontos);
          }
          
          // Carregar prêmios já resgatados
          const { data: redeemedData, error: redeemedError } = await supabase
            .from('premios_resgatados')
            .select('premio_id')
            .eq('matricula', currentUser.matricula);
          
          if (redeemedError) throw redeemedError;
          
          if (redeemedData) {
            setRedeemedPrizes(redeemedData.map(item => item.premio_id));
          }
        }
      } catch (error: any) {
        console.error("Erro ao carregar dados do usuário:", error.message);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar seus pontos e prêmios.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const handleSelectPrize = (prize: Prize) => {
    setSelectedPrize(prize);
    setOpenDialog(true);
    setConfirmationStep(false);
  };

  const handleRedeemPrize = async () => {
    if (!selectedPrize) return;
    
    try {
      // Verificar se o usuário tem pontos suficientes
      if (userPoints < selectedPrize.points) {
        toast({
          title: "Pontos insuficientes",
          description: `Você precisa de mais ${selectedPrize.points - userPoints} pontos para resgatar este prêmio.`,
          variant: "destructive",
        });
        setOpenDialog(false);
        return;
      }
      
      // Registrar o resgate do prêmio
      const { error: redeemError } = await supabase
        .from('premios_resgatados')
        .insert([
          { 
            matricula: userMatricula,
            premio_id: selectedPrize.id
          }
        ]);
      
      if (redeemError) throw redeemError;
      
      // Atualizar os pontos do usuário
      const newPoints = userPoints - selectedPrize.points;
      const { error: updateError } = await supabase
        .from('pontos_usuarios')
        .update({ total_pontos: newPoints })
        .eq('matricula', userMatricula);
      
      if (updateError) throw updateError;
      
      // Atualizar estados
      setUserPoints(newPoints);
      setRedeemedPrizes([...redeemedPrizes, selectedPrize.id]);
      
      toast({
        title: "Prêmio resgatado com sucesso!",
        description: `Você resgatou "${selectedPrize.name}". Procure um administrador para recebê-lo.`,
      });
      
      setOpenDialog(false);
    } catch (error: any) {
      toast({
        title: "Erro ao resgatar prêmio",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isPrizeRedeemed = (prizeId: string) => {
    return redeemedPrizes.includes(prizeId);
  };

  const isPrizeAvailable = (prize: Prize) => {
    return userPoints >= prize.points && !isPrizeRedeemed(prize.id);
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Loja de Prêmios</h1>
            <p className="text-muted-foreground">
              Troque seus pontos por prêmios exclusivos
            </p>
            <div className="bg-primary/10 rounded-full px-6 py-2 inline-flex items-center gap-2">
              <Medal className="h-5 w-5 text-primary" />
              <span className="font-bold">{userPoints} pontos disponíveis</span>
            </div>
          </header>

          {isLoading ? (
            <div className="text-center py-12">
              <p>Carregando prêmios...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {prizes.map((prize) => (
                <Card 
                  key={prize.id} 
                  className={`glass-card overflow-hidden ${
                    isPrizeRedeemed(prize.id) 
                      ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" 
                      : !isPrizeAvailable(prize) 
                        ? "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800" 
                        : ""
                  }`}
                >
                  <div className="p-6 text-center space-y-4">
                    {isPrizeRedeemed(prize.id) && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                    
                    {!isPrizeAvailable(prize) && !isPrizeRedeemed(prize.id) && (
                      <div className="absolute top-2 right-2 bg-gray-500 text-white rounded-full p-1">
                        <LockIcon className="w-5 h-5" />
                      </div>
                    )}
                    
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                      isPrizeRedeemed(prize.id) 
                        ? "bg-green-500/20" 
                        : !isPrizeAvailable(prize) 
                          ? "bg-gray-300/50 dark:bg-gray-700/50" 
                          : "bg-primary/10"
                    }`}>
                      <prize.icon className={`w-8 h-8 ${
                        isPrizeRedeemed(prize.id) 
                          ? "text-green-600" 
                          : !isPrizeAvailable(prize) 
                            ? "text-gray-500" 
                            : "text-primary"
                      }`} />
                    </div>
                    <h3 className="text-xl font-semibold">{prize.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {prize.description}
                    </p>
                    <div className={`flex items-center justify-center gap-2 font-semibold ${
                      isPrizeRedeemed(prize.id) 
                        ? "text-green-600" 
                        : !isPrizeAvailable(prize) 
                          ? "text-gray-500" 
                          : "text-primary"
                    }`}>
                      <Medal className="w-5 h-5" />
                      <span>{prize.points} pontos</span>
                    </div>
                    
                    {isPrizeRedeemed(prize.id) ? (
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        disabled
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Resgatado
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleSelectPrize(prize)}
                        disabled={!isPrizeAvailable(prize)}
                        variant={isPrizeAvailable(prize) ? "default" : "outline"}
                      >
                        {isPrizeAvailable(prize) ? (
                          <>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Resgatar Prêmio
                          </>
                        ) : (
                          <>
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Pontos insuficientes
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {confirmationStep ? "Confirmar Resgate" : "Resgatar Prêmio"}
              </DialogTitle>
              <DialogDescription>
                {confirmationStep 
                  ? "Confirme que deseja realmente resgatar este prêmio. Esta ação não pode ser desfeita."
                  : `Você está prestes a trocar ${selectedPrize?.points} pontos por:`}
              </DialogDescription>
            </DialogHeader>
            
            {!confirmationStep && selectedPrize && (
              <div className="py-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <selectedPrize.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedPrize.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedPrize.description}</p>
                    <div className="flex items-center gap-1 text-primary mt-1">
                      <Medal className="w-4 h-4" />
                      <span>{selectedPrize.points} pontos</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-900/50">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                    Após resgatar um prêmio, você não poderá desfazer esta ação. Seus pontos serão 
                    descontados imediatamente.
                  </p>
                </div>
              </div>
            )}
            
            {confirmationStep && selectedPrize && (
              <div className="py-4">
                <div className="p-4 mb-4 text-center bg-primary/5 rounded-md">
                  <p className="font-semibold mb-2">Resumo do resgate:</p>
                  <p className="text-2xl font-bold text-primary">{selectedPrize.name}</p>
                  <div className="flex justify-center items-center gap-2 mt-2">
                    <Medal className="w-5 h-5 text-primary" />
                    <span className="text-lg font-medium">{selectedPrize.points} pontos</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 justify-center p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    Seu saldo após o resgate: <span className="font-bold">{userPoints - selectedPrize.points} pontos</span>
                  </p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              {confirmationStep ? (
                <>
                  <Button variant="outline" onClick={() => setConfirmationStep(false)}>
                    Voltar
                  </Button>
                  <Button onClick={handleRedeemPrize}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Confirmar Resgate
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setConfirmationStep(true)}>
                    Prosseguir
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
    </AuthGuard>
  );
};

export default Store;
