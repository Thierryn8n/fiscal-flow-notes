
import React, { ReactNode, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, Printer, LogOut, Menu, PlusCircle, Package } from 'lucide-react';
import Logo from './ui/Logo';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check for authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/');
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Logout realizado com sucesso',
        description: 'Você foi desconectado do sistema.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Erro ao fazer logout',
        description: 'Ocorreu um erro ao tentar desconectar.',
        variant: 'destructive',
      });
    }
  };

  // Check if the current route matches the menu item
  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar className="border-r border-gray-200 shadow-md">
          <SidebarHeader>
            <div className="flex items-center px-4 py-3 border-b border-gray-200">
              <Logo />
              <h1 className="ml-3 text-xl font-cascadia hidden md:block">Fiscal Flow Notes</h1>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu className="p-2">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive('/dashboard')}
                  tooltip="Início"
                  className="rounded-lg hover:bg-gray-100"
                >
                  <Link to="/dashboard">
                    <Home size={18} className="text-fiscal-green-600" />
                    <span>Início</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive('/products')}
                  tooltip="Produtos"
                  className="rounded-lg hover:bg-gray-100"
                >
                  <Link to="/products">
                    <Package size={18} className="text-fiscal-green-600" />
                    <span>Produtos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive('/notes/new')}
                  tooltip="Nova Nota"
                  className="rounded-lg hover:bg-gray-100"
                >
                  <Link to="/notes/new">
                    <PlusCircle size={18} className="text-fiscal-green-600" />
                    <span>Nova Nota</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive('/print')}
                  tooltip="Impressão"
                  className="rounded-lg hover:bg-gray-100"
                >
                  <Link to="/print">
                    <Printer size={18} className="text-fiscal-green-600" />
                    <span>Impressão</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="border-t border-gray-200">
            <SidebarMenu className="p-2">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  tooltip="Sair"
                  className="rounded-lg hover:bg-gray-100"
                >
                  <LogOut size={18} className="text-red-500" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex flex-col flex-1">
          <header className="bg-black text-white py-2 px-4 md:hidden flex items-center">
            <SidebarTrigger className="mr-2 rounded-full hover:bg-gray-800 p-1 transition-colors" />
            <Logo />
            <h1 className="ml-3 text-xl font-cascadia">Fiscal Flow Notes</h1>
          </header>
          
          <SidebarInset className="rounded-tl-2xl">
            <main className="flex-grow container mx-auto py-6 px-4">
              {children}
            </main>
            
            <footer className="bg-black text-white py-4 text-center">
              <div className="container mx-auto">
                <p className="text-sm">
                  © {new Date().getFullYear()} Fiscal Flow Notes. Todos os direitos reservados.
                </p>
              </div>
            </footer>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
