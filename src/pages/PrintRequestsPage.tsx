
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Printer, Search, Eye, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

interface PrintRequest {
  id: string;
  note_id: string;
  status: 'pending' | 'printed' | 'error';
  device_id: string;
  created_at: string;
  printed_at?: string;
  error_message?: string;
  note_data: any;
}

const PrintRequestsPage = () => {
  const { user } = useAuth();
  const [printRequests, setPrintRequests] = useState<PrintRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRetryPrint = (requestId: string) => {
    setPrintRequests(requests => 
      requests.map(req => 
        req.id === requestId 
          ? { ...req, status: 'pending' as const }
          : req
      )
    );
    toast({
      title: "Impressão reenviada",
      description: "A solicitação de impressão foi reenviada.",
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simular carregamento
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Atualizado",
        description: "Lista de solicitações atualizada.",
      });
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'printed':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'printed':
        return 'Impresso';
      case 'error':
        return 'Erro';
      default:
        return status;
    }
  };

  const filteredRequests = printRequests.filter(request =>
    request.note_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.device_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Solicitações de Impressão</h1>
            <Button onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Histórico de Impressões</CardTitle>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Buscar por nota ou dispositivo..."
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
                      <th className="text-left p-2">ID da Nota</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Dispositivo</th>
                      <th className="text-left p-2">Criado em</th>
                      <th className="text-left p-2">Impresso em</th>
                      <th className="text-left p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="border-b">
                        <td className="p-2 font-mono">{request.note_id}</td>
                        <td className="p-2">
                          <Badge variant={getStatusColor(request.status) as any}>
                            {getStatusText(request.status)}
                          </Badge>
                        </td>
                        <td className="p-2">{request.device_id}</td>
                        <td className="p-2">
                          {new Date(request.created_at).toLocaleString()}
                        </td>
                        <td className="p-2">
                          {request.printed_at 
                            ? new Date(request.printed_at).toLocaleString()
                            : '-'
                          }
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {request.status === 'error' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRetryPrint(request.id)}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            )}
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

export default PrintRequestsPage;
