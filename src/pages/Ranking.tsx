
import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Medal, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface RankingUser {
  matricula: string;
  nome: string;
  total_pontos: number;
  posicao: number;
}

const Ranking = () => {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserMatricula, setCurrentUserMatricula] = useState<string>("");
  const isMobile = useIsMobile();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setCurrentUserMatricula(user.matricula);
    }

    loadRanking();
  }, []);

  const loadRanking = async () => {
    setIsLoading(true);
    try {
      // First try to load from Supabase
      const { data: pontos, error } = await supabase
        .from('pontos_usuarios')
        .select('matricula, total_pontos')
        .order('total_pontos', { ascending: false });
      
      if (error) {
        console.error("Erro ao carregar pontuações do Supabase:", error);
        loadFromLocalStorage();
        return;
      }
      
      if (pontos && pontos.length > 0) {
        // Get user data from Supabase
        const { data: usuarios, error: userError } = await supabase
          .from('matriculas_funcionarios')
          .select('numero_matricula, nome');
          
        if (userError) {
          console.error("Erro ao carregar usuários do Supabase:", userError);
          loadFromLocalStorage();
          return;
        }
        
        // Map user data to ranking
        const rankingData = pontos.map((ponto, index) => {
          const user = usuarios?.find(u => u.numero_matricula === ponto.matricula);
          return {
            matricula: ponto.matricula,
            nome: user?.nome || `Usuário ${ponto.matricula}`,
            total_pontos: ponto.total_pontos,
            posicao: index + 1
          };
        });
        
        setRanking(rankingData);
      } else {
        // Fall back to localStorage if no data in Supabase
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error("Erro ao carregar ranking:", error);
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadFromLocalStorage = () => {
    // Falling back to localStorage for development/demo purposes
    const users = localStorage.getItem("users");
    const parsedUsers = users ? JSON.parse(users) : [];
    
    // Generate sample ranking data
    const rankingData: RankingUser[] = parsedUsers
      .filter((user: any) => user.ativo)
      .map((user: any, index: number) => ({
        matricula: user.matricula,
        nome: user.nome,
        total_pontos: Math.floor(Math.random() * 1000), // Random points for example
        posicao: index + 1,
      }))
      .sort((a: RankingUser, b: RankingUser) => b.total_pontos - a.total_pontos)
      .map((user: RankingUser, index: number) => ({
        ...user,
        posicao: index + 1,
      }));
    
    setRanking(rankingData);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-500";
      case 2:
        return "bg-gray-400";
      case 3:
        return "bg-amber-700";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-4">
        <header className="text-center md:text-left space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center md:justify-start justify-center gap-2">
            <Trophy className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
            Ranking de Pontuação
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Veja quem está liderando o ranking de pontos do Inkor Tour
          </p>
        </header>
        
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-xl">Classificação Geral</CardTitle>
            <CardDescription>
              Os usuários com maior pontuação aparecem no topo da lista
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : ranking.length > 0 ? (
              <div className="space-y-1">
                {ranking.map((user) => (
                  <div 
                    key={user.matricula} 
                    className={`flex items-center p-2 md:p-3 rounded-lg ${
                      user.matricula === currentUserMatricula 
                        ? "bg-primary/10 border border-primary/30" 
                        : "hover:bg-accent"
                    } ${isMobile ? 'text-sm' : ''}`}
                  >
                    <div className="flex items-center justify-center w-8 md:w-10 h-8 md:h-10">
                      {user.posicao <= 3 ? (
                        <div className={`rounded-full p-1.5 md:p-2 ${getMedalColor(user.posicao)}`}>
                          <Medal className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                      ) : (
                        <span className="text-base md:text-lg font-bold text-muted-foreground">{user.posicao}º</span>
                      )}
                    </div>
                    
                    <Avatar className="h-8 w-8 md:h-10 md:w-10 mx-2 md:mx-3">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs md:text-sm">
                        {getInitials(user.nome)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm md:text-base">{user.nome}</p>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">
                        Matrícula: {user.matricula}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <span className="inline-block font-bold bg-primary/10 text-primary px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
                        {user.total_pontos} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Trophy className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">
                  Nenhum usuário no ranking ainda
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Ranking;
