
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";

const FactoryMap = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Mapa da Fábrica</h1>
          <p className="text-muted-foreground">
            Explore as diferentes áreas da fábrica e descubra todos os pontos de interesse
          </p>
        </header>
        
        <Card className="p-4 overflow-auto bg-white">
          <img 
            src="/lovable-uploads/10ae228f-9aea-4658-b5ed-49b29622dabf.png" 
            alt="Mapa da Fábrica Inkor" 
            className="w-full h-auto max-w-[1200px] mx-auto"
          />
        </Card>
      </div>
    </Layout>
  );
};

export default FactoryMap;
