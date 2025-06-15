
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: any;
}

const CustomerManagement = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const handleSaveCustomer = () => {
    if (editingCustomer) {
      toast({
        title: "Cliente atualizado",
        description: "Cliente atualizado com sucesso.",
      });
    } else {
      toast({
        title: "Cliente criado",
        description: "Novo cliente criado com sucesso.",
      });
    }
    setIsDialogOpen(false);
    setEditingCustomer(null);
    setNewCustomer({
      name: '',
      phone: '',
      email: '',
      address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: ''
      }
    });
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: ''
      }
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers(customers.filter(c => c.id !== customerId));
    toast({
      title: "Cliente excluído",
      description: "Cliente excluído com sucesso.",
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Gerenciamento de Clientes</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="street">Rua</Label>
                      <Input
                        id="street"
                        value={newCustomer.address.street}
                        onChange={(e) => setNewCustomer({
                          ...newCustomer,
                          address: {...newCustomer.address, street: e.target.value}
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        value={newCustomer.address.number}
                        onChange={(e) => setNewCustomer({
                          ...newCustomer,
                          address: {...newCustomer.address, number: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={newCustomer.address.neighborhood}
                        onChange={(e) => setNewCustomer({
                          ...newCustomer,
                          address: {...newCustomer.address, neighborhood: e.target.value}
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={newCustomer.address.city}
                        onChange={(e) => setNewCustomer({
                          ...newCustomer,
                          address: {...newCustomer.address, city: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveCustomer}>
                    {editingCustomer ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lista de Clientes</CardTitle>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nome</th>
                      <th className="text-left p-2">Telefone</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Cidade</th>
                      <th className="text-left p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b">
                        <td className="p-2">{customer.name}</td>
                        <td className="p-2">{customer.phone}</td>
                        <td className="p-2">{customer.email || '-'}</td>
                        <td className="p-2">{customer.address?.city || '-'}</td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCustomer(customer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCustomer(customer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerManagement;
