
import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Medal, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

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
      // Temporariamente usando localStorage, mas pronto para integrar com Supabase
      // quando a tabela for preenchida
      const users = localStorage.getItem("users");
      const parsedUsers = users ? JSON.parse(users) : [];
      
      // Gerar dados de exemplo para o ranking
      const rankingData: RankingUser[] = parsedUsers
        .filter((user: any) => user.ativo)
        .map((user: any, index: number) => ({
          matricula: user.matricula,
          nome: user.nome,
          total_pontos: Math.floor(Math.random() * 1000), // Pontos aleatórios para exemplo
          posicao: index + 1,
        }))
        .sort((a: RankingUser, b: RankingUser) => b.total_pontos - a.total_pontos)
        .map((user: RankingUser, index: number) => ({
          ...user,
          posicao: index + 1,
        }));
      
      setRanking(rankingData);
    } catch (error) {
      console.error("Erro ao carregar ranking:", error);
    } finally {
      setIsLoading(false);
    }
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
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Ranking de Pontuação
          </h1>
          <p className="text-muted-foreground">
            Veja quem está liderando o ranking de pontos do Inkor Tour
          </p>
        </header>
        
        <Card>
          <CardHeader>
            <CardTitle>Classificação Geral</CardTitle>
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
                    className={`flex items-center p-3 rounded-lg ${
                      user.matricula === currentUserMatricula 
                        ? "bg-primary/10 border border-primary/30" 
                        : "hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center justify-center w-10 h-10">
                      {user.posicao <= 3 ? (
                        <div className={`rounded-full p-2 ${getMedalColor(user.posicao)}`}>
                          <Medal className="h-5 w-5 text-white" />
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground">{user.posicao}º</span>
                      )}
                    </div>
                    
                    <Avatar className="h-10 w-10 mx-3">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(user.nome)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.nome}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        Matrícula: {user.matricula}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <span className="inline-block font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {user.total_pontos} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Trophy className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-30" />
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
