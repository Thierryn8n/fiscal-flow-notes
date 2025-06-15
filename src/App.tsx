
import { Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import AuthChecker from './components/AuthChecker';
import PrintMonitor from "@/components/PrintMonitor";
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import RecoverPassword from './components/RecoverPassword'

import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";

// Create a client
const queryClient = new QueryClient();

function App() {
  const location = useLocation();
  const isEcommercePage = 
    location.pathname.startsWith('/ecommerce') || 
    location.pathname.startsWith('/checkout') || 
    location.pathname.startsWith('/products/');

  return (
    <AuthProvider>
      <AuthChecker />
      <CartProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
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
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/recover-password" element={<RecoverPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
              
            {/* Monitor de impressão - apenas exibido em desktop e fora de páginas de ecommerce */}
            {!isEcommercePage && <PrintMonitor />}
          </TooltipProvider>
        </QueryClientProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
