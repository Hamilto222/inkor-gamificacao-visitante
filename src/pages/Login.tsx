
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Lock, User } from "lucide-react";

const Login = () => {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize the admin user when the component mounts
  useEffect(() => {
    // Garantir que o localStorage esteja disponível (ambiente browser)
    if (typeof window !== "undefined") {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Check if admin user already exists
      const adminExists = users.some((user: any) => user.matricula === "admin");
      
      if (!adminExists) {
        // Create the admin user with password "123"
        const adminUser = {
          matricula: "admin",
          nome: "Administrador",
          role: "admin",
          senha: "123",
          ativo: true,
        };
        
        users.push(adminUser);
        localStorage.setItem("users", JSON.stringify(users));
        console.log("Admin user created with password '123'");
      } else {
        console.log("Admin user already exists");
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Tentando login com:", matricula, senha);
    
    // Simulate authentication (replace with actual authentication logic)
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    console.log("Usuários cadastrados:", users);
    
    const user = users.find((u: any) => u.matricula === matricula && u.senha === senha);
    
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${user.nome || matricula}!`,
      });
      
      // Redirect based on user role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      toast({
        title: "Erro de autenticação",
        description: "Matrícula ou senha incorretos.",
        variant: "destructive",
      });
    }
  };

  const handleFirstAccess = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (senha !== confirmSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }
    
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const existingUser = users.find((u: any) => u.matricula === matricula);
    
    if (existingUser && existingUser.senha) {
      toast({
        title: "Usuário já existe",
        description: "Esta matrícula já possui uma senha cadastrada.",
        variant: "destructive",
      });
      return;
    }
    
    if (!existingUser) {
      // Create a new user if one doesn't exist in the system
      users.push({
        matricula,
        senha,
        role: "user", // Default role
        nome: "", // Will be set by admin later
        ativo: true
      });
      localStorage.setItem("users", JSON.stringify(users));
      
      toast({
        title: "Cadastro realizado",
        description: "Sua senha foi cadastrada com sucesso. Você já pode fazer login.",
      });
      
      setIsFirstAccess(false);
    } else {
      // Update existing user's password
      existingUser.senha = senha;
      localStorage.setItem("users", JSON.stringify(users));
      
      toast({
        title: "Senha cadastrada",
        description: "Sua senha foi cadastrada com sucesso. Você já pode fazer login.",
      });
      
      setIsFirstAccess(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <Card className="w-full max-w-md glass-card shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold text-primary">Inkor Tour</CardTitle>
          <CardDescription>
            {isFirstAccess 
              ? "Cadastre sua senha para o primeiro acesso" 
              : "Faça login com sua matrícula e senha"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue={isFirstAccess ? "primeiro-acesso" : "login"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="login" 
                onClick={() => setIsFirstAccess(false)}
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="primeiro-acesso" 
                onClick={() => setIsFirstAccess(true)}
              >
                Primeiro Acesso
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="matricula"
                      type="text"
                      placeholder="Digite sua matrícula"
                      className="pl-10"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="senha"
                      type="password"
                      placeholder="Digite sua senha"
                      className="pl-10"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">Entrar</Button>
              </form>
            </TabsContent>
            
            <TabsContent value="primeiro-acesso">
              <form onSubmit={handleFirstAccess} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="matricula-novo">Matrícula</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="matricula-novo"
                      type="text"
                      placeholder="Digite sua matrícula"
                      className="pl-10"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="senha-nova">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="senha-nova"
                      type="password"
                      placeholder="Crie uma senha"
                      className="pl-10"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmar-senha">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmar-senha"
                      type="password"
                      placeholder="Confirme sua senha"
                      className="pl-10"
                      value={confirmSenha}
                      onChange={(e) => setConfirmSenha(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">Cadastrar Senha</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Inkor</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
