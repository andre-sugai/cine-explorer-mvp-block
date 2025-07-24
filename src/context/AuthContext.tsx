import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextData {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: getErrorMessage(error.message),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao Cine Explorer.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o login.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: getErrorMessage(error.message),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Conta criada com sucesso!",
          description: "Você pode fazer login imediatamente.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o cadastro.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao desconectar.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast({
          title: "Erro na recuperação",
          description: getErrorMessage(error.message),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para redefinir sua senha.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante a recuperação de senha.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'Invalid login credentials':
        return 'Email ou senha incorretos.';
      case 'User already registered':
        return 'Este email já está cadastrado.';
      case 'Password should be at least 6 characters':
        return 'A senha deve ter pelo menos 6 caracteres.';
      case 'Invalid email':
        return 'Email inválido.';
      case 'Signup is disabled':
        return 'Cadastro está desabilitado no momento.';
      case 'Email not confirmed':
        return 'Email não confirmado. Verifique sua caixa de entrada.';
      default:
        return error;
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}