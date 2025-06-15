
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

interface Seller {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  active: boolean;
  created_at: string;
}

const SellersPage = () => {
  const { user } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [newSeller, setNewSeller] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleSaveSeller = () => {
    if (editingSeller) {
      toast({
        title: "Vendedor atualizado",
        description: "Vendedor atualizado com sucesso.",
      });
    } else {
      toast({
        title: "Vendedor criado",
        description: "Novo vendedor criado com sucesso.",
      });
    }
    setIsDialogOpen(false);
    setEditingSeller(null);
    setNewSeller({
      full_name: '',
      email: '',
      phone: '',
      password: ''
    });
  };

  const handleEditSeller = (seller: Seller) => {
    setEditingSeller(seller);
    setNewSeller({
      full_name: seller.full_name,
      email: seller.email,
      phone: seller.phone,
      password: ''
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = (sellerId: string) => {
    setSellers(sellers.map(seller => 
      seller.id === sellerId 
        ? { ...seller, active: !seller.active }
        : seller
    ));
    toast({
      title: "Status atualizado",
      description: "Status do vendedor atualizado com sucesso.",
    });
  };

  const handleDeleteSeller = (sellerId: string) => {
    setSellers(sellers.filter(s => s.id !== sellerId));
    toast({
      title: "Vendedor excluído",
      description: "Vendedor excluído com sucesso.",
    });
  };

  const filteredSellers = sellers.filter(seller =>
    seller.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Gerenciamento de Vendedores</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Vendedor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSeller ? 'Editar Vendedor' : 'Novo Vendedor'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={newSeller.full_name}
                      onChange={(e) => setNewSeller({...newSeller, full_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newSeller.email}
                      onChange={(e) => setNewSeller({...newSeller, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={newSeller.phone}
                      onChange={(e) => setNewSeller({...newSeller, phone: e.target.value})}
                    />
                  </div>
                  {!editingSeller && (
                    <div>
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newSeller.password}
                        onChange={(e) => setNewSeller({...newSeller, password: e.target.value})}
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveSeller}>
                    {editingSeller ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lista de Vendedores</CardTitle>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Buscar vendedores..."
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
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Telefone</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Criado em</th>
                      <th className="text-left p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSellers.map((seller) => (
                      <tr key={seller.id} className="border-b">
                        <td className="p-2">{seller.full_name}</td>
                        <td className="p-2">{seller.email}</td>
                        <td className="p-2">{seller.phone}</td>
                        <td className="p-2">
                          <Badge variant={seller.active ? "default" : "secondary"}>
                            {seller.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {new Date(seller.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSeller(seller)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(seller.id)}
                            >
                              {seller.active ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSeller(seller.id)}
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

export default SellersPage;
