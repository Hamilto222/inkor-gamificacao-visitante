
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

const NotFound = () => {
  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
        <Construction className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-4xl font-bold mb-4">Em Construção</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Esta página está sendo desenvolvida
        </p>
        <Button asChild>
          <a href="/">Voltar ao Início</a>
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;

