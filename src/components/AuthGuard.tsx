
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const AuthGuard = ({ children, allowedRoles = [] }: AuthGuardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    
    if (!currentUserStr) {
      // User not logged in, redirect to login
      toast({
        title: "Acesso restrito",
        description: "Faça login para acessar esta página",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    // User is logged in
    if (allowedRoles.length > 0) {
      // Check role restrictions
      const currentUser = JSON.parse(currentUserStr);
      if (!allowedRoles.includes(currentUser.role)) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página",
          variant: "destructive",
        });
        navigate('/');
      }
    }
  }, [navigate, toast, allowedRoles]);
  
  return <>{children}</>;
};
