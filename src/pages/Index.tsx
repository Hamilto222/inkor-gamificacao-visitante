
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Medal, Map, QrCode } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Bem-vindo à Inkor
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Explore Nossa Fábrica de Forma Interativa
          </h1>
          <p className="text-lg text-muted-foreground">
            Participe de desafios, acumule pontos e ganhe prêmios exclusivos
            durante sua visita.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="glass-card p-6 text-center space-y-4 floating">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Map className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Mapa Interativo</h3>
            <p className="text-sm text-muted-foreground">
              Navegue pela fábrica com nosso mapa guiado
            </p>
          </Card>

          <Card className="glass-card p-6 text-center space-y-4 floating" style={{ animationDelay: "0.1s" }}>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Desafios QR</h3>
            <p className="text-sm text-muted-foreground">
              Escaneie códigos QR para desbloquear desafios
            </p>
          </Card>

          <Card className="glass-card p-6 text-center space-y-4 floating" style={{ animationDelay: "0.2s" }}>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Medal className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Ganhe Prêmios</h3>
            <p className="text-sm text-muted-foreground">
              Complete desafios e troque pontos por recompensas
            </p>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <Button size="lg" className="scale-in">
            Começar Tour
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Index;

