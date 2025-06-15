
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  UserCheck,
  Printer,
  Shield,
  Kanban,
  PlusCircle
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Produtos', href: '/products', icon: Package },
    { name: 'Clientes', href: '/customers', icon: Users },
    { name: 'Vendedores', href: '/sellers', icon: UserCheck },
    { name: 'Nova Nota', href: '/new-note', icon: PlusCircle },
    { name: 'Notas Fiscais', href: '/notes', icon: FileText },
    { name: 'Pedidos Kanban', href: '/orders-kanban', icon: Kanban },
    { name: 'Impressões', href: '/print-requests', icon: Printer },
    { name: 'Papéis de Usuário', href: '/user-roles', icon: Shield },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b">
          <h1 className="text-xl font-bold text-gray-900">Fiscal Flow</h1>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="border-t pt-4">
            <div className="flex items-center mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
