
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

interface Order {
  id: string;
  product_name: string;
  customer_name: string;
  seller_name: string;
  status: 'entrada' | 'preparando' | 'saiu_para_entrega' | 'cancelado' | 'pendente';
  notes?: string;
  created_at: string;
}

const OrdersKanbanPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    product_name: '',
    customer_name: '',
    seller_name: '',
    status: 'entrada' as Order['status'],
    notes: ''
  });

  const statusConfig = {
    entrada: {
      title: 'Entrada',
      icon: Package,
      color: 'bg-blue-100 border-blue-300',
      badge: 'default'
    },
    preparando: {
      title: 'Preparando',
      icon: Clock,
      color: 'bg-yellow-100 border-yellow-300',
      badge: 'warning'
    },
    saiu_para_entrega: {
      title: 'Saiu para Entrega',
      icon: Truck,
      color: 'bg-purple-100 border-purple-300',
      badge: 'secondary'
    },
    cancelado: {
      title: 'Cancelado',
      icon: XCircle,
      color: 'bg-red-100 border-red-300',
      badge: 'destructive'
    },
    pendente: {
      title: 'Pendente',
      icon: CheckCircle,
      color: 'bg-green-100 border-green-300',
      badge: 'default'
    }
  };

  const handleCreateOrder = () => {
    const order: Order = {
      id: Date.now().toString(),
      ...newOrder,
      created_at: new Date().toISOString()
    };
    setOrders([...orders, order]);
    setIsDialogOpen(false);
    setNewOrder({
      product_name: '',
      customer_name: '',
      seller_name: '',
      status: 'entrada',
      notes: ''
    });
    toast({
      title: "Pedido criado",
      description: "Novo pedido criado com sucesso.",
    });
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus }
        : order
    ));
    toast({
      title: "Status atualizado",
      description: "Status do pedido atualizado com sucesso.",
    });
  };

  const getOrdersByStatus = (status: Order['status']) => {
    return orders.filter(order => order.status === status);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Kanban de Pedidos</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Pedido
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Pedido</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="product_name">Nome do Produto</Label>
                    <Input
                      id="product_name"
                      value={newOrder.product_name}
                      onChange={(e) => setNewOrder({...newOrder, product_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_name">Nome do Cliente</Label>
                    <Input
                      id="customer_name"
                      value={newOrder.customer_name}
                      onChange={(e) => setNewOrder({...newOrder, customer_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="seller_name">Nome do Vendedor</Label>
                    <Input
                      id="seller_name"
                      value={newOrder.seller_name}
                      onChange={(e) => setNewOrder({...newOrder, seller_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={newOrder.notes}
                      onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateOrder}>
                    Criar Pedido
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {Object.entries(statusConfig).map(([status, config]) => {
              const statusOrders = getOrdersByStatus(status as Order['status']);
              const Icon = config.icon;

              return (
                <Card key={status} className={`${config.color} h-fit`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Icon className="h-4 w-4" />
                      {config.title}
                      <Badge variant="outline" className="ml-auto">
                        {statusOrders.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {statusOrders.map((order) => (
                      <Card key={order.id} className="bg-white shadow-sm">
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">{order.product_name}</h4>
                            <p className="text-xs text-gray-600">Cliente: {order.customer_name}</p>
                            <p className="text-xs text-gray-600">Vendedor: {order.seller_name}</p>
                            {order.notes && (
                              <p className="text-xs text-gray-500 italic">{order.notes}</p>
                            )}
                            <div className="flex gap-1 mt-2">
                              <Select
                                value={order.status}
                                onValueChange={(value: Order['status']) => 
                                  handleStatusChange(order.id, value)
                                }
                              >
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(statusConfig).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                      {value.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrdersKanbanPage;
