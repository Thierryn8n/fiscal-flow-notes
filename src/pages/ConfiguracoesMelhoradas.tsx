
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

const ConfiguracoesMelhoradas = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    printerName: '',
    autoPrint: false
  });

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram salvas com sucesso.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Configurações</h1>
          
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input
                      id="companyName"
                      value={settings.companyName}
                      onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyPhone">Telefone</Label>
                    <Input
                      id="companyPhone"
                      value={settings.companyPhone}
                      onChange={(e) => setSettings({...settings, companyPhone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => setSettings({...settings, companyEmail: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="companyAddress">Endereço</Label>
                  <Textarea
                    id="companyAddress"
                    value={settings.companyAddress}
                    onChange={(e) => setSettings({...settings, companyAddress: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações de Impressão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="printerName">Nome da Impressora</Label>
                  <Input
                    id="printerName"
                    value={settings.printerName}
                    onChange={(e) => setSettings({...settings, printerName: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Salvar Configurações</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConfiguracoesMelhoradas;
