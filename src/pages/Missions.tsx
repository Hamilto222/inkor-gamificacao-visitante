
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Medal, FlaskConical, HandIcon, Palette, QrCode, Droplets, ClipboardCheck, Home, SprayCan, Upload, Camera, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const missions = [
  {
    id: "descobrindo-ingredientes",
    title: "Descobrindo os Ingredientes",
    description: "Associe os ingredientes ao produto correto (tinta, argamassa, impermeabilizante, rejunte ou saneante).",
    detailedDescription: "O visitante recebe uma lista de ingredientes e precisa associá-los ao produto correto. Arraste os ingredientes para os produtos dentro do app.",
    points: 100,
    icon: FlaskConical,
    status: "available",
    type: "question", // Added type field to distinguish question from activity missions
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
    id: "maos-na-massa",
    title: "Mãos na Massa!",
    description: "Misture corretamente um pequeno lote de argamassa ou rejunte e aplique em uma peça de teste.",
    detailedDescription: "O visitante deve misturar corretamente um pequeno lote de argamassa ou rejunte (com supervisão) e aplicá-lo em uma peça de teste. Ganha pontos extras se acertar a proporção correta e espalhar de maneira uniforme.",
    points: 200,
    icon: HandIcon,
    type: "activity", // This is an activity mission that requires evidence
    status: "available"
  },
  {
    id: "qual-e-essa-cor",
    title: "Qual é essa cor?",
    description: "Identifique as cores corretas do catálogo de tintas da Inkor.",
    detailedDescription: "O visitante vê uma amostra de cor e precisa acertar o nome correto dentro do catálogo de tintas da empresa.",
    points: 150,
    icon: Palette,
    type: "question",
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
    id: "caca-ao-qr-code",
    title: "Caça ao QR Code",
    description: "Encontre e escaneie os QR Codes espalhados pela fábrica para desbloquear curiosidades.",
    detailedDescription: "Espalhe QR Codes em locais estratégicos da fábrica. Ao escaneá-los, os visitantes desbloqueiam curiosidades sobre os processos e ganham pontos.",
    points: 300,
    icon: QrCode,
    type: "activity",
    status: "available",
    funFact: "Você sabia? A impermeabilização de superfícies pode aumentar a durabilidade das construções em até 50%!"
  },
  {
    id: "desafio-impermeabilizante",
    title: "Desafio do Impermeabilizante",
    description: "Compare superfícies com e sem impermeabilização e identifique as diferenças.",
    detailedDescription: "O visitante observa duas superfícies expostas à água – uma com impermeabilizante e outra sem. Ele precisa identificar corretamente qual foi tratada e explicar por que.",
    points: 150,
    icon: Droplets,
    type: "question",
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
    id: "producao-com-qualidade",
    title: "Como Produzimos com Qualidade?",
    description: "Teste seus conhecimentos sobre os processos de produção da fábrica.",
    detailedDescription: "Quiz sobre os processos de controle de qualidade da fábrica.",
    points: 200,
    icon: ClipboardCheck,
    type: "question",
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
    id: "protegendo-construcao",
    title: "Protegendo a Construção!",
    description: "Resolva casos práticos escolhendo os produtos Inkor mais adequados.",
    detailedDescription: "O visitante recebe um caso fictício: 'Uma casa apresenta infiltrações constantes. Qual produto da Inkor pode resolver esse problema?'",
    points: 250,
    icon: Home,
    type: "question",
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
    id: "jogo-saneantes",
    title: "Jogo dos Saneantes",
    description: "Escolha o produto de limpeza correto para cada situação.",
    detailedDescription: "O visitante recebe descrições de situações de limpeza e deve escolher o saneante correto para cada caso.",
    points: 100,
    icon: SprayCan,
    type: "question",
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
  const { toast } = useToast();
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [evidenceImage, setEvidenceImage] = useState<File | null>(null);
  const [evidenceBase64, setEvidenceBase64] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [userMatricula, setUserMatricula] = useState<string>("");
  const [userPoints, setUserPoints] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("available");
  const [evidenceRequired, setEvidenceRequired] = useState<boolean>(false);

  useEffect(() => {
    // Carregar matrícula do usuário atual
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      setUserMatricula(currentUser.matricula);
      
      // Carregar missões concluídas
      loadCompletedMissions(currentUser.matricula);
      
      // Carregar pontos do usuário
      loadUserPoints(currentUser.matricula);
    }
  }, []);

  const loadCompletedMissions = async (matricula: string) => {
    try {
      const { data, error } = await supabase
        .from('missoes_completadas')
        .select('missao_id')
        .eq('matricula', matricula);
      
      if (error) throw error;
      
      if (data) {
        setCompletedMissions(data.map(item => item.missao_id));
      }
    } catch (error: any) {
      console.error("Erro ao carregar missões concluídas:", error.message);
    }
  };

  const loadUserPoints = async (matricula: string) => {
    try {
      // Verificar se já existe registro para o usuário
      const { data, error } = await supabase
        .from('pontos_usuarios')
        .select('total_pontos')
        .eq('matricula', matricula);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setUserPoints(data[0].total_pontos);
      } else {
        // Se não existir, criar um registro com 0 pontos
        const { error: insertError } = await supabase
          .from('pontos_usuarios')
          .insert([{ matricula: matricula, total_pontos: 0 }]);
        
        if (insertError) throw insertError;
        
        setUserPoints(0);
      }
    } catch (error: any) {
      console.error("Erro ao carregar pontos do usuário:", error.message);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEvidenceImage(file);
      
      // Converter imagem para base64 para exibição
      const reader = new FileReader();
      reader.onload = () => {
        setEvidenceBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteMission = async () => {
    if (!selectedMission) return;
    
    // Verificar se evidência é obrigatória
    if (evidenceRequired && !evidenceImage) {
      toast({
        title: "Evidência necessária",
        description: "Para esta missão, é necessário enviar uma foto como evidência.",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar se resposta foi fornecida
    if (!answer) {
      toast({
        title: "Resposta necessária",
        description: "Por favor, forneça uma resposta para a missão.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      let evidenceUrl = null;
      
      // Se tiver imagem, fazer upload
      if (evidenceImage) {
        const filename = `${Date.now()}-${evidenceImage.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media-files')
          .upload(filename, evidenceImage);
        
        if (uploadError) throw uploadError;
        
        if (uploadData) {
          evidenceUrl = uploadData.path;
        }
      }
      
      // Verificar se o usuário existe na tabela de matrículas
      const { data: matriculaData, error: matriculaError } = await supabase
        .from('matriculas_funcionarios')
        .select('numero_matricula')
        .eq('numero_matricula', userMatricula)
        .single();
      
      if (matriculaError) {
        throw new Error("Matrícula não encontrada no sistema. Por favor, contate o administrador.");
      }
      
      // Registrar conclusão da missão
      const { error: missionError } = await supabase
        .from('missoes_completadas')
        .insert([
          { 
            matricula: userMatricula,
            missao_id: selectedMission.id,
            pontos_ganhos: selectedMission.points,
            evidencia: evidenceUrl,
            respostas: { answer: answer }
          }
        ]);
      
      if (missionError) throw missionError;
      
      // Verificar se o usuário já tem pontos
      const { data: pointsData, error: pointsError } = await supabase
        .from('pontos_usuarios')
        .select('total_pontos')
        .eq('matricula', userMatricula);
      
      if (pointsError) throw pointsError;
      
      let newTotalPoints = selectedMission.points;
      
      if (pointsData && pointsData.length > 0) {
        newTotalPoints = (pointsData[0].total_pontos || 0) + selectedMission.points;
        
        // Atualizar pontos do usuário
        const { error: updateError } = await supabase
          .from('pontos_usuarios')
          .update({ total_pontos: newTotalPoints })
          .eq('matricula', userMatricula);
        
        if (updateError) throw updateError;
      } else {
        // Criar novo registro de pontos
        const { error: insertError } = await supabase
          .from('pontos_usuarios')
          .insert([{ 
            matricula: userMatricula, 
            total_pontos: selectedMission.points 
          }]);
        
        if (insertError) throw insertError;
      }
      
      // Atualizar estados
      setUserPoints(newTotalPoints);
      setCompletedMissions([...completedMissions, selectedMission.id]);
      
      toast({
        title: "Missão completada!",
        description: `Você ganhou ${selectedMission.points} pontos pela conclusão da missão "${selectedMission.title}".`,
      });
      
      // Limpar dados do formulário
      setEvidenceImage(null);
      setEvidenceBase64(null);
      setAnswer("");
      setOpenDialog(false);
    } catch (error: any) {
      toast({
        title: "Erro ao completar missão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStartMission = (mission: any) => {
    setSelectedMission(mission);
    setEvidenceRequired(mission.type === "activity");
    setOpenDialog(true);
  };

  const isMissionCompleted = (missionId: string) => {
    return completedMissions.includes(missionId);
  };

  const availableMissions = missions.filter(
    mission => !isMissionCompleted(mission.id)
  );
  
  const completedMissionsList = missions.filter(
    mission => isMissionCompleted(mission.id)
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Missões</h1>
          <p className="text-muted-foreground">
            Complete missões para ganhar pontos e resgatar prêmios exclusivos
          </p>
          <div className="bg-primary/10 rounded-full px-6 py-2 inline-flex items-center gap-2">
            <Medal className="h-5 w-5 text-primary" />
            <span className="font-bold">{userPoints} pontos</span>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-[400px] mx-auto">
            <TabsTrigger value="available">Disponíveis ({availableMissions.length})</TabsTrigger>
            <TabsTrigger value="completed">Completadas ({completedMissionsList.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="mt-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {availableMissions.map((mission) => (
                <Card key={mission.id} className="glass-card p-6 space-y-4 hover:scale-[1.02] transition-transform">
                  <div className="space-y-4">
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
                    
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => handleStartMission(mission)}
                    >
                      Iniciar Missão
                    </Button>
                  </div>
                </Card>
              ))}
              
              {availableMissions.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Todas as missões completadas!</h3>
                  <p className="text-muted-foreground">
                    Parabéns! Você completou todas as missões disponíveis.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {completedMissionsList.map((mission) => (
                <Card key={mission.id} className="glass-card p-6 space-y-4 border-green-500/30 bg-green-50/30 dark:bg-green-950/10">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <h3 className="font-semibold flex items-center gap-2">
                          {mission.title}
                          <span className="text-xs bg-green-500/20 text-green-700 px-2 py-0.5 rounded-full">
                            Completada
                          </span>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {mission.description}
                        </p>
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                          <Medal className="w-4 h-4" />
                          <span>{mission.points} pontos ganhos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {completedMissionsList.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <p className="text-muted-foreground">
                    Você ainda não completou nenhuma missão. Comece agora!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedMission?.title}</DialogTitle>
              <DialogDescription>
                {selectedMission?.detailedDescription}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {selectedMission?.example && (
                <div className="space-y-4">
                  <Label>Responda à pergunta:</Label>
                  <p className="text-sm font-medium">{selectedMission.example.question}</p>
                  
                  <RadioGroup value={answer} onValueChange={setAnswer}>
                    {selectedMission.example.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.text} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`}>{option.text}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
              
              {!selectedMission?.example && (
                <div className="space-y-2">
                  <Label htmlFor="answer">Descreva como você completou a missão:</Label>
                  <Textarea 
                    id="answer" 
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Explique brevemente como você realizou a atividade..."
                    rows={4}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  {evidenceRequired ? "Evidência (obrigatória)" : "Evidência (opcional)"}
                </Label>
                <div className="grid gap-4">
                  <Input
                    id="evidence"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required={evidenceRequired}
                  />
                  
                  {evidenceBase64 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-2">Prévia da imagem:</p>
                      <img 
                        src={evidenceBase64} 
                        alt="Evidência da missão" 
                        className="max-h-40 rounded-md object-contain bg-accent/50 p-2" 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button 
                onClick={handleCompleteMission}
                disabled={!answer || (evidenceRequired && !evidenceImage)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Completar Missão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Missions;
