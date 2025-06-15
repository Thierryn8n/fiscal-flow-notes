
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
  user_email?: string;
}

const UserRolesPage = () => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    user_email: '',
    role: 'user' as 'admin' | 'moderator' | 'user'
  });

  const handleSaveRole = () => {
    toast({
      title: "Papel atribuído",
      description: "Papel do usuário atribuído com sucesso.",
    });
    setIsDialogOpen(false);
    setNewRole({
      user_email: '',
      role: 'user'
    });
  };

  const handleDeleteRole = (roleId: string) => {
    setUserRoles(userRoles.filter(r => r.id !== roleId));
    toast({
      title: "Papel removido",
      description: "Papel do usuário removido com sucesso.",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'warning';
      case 'user':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'moderator':
        return 'Moderador';
      case 'user':
        return 'Usuário';
      default:
        return role;
    }
  };

  const filteredRoles = userRoles.filter(role =>
    role.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Gerenciamento de Papéis</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Atribuir Papel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Atribuir Papel ao Usuário</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="user_email">Email do Usuário</Label>
                    <Input
                      id="user_email"
                      type="email"
                      value={newRole.user_email}
                      onChange={(e) => setNewRole({...newRole, user_email: e.target.value})}
                      placeholder="usuario@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Papel</Label>
                    <Select
                      value={newRole.role}
                      onValueChange={(value: 'admin' | 'moderator' | 'user') => 
                        setNewRole({...newRole, role: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um papel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="moderator">Moderador</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveRole}>
                    Atribuir
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lista de Papéis</CardTitle>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Buscar por email ou papel..."
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
                      <th className="text-left p-2">Email do Usuário</th>
                      <th className="text-left p-2">Papel</th>
                      <th className="text-left p-2">Atribuído em</th>
                      <th className="text-left p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.map((role) => (
                      <tr key={role.id} className="border-b">
                        <td className="p-2">{role.user_email || 'Email não disponível'}</td>
                        <td className="p-2">
                          <Badge variant={getRoleColor(role.role) as any}>
                            {getRoleText(role.role)}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {new Date(role.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRole(role.id)}
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

export default UserRolesPage;
