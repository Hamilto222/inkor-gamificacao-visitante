
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface User {
  matricula: string;
  nome: string;
  role: "admin" | "user";
  ativo: boolean;
  senha?: string;
}

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Erro ao recuperar usuário", error);
        localStorage.removeItem("currentUser");
      }
    }
    setLoading(false);
  }, []);

  const login = (matricula: string, senha: string): boolean => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u: User) => u.matricula === matricula && u.senha === senha);
    
    if (user) {
      if (!user.ativo) {
        toast({
          title: "Usuário desativado",
          description: "Sua conta está inativa. Contate o administrador.",
          variant: "destructive",
        });
        return false;
      }
      
      localStorage.setItem("currentUser", JSON.stringify(user));
      setCurrentUser(user);
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${user.nome || matricula}!`,
      });
      return true;
    }
    
    return false;
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate("/login");
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === "admin";

  return {
    currentUser,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    loading
  };
};
