import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Medal, Activity, HandIcon, HelpCircle, ListChecks, Upload, Camera, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { vibrateDevice } from "@/capacitor";

interface MissionOption {
  text: string;
  value: string;
}

interface Mission {
  id?: string;
  titulo: string;
  descricao: string;
  tipo: string;
  pontos: number;
  imagem_url?: string | null;
  ativo: boolean;
  opcoes?: MissionOption[] | null;
  resposta_correta?: string | null;
  evidencia_obrigatoria: boolean;
  grupo_id?: string | null;
  detailedDescription?: string; // For backwards compatibility
}

const Missions = () => {
  const { toast } = useToast();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [evidenceImage, setEvidenceImage] = useState<File | null>(null);
  const [evidenceBase64, setEvidenceBase64] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [userMatricula, setUserMatricula] = useState<string>("");
  const [userPoints, setUserPoints] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("available");
  const [evidenceRequired, setEvidenceRequired] = useState<boolean>(false);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      setUserMatricula(currentUser.matricula);
      
      loadCompletedMissions(currentUser.matricula);
      
      loadUserPoints(currentUser.matricula);
    }

    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('missoes')
        .select('*')
        .eq('ativo', true);
      
      if (error) throw error;
      
      if (data) {
        const transformedData = data.map(mission => {
          let missionType = mission.tipo;
          if (mission.tipo === "quiz") {
            missionType = "multipla_escolha";
          } else if (mission.tipo === "task") {
            missionType = "tarefa";
          } else if (mission.tipo === "activity") {
            missionType = "atividade";
          }
          
          return {
            ...mission,
            tipo: missionType,
            detailedDescription: mission.descricao,
            opcoes: mission.opcoes ? (mission.opcoes as unknown as MissionOption[]) : null
          };
        });
        
        setMissions(transformedData);
      }
    } catch (error: any) {
      console.error("Erro ao carregar missões:", error.message);
      toast({
        title: "Erro ao carregar missões",
        description: "Não foi possível carregar as missões disponíveis.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      const { data, error } = await supabase
        .from('pontos_usuarios')
        .select('total_pontos')
        .eq('matricula', matricula);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setUserPoints(data[0].total_pontos);
      } else {
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
      
      const reader = new FileReader();
      reader.onload = () => {
        setEvidenceBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteMission = async () => {
    if (!selectedMission) return;
    
    if (evidenceRequired && !evidenceImage) {
      toast({
        title: "Evidência necessária",
        description: "Para esta missão, é necessário enviar uma foto como evidência.",
        variant: "destructive",
      });
      return;
    }
    
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
      
      const { data: matriculaData, error: matriculaError } = await supabase
        .from('matriculas_funcionarios')
        .select('numero_matricula')
        .eq('numero_matricula', userMatricula)
        .single();
      
      if (matriculaError) {
        console.error("Error checking matricula:", matriculaError);
        toast({
          title: "Aviso",
          description: "Sua matrícula não foi encontrada no sistema, mas a missão será registrada.",
          variant: "default",
        });
      }
      
      const { error: missionError } = await supabase
        .from('missoes_completadas')
        .insert([
          { 
            matricula: userMatricula,
            missao_id: selectedMission.id,
            pontos_ganhos: selectedMission.pontos,
            evidencia: evidenceUrl,
            respostas: { answer: answer }
          }
        ]);
      
      if (missionError) throw missionError;
      
      const { data: pointsData, error: pointsError } = await supabase
        .from('pontos_usuarios')
        .select('total_pontos')
        .eq('matricula', userMatricula);
      
      if (pointsError) throw pointsError;
      
      let newTotalPoints = selectedMission.pontos;
      
      if (pointsData && pointsData.length > 0) {
        newTotalPoints = (pointsData[0].total_pontos || 0) + selectedMission.pontos;
        
        const { error: updateError } = await supabase
          .from('pontos_usuarios')
          .update({ total_pontos: newTotalPoints })
          .eq('matricula', userMatricula);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('pontos_usuarios')
          .insert([{ 
            matricula: userMatricula, 
            total_pontos: selectedMission.pontos 
          }]);
        
        if (insertError) throw insertError;
      }
      
      setUserPoints(newTotalPoints);
      setCompletedMissions([...completedMissions, selectedMission.id!]);
      
      vibrateDevice(500);
      
      toast({
        title: "Missão completada!",
        description: `Você ganhou ${selectedMission.pontos} pontos pela conclusão da missão "${selectedMission.titulo}".`,
      });
      
      setEvidenceImage(null);
      setEvidenceBase64(null);
      setAnswer("");
      setOpenDialog(false);
    } catch (error: any) {
      console.error("Complete mission error:", error);
      toast({
        title: "Erro ao completar missão",
        description: error.message || "Ocorreu um erro ao registrar a missão",
        variant: "destructive",
      });
    }
  };

  const handleStartMission = (mission: Mission) => {
    setSelectedMission(mission);
    setEvidenceRequired(mission.evidencia_obrigatoria);
    setOpenDialog(true);
    
    vibrateDevice(200);
  };

  const isMissionCompleted = (missionId?: string) => {
    if (!missionId) return false;
    return completedMissions.includes(missionId);
  };

  const availableMissions = missions.filter(
    mission => !isMissionCompleted(mission.id)
  );
  
  const completedMissionsList = missions.filter(
    mission => isMissionCompleted(mission.id)
  );

  const getMissionTypeIcon = (type: string) => {
    switch (type) {
      case "multipla_escolha":
        return <HelpCircle className="w-6 h-6 text-primary" />;
      case "atividade":
        return <Activity className="w-6 h-6 text-primary" />;
      case "tarefa":
        return <ListChecks className="w-6 h-6 text-primary" />;
      default:
        return <Activity className="w-6 h-6 text-primary" />;
    }
  };

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
          <TabsList className="grid grid-cols-2 w-full max-w-xs mx-auto">
            <TabsTrigger value="available">Disponíveis ({availableMissions.length})</TabsTrigger>
            <TabsTrigger value="completed">Completadas ({completedMissionsList.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Carregando missões...</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {availableMissions.length > 0 ? (
                  availableMissions.map((mission) => (
                    <Card key={mission.id} className="glass-card p-6 space-y-4 hover:scale-[1.02] transition-transform">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {getMissionTypeIcon(mission.tipo)}
                          </div>
                          <div className="space-y-2 flex-1">
                            <h3 className="font-semibold">{mission.titulo}</h3>
                            <p className="text-sm text-muted-foreground">
                              {mission.descricao}
                            </p>
                            <div className="flex items-center gap-1 text-primary font-medium">
                              <Medal className="w-4 h-4" />
                              <span>{mission.pontos} pontos</span>
                            </div>
                          </div>
                        </div>
                        
                        {mission.imagem_url && (
                          <div className="mt-4 w-full h-32 rounded-md overflow-hidden">
                            <img 
                              src={mission.imagem_url} 
                              alt={mission.titulo} 
                              className="w-full h-full object-cover"
                            />
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
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Todas as missões completadas!</h3>
                    <p className="text-muted-foreground">
                      Parabéns! Você completou todas as missões disponíveis.
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {completedMissionsList.length > 0 ? (
                completedMissionsList.map((mission) => (
                  <Card key={mission.id} className="glass-card p-6 space-y-4 border-green-500/30 bg-green-50/30 dark:bg-green-950/10">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <h3 className="font-semibold flex items-center gap-2">
                            {mission.titulo}
                            <span className="text-xs bg-green-500/20 text-green-700 px-2 py-0.5 rounded-full">
                              Completada
                            </span>
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {mission.descricao}
                          </p>
                          <div className="flex items-center gap-1 text-green-600 font-medium">
                            <Medal className="w-4 h-4" />
                            <span>{mission.pontos} pontos ganhos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
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
          <DialogContent className="max-w-md w-[95%] mx-auto">
            <DialogHeader>
              <DialogTitle>{selectedMission?.titulo}</DialogTitle>
              <DialogDescription>
                {selectedMission?.detailedDescription || selectedMission?.descricao}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {selectedMission?.tipo === "multipla_escolha" && selectedMission.opcoes && (
                <div className="space-y-4">
                  <Label>Responda à pergunta:</Label>
                  <p className="text-sm font-medium">{selectedMission.descricao}</p>
                  
                  <RadioGroup value={answer} onValueChange={setAnswer}>
                    {selectedMission.opcoes.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`}>{option.text}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
              
              {selectedMission?.tipo !== "multipla_escolha" && (
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
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setOpenDialog(false)} className="w-full sm:w-auto">Cancelar</Button>
              <Button 
                onClick={handleCompleteMission}
                disabled={!answer || (evidenceRequired && !evidenceImage)}
                className="w-full sm:w-auto"
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
