
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import FactoryMap from "./pages/FactoryMap";
import Store from "./pages/Store";
import Missions from "./pages/Missions";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Scanner from "./pages/Scanner";
import Ranking from "./pages/Ranking";
import { AuthGuard } from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  useEffect(() => {
    // Check for authentication on app load and on changes
    const checkAuth = () => {
      const user = localStorage.getItem("currentUser");
      setIsAuthenticated(!!user);
    };
    
    // Initial check
    checkAuth();
    
    // Set up event listener for storage changes (for multi-tab support)
    window.addEventListener("storage", checkAuth);
    
    // Initialize default admin user if none exists
    const users = localStorage.getItem("users");
    if (!users) {
      const defaultAdmin = {
        matricula: "admin",
        nome: "Administrador",
        role: "admin",
        senha: "123",
        ativo: true,
      };
      localStorage.setItem("users", JSON.stringify([defaultAdmin]));
    }
    
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
            <Route path="/mapa" element={<AuthGuard><FactoryMap /></AuthGuard>} />
            <Route path="/loja" element={<AuthGuard><Store /></AuthGuard>} />
            <Route path="/missoes" element={<AuthGuard><Missions /></AuthGuard>} />
            <Route path="/scanner" element={<AuthGuard><Scanner /></AuthGuard>} />
            <Route path="/ranking" element={<AuthGuard><Ranking /></AuthGuard>} />
            <Route path="/admin" element={<Admin />} /> {/* AuthGuard is already in Admin component with role restriction */}
            
            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
