
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Medal, Umbrella, Coffee, Palmtree, CircuitBoard } from "lucide-react";

const prizes = [
  {
    name: "Boné Inkor",
    points: 500,
    icon: CircuitBoard,
    description: "Boné exclusivo com a marca Inkor"
  },
  {
    name: "Copo Personalizado",
    points: 1000,
    icon: Coffee,
    description: "Copo térmico com seu nome"
  },
  {
    name: "Guarda-sol",
    points: 2000,
    icon: Umbrella,
    description: "Guarda-sol de praia Inkor"
  },
  {
    name: "Cadeira de Praia",
    points: 3000,
    icon: Palmtree,
    description: "Cadeira de praia dobrável"
  },
];

const Store = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Loja de Prêmios</h1>
          <p className="text-muted-foreground">
            Troque seus pontos por prêmios exclusivos
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {prizes.map((prize) => (
            <Card key={prize.name} className="glass-card overflow-hidden">
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <prize.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{prize.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {prize.description}
                </p>
                <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                  <Medal className="w-5 h-5" />
                  <span>{prize.points} pontos</span>
                </div>
                <Button className="w-full">Resgatar Prêmio</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Store;
