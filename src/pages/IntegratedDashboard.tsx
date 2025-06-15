
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  NotesService, 
  ProductsService, 
  CustomersService, 
  SellersService, 
  OrdersService,
  EcommerceService,
  UserRolesService,
  PrintService
} from '@/services';
import { 
  ShoppingCart, 
  Users, 
  FileText, 
  Package, 
  TrendingUp, 
  Printer,
  Store,
  UserCheck
} from 'lucide-react';

const IntegratedDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    notes: { total: 0, recent: [] },
    products: { total: 0, recent: [] },
    customers: { total: 0, recent: [] },
    sellers: { total: 0, active: 0 },
    orders: { total: 0, byStatus: {} },
    printRequests: { pending: 0, completed: 0 },
    ecommerce: { enabled: false, categories: 0 },
    userRoles: []
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        notesData,
        productsData, 
        customersData,
        sellersData,
        ordersData,
        printRequestsData,
        ecommerceSettings,
        categoriesData,
        userRoles
      ] = await Promise.all([
        NotesService.getFiscalNotes(user?.id || '', 1, 5),
        ProductsService.getProducts(user?.id || '', 1, 5),
        CustomersService.searchCustomers(user?.id || '', ''),
        SellersService.getSellers(user?.id || ''),
        OrdersService.getOrders(user?.id || ''),
        NotesService.getPrintRequests(user?.id || ''),
        EcommerceService.getEcommerceSettings(user?.id),
        EcommerceService.getCategories(),
        UserRolesService.getUserRoles(user?.id || '')
      ]);

      setDashboardData({
        notes: {
          total: notesData.count,
          recent: notesData.data.slice(0, 5)
        },
        products: {
          total: productsData.count,
          recent: productsData.data.slice(0, 5)
        },
        customers: {
          total: customersData.length,
          recent: customersData.slice(0, 5)
        },
        sellers: {
          total: sellersData.length,
          active: sellersData.filter(s => s.active).length
        },
        orders: {
          total: ordersData.length,
          byStatus: ordersData.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
          }, {})
        },
        printRequests: {
          pending: printRequestsData.filter(p => p.status === 'pending').length,
          completed: printRequestsData.filter(p => p.status === 'completed').length
        },
        ecommerce: {
          enabled: ecommerceSettings?.store_name ? true : false,
          categories: categoriesData.length
        },
        userRoles
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4">Carregando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard Integrado</h1>
          <Button onClick={loadDashboardData}>
            Atualizar Dados
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notas Fiscais</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.notes.total}</div>
              <p className="text-xs text-muted-foreground">Total de notas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.products.total}</div>
              <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.customers.total}</div>
              <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.sellers.active}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.sellers.active} de {dashboardData.sellers.total} ativos
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="printing">Impressão</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notas Fiscais Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData.notes.recent.length > 0 ? (
                    <div className="space-y-2">
                      {dashboardData.notes.recent.map((note) => (
                        <div key={note.id} className="flex justify-between items-center">
                          <span className="text-sm">{note.note_number}</span>
                          <Badge variant={note.status === 'printed' ? 'default' : 'secondary'}>
                            {note.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nenhuma nota fiscal encontrada</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Produtos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData.products.recent.length > 0 ? (
                    <div className="space-y-2">
                      {dashboardData.products.recent.map((product) => (
                        <div key={product.id} className="flex justify-between items-center">
                          <span className="text-sm">{product.name}</span>
                          <span className="text-sm font-medium">
                            R$ {product.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nenhum produto encontrado</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ecommerce">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Status do E-commerce
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={dashboardData.ecommerce.enabled ? 'default' : 'secondary'}>
                    {dashboardData.ecommerce.enabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.ecommerce.categories}</div>
                  <p className="text-xs text-muted-foreground">Categorias criadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Roles do Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData.userRoles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {dashboardData.userRoles.map((role) => (
                        <Badge key={role.id} variant="outline">
                          {role.role}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma role atribuída</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Status dos Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(dashboardData.orders.byStatus).map(([status, count]) => (
                    <div key={status} className="text-center">
                      <div className="text-2xl font-bold">{count}</div>
                      <p className="text-sm text-muted-foreground capitalize">{status}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="printing">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Impressões Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.printRequests.pending}</div>
                  <p className="text-xs text-muted-foreground">Aguardando impressão</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impressões Concluídas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.printRequests.completed}</div>
                  <p className="text-xs text-muted-foreground">Impressões finalizadas</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default IntegratedDashboard;
