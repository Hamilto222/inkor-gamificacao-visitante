
import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Star } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";

interface RankingUser {
  position: number;
  name: string;
  points: number;
  badge?: string;
}

const rankings: RankingUser[] = [
  { position: 1, name: "Marina Silva", points: 1250, badge: "ouro" },
  { position: 2, name: "Carlos Eduardo", points: 1120, badge: "prata" },
  { position: 3, name: "Fernanda Torres", points: 980, badge: "bronze" },
  { position: 4, name: "João Oliveira", points: 840 },
  { position: 5, name: "Amanda Nunes", points: 780 },
  { position: 6, name: "Roberto Carlos", points: 720 },
  { position: 7, name: "Juliana Lima", points: 650 },
  { position: 8, name: "Gustavo Mendes", points: 590 },
  { position: 9, name: "Patrícia Santos", points: 540 },
  { position: 10, name: "Marcos Andrade", points: 510 },
];

const Ranking = () => {
  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="text-center space-y-4">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Trophy className="h-8 w-8" />
              Ranking Geral
            </h1>
            <p className="text-muted-foreground">
              Confira os visitantes que mais pontuaram nas atividades da Inkor Tour
            </p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top 3 highlighted users */}
            {rankings.slice(0, 3).map((user) => (
              <Card key={user.position} className={`
                glass-card shadow-lg ${user.position === 1 
                  ? 'border-yellow-400 ring-2 ring-yellow-300' 
                  : user.position === 2 
                    ? 'border-gray-400 ring-1 ring-gray-300' 
                    : 'border-amber-700 ring-1 ring-amber-600'
                }`}
              >
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">
                    {user.position === 1 ? (
                      <Trophy className="h-12 w-12 text-yellow-500" />
                    ) : user.position === 2 ? (
                      <Medal className="h-12 w-12 text-gray-400" />
                    ) : (
                      <Medal className="h-12 w-12 text-amber-700" />
                    )}
                  </div>
                  <CardTitle className="text-xl">
                    {user.position}º Lugar
                  </CardTitle>
                  <CardDescription>
                    {user.badge === "ouro" 
                      ? "Medalha de Ouro" 
                      : user.badge === "prata" 
                        ? "Medalha de Prata" 
                        : "Medalha de Bronze"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <h3 className="font-bold text-lg mb-1">{user.name}</h3>
                  <p className="text-primary font-medium">{user.points} pontos</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="glass-card shadow-lg">
            <CardHeader>
              <CardTitle>Classificação Geral</CardTitle>
              <CardDescription>
                Os 10 visitantes com maior pontuação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rankings.map((user) => (
                  <div 
                    key={user.position}
                    className={`flex items-center p-3 rounded-lg ${
                      user.position <= 3 
                        ? 'bg-accent/50' 
                        : 'bg-background hover:bg-accent/30'
                    } transition-colors border`}
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted mr-4">
                      {user.position}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{user.name}</h4>
                    </div>
                    <div className="flex items-center">
                      {user.badge && (
                        <div className="mr-3">
                          {user.badge === "ouro" ? (
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                          ) : user.badge === "prata" ? (
                            <Star className="h-5 w-5 text-gray-400 fill-gray-400" />
                          ) : (
                            <Star className="h-5 w-5 text-amber-700 fill-amber-700" />
                          )}
                        </div>
                      )}
                      <div className="font-bold text-primary">{user.points}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Ranking;
