
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NewNote from "./pages/NewNote";
import Print from "./pages/Print";
import NotFound from "./pages/NotFound";
import Products from './pages/Products';

// Create auth context with proper typing
export const AuthContext = createContext<{
  user: User | null;
  session: Session | null;
}>({
  user: null,
  session: null,
});

// Protected route component
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    // Still checking authentication
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

// Define App as a proper React functional component
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const queryClient = new QueryClient();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session }}>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notes/new" 
              element={
                <ProtectedRoute>
                  <NewNote />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/print" 
              element={
                <ProtectedRoute>
                  <Print />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/products" 
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
};

export default App;
