
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { getFiscalNotes, updateNoteStatus, deleteFiscalNote } from '@/services/notesService';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface FiscalNote {
  id: string;
  note_number: string;
  date: string;
  customer_data: any;
  products: any[];
  total_value: number;
  payment_data: any;
  status: 'draft' | 'issued' | 'printed' | 'canceled';
  seller_name?: string;
  created_at: string;
  updated_at: string;
}

const NotesManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<FiscalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedNote, setSelectedNote] = useState<FiscalNote | null>(null);

  const loadNotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getFiscalNotes(user.id);
      setNotes(data || []);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar notas fiscais.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [user]);

  const handleStatusChange = async (noteId: string, newStatus: string) => {
    try {
      await updateNoteStatus(noteId, newStatus);
      await loadNotes();
      
      toast({
        title: "Sucesso",
        description: "Status da nota atualizado com sucesso!",
        variant: "success"
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da nota.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta nota fiscal?')) return;
    
    try {
      await deleteFiscalNote(noteId);
      await loadNotes();
      
      toast({
        title: "Sucesso",
        description: "Nota fiscal excluída com sucesso!",
        variant: "success"
      });
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir nota fiscal.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'destructive'; className?: string } } = {
      draft: { label: 'Rascunho', variant: 'secondary' },
      issued: { label: 'Emitida', variant: 'default' },
      printed: { label: 'Impressa', variant: 'default', className: 'bg-green-600 text-white hover:bg-green-700' },
      canceled: { label: 'Cancelada', variant: 'destructive' }
    };

    const statusInfo = statusMap[status] || statusMap.draft;
    return <Badge variant={statusInfo.variant} className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.note_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.customer_data?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.seller_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || note.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalValue = filteredNotes.reduce((sum, note) => sum + Number(note.total_value), 0);
  const statusCounts = notes.reduce((acc, note) => {
    acc[note.status] = (acc[note.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notas Fiscais</h1>
          <p className="text-gray-600">Gerencie suas notas fiscais</p>
        </div>
        <Link to="/new-note">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Nota
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Notas</p>
                <p className="text-2xl font-bold">{notes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(totalValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Emitidas</p>
                <p className="text-2xl font-bold">{statusCounts.issued || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Impressas</p>
                <p className="text-2xl font-bold">{statusCounts.printed || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por número, cliente ou vendedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="issued">Emitida</SelectItem>
                  <SelectItem value="printed">Impressa</SelectItem>
                  <SelectItem value="canceled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Notas Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma nota fiscal encontrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">{note.note_number}</TableCell>
                    <TableCell>
                      {new Date(note.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{note.customer_data?.name || 'N/A'}</TableCell>
                    <TableCell>{note.seller_name || 'N/A'}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(note.total_value)}
                    </TableCell>
                    <TableCell>{getStatusBadge(note.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedNote(note)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes da Nota Fiscal</DialogTitle>
                            </DialogHeader>
                            {selectedNote && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="font-semibold">Número:</p>
                                    <p>{selectedNote.note_number}</p>
                                  </div>
                                  <div>
                                    <p className="font-semibold">Data:</p>
                                    <p>{new Date(selectedNote.date).toLocaleDateString('pt-BR')}</p>
                                  </div>
                                  <div>
                                    <p className="font-semibold">Cliente:</p>
                                    <p>{selectedNote.customer_data?.name || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="font-semibold">Vendedor:</p>
                                    <p>{selectedNote.seller_name || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="font-semibold">Valor Total:</p>
                                    <p className="text-xl font-bold text-green-600">
                                      {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                      }).format(selectedNote.total_value)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-semibold">Status:</p>
                                    {getStatusBadge(selectedNote.status)}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Select
                          value={note.status}
                          onValueChange={(value) => handleStatusChange(note.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Rascunho</SelectItem>
                            <SelectItem value="issued">Emitida</SelectItem>
                            <SelectItem value="printed">Impressa</SelectItem>
                            <SelectItem value="canceled">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotesManagement;
