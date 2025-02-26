
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Medal, FlaskConical, HandIcon, Palette, QrCode, Droplets, ClipboardCheck, Home, SprayCan } from "lucide-react";

const missions = [
  {
    title: "Descobrindo os Ingredientes",
    description: "Associe os ingredientes ao produto correto (tinta, argamassa, impermeabilizante, rejunte ou saneante).",
    detailedDescription: "O visitante recebe uma lista de ingredientes e precisa associá-los ao produto correto. Arraste os ingredientes para os produtos dentro do app.",
    points: 100,
    icon: FlaskConical,
    status: "available",
    example: {
      question: "Qual desses ingredientes é essencial para a fabricação da argamassa?",
      options: [
        { text: "Pigmento", correct: false },
        { text: "Areia e cimento", correct: true },
        { text: "Resina acrílica", correct: false },
        { text: "Tensoativos", correct: false }
      ]
    }
  },
  {
    title: "Mãos na Massa!",
    description: "Misture corretamente um pequeno lote de argamassa ou rejunte e aplique em uma peça de teste.",
    detailedDescription: "O visitante deve misturar corretamente um pequeno lote de argamassa ou rejunte (com supervisão) e aplicá-lo em uma peça de teste. Ganha pontos extras se acertar a proporção correta e espalhar de maneira uniforme.",
    points: 200,
    icon: HandIcon,
    status: "available"
  },
  {
    title: "Qual é essa cor?",
    description: "Identifique as cores corretas do catálogo de tintas da Inkor.",
    detailedDescription: "O visitante vê uma amostra de cor e precisa acertar o nome correto dentro do catálogo de tintas da empresa.",
    points: 150,
    icon: Palette,
    status: "available",
    example: {
      question: "Qual é o nome dessa cor no catálogo da Inkor?",
      options: [
        { text: "Azul Sereno", correct: false },
        { text: "Verde Jade", correct: true },
        { text: "Cinza Urbano", correct: false },
        { text: "Branco Gelo", correct: false }
      ]
    }
  },
  {
    title: "Caça ao QR Code",
    description: "Encontre e escaneie os QR Codes espalhados pela fábrica para desbloquear curiosidades.",
    detailedDescription: "Espalhe QR Codes em locais estratégicos da fábrica. Ao escaneá-los, os visitantes desbloqueiam curiosidades sobre os processos e ganham pontos.",
    points: 300,
    icon: QrCode,
    status: "available",
    funFact: "Você sabia? A impermeabilização de superfícies pode aumentar a durabilidade das construções em até 50%!"
  },
  {
    title: "Desafio do Impermeabilizante",
    description: "Compare superfícies com e sem impermeabilização e identifique as diferenças.",
    detailedDescription: "O visitante observa duas superfícies expostas à água – uma com impermeabilizante e outra sem. Ele precisa identificar corretamente qual foi tratada e explicar por que.",
    points: 150,
    icon: Droplets,
    status: "available",
    example: {
      question: "Qual dessas superfícies recebeu impermeabilização?",
      options: [
        { text: "A que absorveu água rapidamente", correct: false },
        { text: "A que fez a água escorrer sem penetrar", correct: true }
      ]
    }
  },
  {
    title: "Como Produzimos com Qualidade?",
    description: "Teste seus conhecimentos sobre os processos de produção da fábrica.",
    detailedDescription: "Quiz sobre os processos de controle de qualidade da fábrica.",
    points: 200,
    icon: ClipboardCheck,
    status: "available",
    example: {
      question: "O que é feito para garantir que uma tinta tenha a tonalidade correta antes de ser embalada?",
      options: [
        { text: "Teste de viscosidade", correct: false },
        { text: "Análise em espectrofotômetro", correct: true },
        { text: "Adição de mais pigmento aleatoriamente", correct: false },
        { text: "Teste de abrasão", correct: false }
      ]
    }
  },
  {
    title: "Protegendo a Construção!",
    description: "Resolva casos práticos escolhendo os produtos Inkor mais adequados.",
    detailedDescription: "O visitante recebe um caso fictício: 'Uma casa apresenta infiltrações constantes. Qual produto da Inkor pode resolver esse problema?'",
    points: 250,
    icon: Home,
    status: "available",
    example: {
      question: "Uma casa apresenta infiltrações constantes. Qual produto da Inkor pode resolver esse problema?",
      options: [
        { text: "Tinta Acrílica", correct: false },
        { text: "Rejunte Epóxi", correct: false },
        { text: "Impermeabilizante Flexível", correct: true },
        { text: "Argamassa de Assentamento", correct: false }
      ]
    }
  },
  {
    title: "Jogo dos Saneantes",
    description: "Escolha o produto de limpeza correto para cada situação.",
    detailedDescription: "O visitante recebe descrições de situações de limpeza e deve escolher o saneante correto para cada caso.",
    points: 100,
    icon: SprayCan,
    status: "available",
    example: {
      question: "Qual produto é mais indicado para remover mofo de superfícies internas?",
      options: [
        { text: "Detergente Neutro", correct: false },
        { text: "Limpador Alcalino", correct: false },
        { text: "Água Sanitária", correct: true },
        { text: "Cera Líquida", correct: false }
      ]
    }
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
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <mission.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold">{mission.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {mission.detailedDescription}
                    </p>
                    <div className="flex items-center gap-1 text-primary font-medium">
                      <Medal className="w-4 h-4" />
                      <span>{mission.points} pontos</span>
                    </div>
                  </div>
                </div>

                {mission.example && (
                  <div className="mt-4 p-4 bg-primary/5 rounded-lg space-y-3">
                    <p className="font-medium text-sm">Exemplo de pergunta:</p>
                    <p className="text-sm">{mission.example.question}</p>
                    <div className="space-y-2">
                      {mission.example.options.map((option, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded text-sm ${
                            option.correct
                              ? "bg-green-500/10 text-green-700 font-medium"
                              : "bg-muted"
                          }`}
                        >
                          {option.text} {option.correct && "✅"}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mission.funFact && (
                  <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                    <p className="text-sm font-medium">Curiosidade:</p>
                    <p className="text-sm">{mission.funFact}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Missions;
