
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuthGuard } from "@/components/AuthGuard";

const Scanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const { toast } = useToast();

  // Simulating QR code scanning functionality
  // In a real app, you would integrate with a camera/QR scanning library
  const startScanning = () => {
    setScanning(true);
    
    // Simulate scanning process with timeout
    setTimeout(() => {
      const codes = [
        "QR001: Setor de Tintas - Sabia que misturamos mais de 3.000 cores diferentes?",
        "QR002: Laboratório - Nossos produtos passam por mais de 20 testes de qualidade!",
        "QR003: Linha de Produção - Produzimos mais de 500.000 litros por mês!",
        "QR004: Armazenamento - Nossa logística entrega em todo o Brasil em até 72h!"
      ];
      
      const randomCode = codes[Math.floor(Math.random() * codes.length)];
      setScannedCode(randomCode);
      setScanning(false);
      
      toast({
        title: "QR Code detectado!",
        description: "Escaneado com sucesso!",
      });
    }, 2000);
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="text-center space-y-4">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <QrCode className="h-8 w-8" />
              Scanner QR Code
            </h1>
            <p className="text-muted-foreground">
              Escaneie os QR Codes espalhados pela fábrica para desbloquear informações e ganhar pontos
            </p>
          </header>
          
          <Card className="glass-card shadow-lg">
            <CardHeader>
              <CardTitle>Câmera</CardTitle>
              <CardDescription>
                Posicione o QR Code dentro da área de leitura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-primary/50 rounded-lg h-64 flex items-center justify-center bg-muted/30">
                {scanning ? (
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
                    <p>Escaneando...</p>
                  </div>
                ) : scannedCode ? (
                  <div className="text-center p-4">
                    <QrCode className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-medium text-lg mb-2">Informação Desbloqueada!</h3>
                    <p className="text-muted-foreground">{scannedCode}</p>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p>Nenhum QR Code detectado</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  disabled={scanning}
                  onClick={startScanning}
                >
                  {scanning ? "Escaneando..." : "Iniciar Scanner"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Scanner;
