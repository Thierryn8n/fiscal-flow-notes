
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "@/App";
import ProtectedRoute from "@/components/ProtectedRoute";

// Importações básicas
import DashboardPage from "@/pages/Dashboard";
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
  // Rotas do Sistema Principal
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { 
        path: "dashboard", 
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute> 
      },
    ],
  },

  // Rotas de Autenticação
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
]); 
