
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Camera, VibrateIcon, Check, AlertCircle } from "lucide-react";
import { scanBarcode, vibrateDevice, takePhoto } from "@/capacitor";
import { useToast } from "@/hooks/use-toast";

const Scanner = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleScan = async () => {
    try {
      setIsLoading(true);
      setScanResult(null);
      setScanSuccess(null);
      
      // Attempt to scan barcode using native camera
      const result = await scanBarcode();
      
      if (result && result.content) {
        // Provide haptic feedback on successful scan
        vibrateDevice(300);
        
        setScanResult(result.content);
        
        // Here you would validate the QR code against your backend
        // For demo, we'll just set success to true if it contains "inkor"
        const isValid = result.content.toLowerCase().includes("inkor");
        setScanSuccess(isValid);
        
        toast({
          title: isValid ? "Código válido!" : "Código inválido",
          description: isValid 
            ? "O código foi escaneado com sucesso." 
            : "Este código não é válido para o sistema.",
          variant: isValid ? "default" : "destructive",
        });
      } else {
        setScanSuccess(false);
        toast({
          title: "Escaneamento cancelado",
          description: "O escaneamento foi cancelado ou não detectou um código.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao escanear:", error);
      toast({
        title: "Erro no escaneamento",
        description: "Não foi possível acessar a câmera ou escanear o código.",
        variant: "destructive",
      });
      setScanSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-6 w-6" />
              Scanner QR Code
            </CardTitle>
            <CardDescription>
              Escaneie QR codes para check-in ou acessar conteúdo especial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
              {scanResult ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-full inline-flex items-center justify-center ${
                    scanSuccess ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  }`}>
                    {scanSuccess ? (
                      <Check className="h-10 w-10" />
                    ) : (
                      <AlertCircle className="h-10 w-10" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {scanSuccess ? "Código válido!" : "Código inválido"}
                  </p>
                  <div className="bg-muted p-3 rounded-md overflow-x-auto">
                    <code className="text-xs">{scanResult}</code>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-full bg-muted inline-flex items-center justify-center">
                    <Camera className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nenhum código escaneado ainda. Clique no botão abaixo para iniciar.
                  </p>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleScan}
              disabled={isLoading}
              className="w-full py-6"
            >
              {isLoading ? (
                "Escaneando..."
              ) : (
                <>
                  <VibrateIcon className="mr-2 h-5 w-5" />
                  Escanear QR Code
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Posicione o QR code no centro da câmera para escaneá-lo automaticamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Scanner;
