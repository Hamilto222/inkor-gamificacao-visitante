
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, QrCode, VibrateIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuthGuard } from "@/components/AuthGuard";
import { isMobileApp } from "@/hooks/use-mobile";

const Scanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const isApp = isMobileApp();
  const { toast } = useToast();

  // Check for camera availability
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setHasCamera(devices.some(device => device.kind === 'videoinput'));
      } catch (error) {
        console.error('Error checking camera:', error);
        setHasCamera(false);
      }
    };
    
    checkCamera();
  }, []);

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
      
      // Vibrate device if supported (for mobile feedback)
      if (isApp && 'vibrate' in navigator) {
        navigator.vibrate(200);
      }
      
      toast({
        title: "QR Code detectado!",
        description: "Escaneado com sucesso!",
      });
    }, 2000);
  };
  
  // In a real implementation, for mobile native features, you would use:
  // - Capacitor/Cordova BarcodeScanner plugin for actual QR scanning
  // - Device vibration for feedback
  // - Access to camera permissions properly

  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-xl mx-auto space-y-6">
          <header className="text-center space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
              <QrCode className="h-7 w-7" />
              Scanner QR Code
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Escaneie os QR Codes espalhados pela fábrica para desbloquear informações e ganhar pontos
            </p>
          </header>
          
          <Card className="glass-card shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Câmera</CardTitle>
              <CardDescription>
                Posicione o QR Code dentro da área de leitura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-primary/50 rounded-lg h-48 md:h-64 flex items-center justify-center bg-muted/30 relative overflow-hidden">
                {scanning ? (
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
                    <p>Escaneando...</p>
                  </div>
                ) : scannedCode ? (
                  <div className="text-center p-4">
                    <QrCode className="h-10 w-10 mx-auto mb-4 text-primary" />
                    <h3 className="font-medium text-lg mb-2">Informação Desbloqueada!</h3>
                    <p className="text-muted-foreground text-sm">{scannedCode}</p>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <QrCode className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <p>Nenhum QR Code detectado</p>
                    {!hasCamera && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {isApp ? "Acesso à câmera negado" : "Câmera não detectada"}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  disabled={scanning}
                  onClick={startScanning}
                  className="w-full sm:w-auto"
                >
                  {scanning ? "Escaneando..." : "Iniciar Scanner"}
                </Button>
              </div>
              
              {isApp && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Permita o acesso à câmera para escanear QR codes
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Scanner;
