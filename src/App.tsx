
import { Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import AuthChecker from './components/AuthChecker';
import PrintMonitor from "@/components/PrintMonitor";

// Auth pages
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import RecoverPassword from './components/RecoverPassword'

// Main pages
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import ProductManagement from "./pages/ProductManagement";
import NewNote from "./pages/NewNote";
import NotesManagement from "./pages/NotesManagement";
import ViewNote from "./pages/ViewNote";
import Settings from "./pages/Settings";
import ConfiguracoesMelhoradas from "./pages/ConfiguracoesMelhoradas";
import CustomerManagement from "./pages/CustomerManagement";
import SellersManagement from "./pages/SellersManagement";
import SellersPage from "./pages/SellersPage";
import PrintRequestsPage from "./pages/PrintRequestsPage";
import UserRolesPage from "./pages/UserRolesPage";
import OrdersKanbanPage from "./pages/OrdersKanbanPage";

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
              <Route 
                path="/products" 
                element={
                  <ProtectedRoute>
                    <ProductManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customers" 
                element={
                  <ProtectedRoute>
                    <CustomerManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sellers" 
                element={
                  <ProtectedRoute>
                    <SellersPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sellers-management" 
                element={
                  <ProtectedRoute>
                    <SellersManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/new-note" 
                element={
                  <ProtectedRoute>
                    <NewNote />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notes" 
                element={
                  <ProtectedRoute>
                    <NotesManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notes/:id" 
                element={
                  <ProtectedRoute>
                    <ViewNote />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/print-requests" 
                element={
                  <ProtectedRoute>
                    <PrintRequestsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/user-roles" 
                element={
                  <ProtectedRoute>
                    <UserRolesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders-kanban" 
                element={
                  <ProtectedRoute>
                    <OrdersKanbanPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/configuracoes" 
                element={
                  <ProtectedRoute>
                    <ConfiguracoesMelhoradas />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/recover-password" element={<RecoverPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
              
            {!isEcommercePage && <PrintMonitor />}
          </TooltipProvider>
        </QueryClientProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
