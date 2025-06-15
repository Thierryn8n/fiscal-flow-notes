
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const ConfiguracoesMelhoradas = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    company: {
      name: '',
      cnpj: '',
      address: '',
      phone: '',
      email: ''
    },
    printer: {
      auto_print: false,
      default_printer: ''
    },
    ecommerce: {
      enabled: false,
      admin_panel_enabled: false
    }
  });

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar configurações:', error);
        return;
      }

      if (data) {
        setSettings({
          company: data.company_data || {},
          printer: data.printer_settings || {},
          ecommerce: data.ecommerce_settings || {}
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          company_data: settings.company,
          printer_settings: settings.printer,
          ecommerce_settings: settings.ecommerce,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Configurações</h1>
          
          <Tabs defaultValue="company" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="company">Empresa</TabsTrigger>
              <TabsTrigger value="printer">Impressão</TabsTrigger>
              <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
            </TabsList>

            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Dados da Empresa</CardTitle>
                  <CardDescription>Configure as informações da sua empresa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="company-name">Nome da Empresa</Label>
                    <Input
                      id="company-name"
                      value={settings.company.name || ''}
                      onChange={(e) => updateSetting('company', 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-cnpj">CNPJ</Label>
                    <Input
                      id="company-cnpj"
                      value={settings.company.cnpj || ''}
                      onChange={(e) => updateSetting('company', 'cnpj', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-address">Endereço</Label>
                    <Textarea
                      id="company-address"
                      value={settings.company.address || ''}
                      onChange={(e) => updateSetting('company', 'address', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-phone">Telefone</Label>
                    <Input
                      id="company-phone"
                      value={settings.company.phone || ''}
                      onChange={(e) => updateSetting('company', 'phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-email">E-mail</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={settings.company.email || ''}
                      onChange={(e) => updateSetting('company', 'email', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="printer">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Impressão</CardTitle>
                  <CardDescription>Configure as opções de impressão</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-print"
                      checked={settings.printer.auto_print || false}
                      onCheckedChange={(checked) => updateSetting('printer', 'auto_print', checked)}
                    />
                    <Label htmlFor="auto-print">Impressão automática</Label>
                  </div>
                  <div>
                    <Label htmlFor="default-printer">Impressora padrão</Label>
                    <Input
                      id="default-printer"
                      value={settings.printer.default_printer || ''}
                      onChange={(e) => updateSetting('printer', 'default_printer', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ecommerce">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de E-commerce</CardTitle>
                  <CardDescription>Configure as opções do e-commerce</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ecommerce-enabled"
                      checked={settings.ecommerce.enabled || false}
                      onCheckedChange={(checked) => updateSetting('ecommerce', 'enabled', checked)}
                    />
                    <Label htmlFor="ecommerce-enabled">Habilitar E-commerce</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="admin-panel-enabled"
                      checked={settings.ecommerce.admin_panel_enabled || false}
                      onCheckedChange={(checked) => updateSetting('ecommerce', 'admin_panel_enabled', checked)}
                    />
                    <Label htmlFor="admin-panel-enabled">Painel Administrativo</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button onClick={saveSettings} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConfiguracoesMelhoradas;
