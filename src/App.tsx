
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
        senha: "admin",
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
            
            {/* Protected routes - will be handled by AuthGuard component */}
            <Route path="/" element={<Index />} />
            <Route path="/mapa" element={<FactoryMap />} />
            <Route path="/loja" element={<Store />} />
            <Route path="/missoes" element={<Missions />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/admin" element={<Admin />} />
            
            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
