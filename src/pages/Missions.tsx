
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Medal, FlaskConical, HandIcon, Palette, QrCode, Droplets, ClipboardCheck, Home, Spray } from "lucide-react";

const missions = [
  {
    title: "Descobrindo os Ingredientes",
    description: "Associe os ingredientes ao produto correto (tinta, argamassa, impermeabilizante, rejunte ou saneante).",
    points: 100,
    icon: FlaskConical,
    status: "available"
  },
  {
    title: "Mãos na Massa!",
    description: "Misture corretamente um pequeno lote de argamassa ou rejunte e aplique em uma peça de teste.",
    points: 200,
    icon: HandIcon,
    status: "available"
  },
  {
    title: "Qual é essa cor?",
    description: "Identifique as cores corretas do catálogo de tintas da Inkor.",
    points: 150,
    icon: Palette,
    status: "available"
  },
  {
    title: "Caça ao QR Code",
    description: "Encontre e escaneie os QR Codes espalhados pela fábrica para desbloquear curiosidades.",
    points: 300,
    icon: QrCode,
    status: "available"
  },
  {
    title: "Desafio do Impermeabilizante",
    description: "Compare superfícies com e sem impermeabilização e identifique as diferenças.",
    points: 150,
    icon: Droplets,
    status: "available"
  },
  {
    title: "Como Produzimos com Qualidade?",
    description: "Teste seus conhecimentos sobre os processos de produção da fábrica.",
    points: 200,
    icon: ClipboardCheck,
    status: "available"
  },
  {
    title: "Protegendo a Construção!",
    description: "Resolva casos práticos escolhendo os produtos Inkor mais adequados.",
    points: 250,
    icon: Home,
    status: "available"
  },
  {
    title: "Jogo dos Saneantes",
    description: "Escolha o produto de limpeza correto para cada situação.",
    points: 100,
    icon: Spray,
    status: "available"
  }
];

const Missions = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Missões</h1>
          <p className="text-muted-foreground">
            Complete missões para ganhar pontos e resgatar prêmios exclusivos
          </p>
        </header>

        <div className="grid sm:grid-cols-2 gap-4">
          {missions.map((mission) => (
            <Card key={mission.title} className="glass-card p-6 space-y-4 hover:scale-[1.02] transition-transform">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <mission.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-semibold">{mission.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {mission.description}
                  </p>
                  <div className="flex items-center gap-1 text-primary font-medium">
                    <Medal className="w-4 h-4" />
                    <span>{mission.points} pontos</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Missions;
