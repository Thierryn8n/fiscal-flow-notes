import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Upload, Trash2, Edit, Package, FileText } from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Layout from '@/components/Layout';

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  unit: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('UN');
  const [isCreating, setIsCreating] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast({
        title: 'Erro ao carregar produtos',
        description: 'Não foi possível carregar a lista de produtos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');
      
      const newProduct = {
        name,
        code,
        price: parseFloat(price),
        unit,
        user_id: userData.user.id
      };
      
      const { error } = await supabase.from('products').insert([newProduct]);
      
      if (error) throw error;
      
      toast({
        title: 'Produto adicionado',
        description: 'O produto foi adicionado com sucesso.',
      });
      
      setName('');
      setCode('');
      setPrice('');
      setUnit('UN');
      setIsCreating(false);
      fetchProducts();
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast({
        title: 'Erro ao adicionar produto',
        description: 'Não foi possível adicionar o produto.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Produto excluído',
        description: 'O produto foi excluído com sucesso.',
      });
      
      fetchProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: 'Erro ao excluir produto',
        description: 'Não foi possível excluir o produto.',
        variant: 'destructive',
      });
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast({
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, selecione um arquivo CSV para importar.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');
      
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        
        // Skip header row
        const header = lines[0].split(',');
        const nameIndex = header.findIndex(h => h.trim().toLowerCase() === 'nome');
        const codeIndex = header.findIndex(h => h.trim().toLowerCase() === 'codigo');
        const priceIndex = header.findIndex(h => h.trim().toLowerCase() === 'preco');
        const unitIndex = header.findIndex(h => h.trim().toLowerCase() === 'unidade');
        
        if (nameIndex === -1 || codeIndex === -1 || priceIndex === -1) {
          throw new Error('O arquivo CSV deve conter as colunas: nome, codigo, preco');
        }
        
        const productsToImport = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const columns = lines[i].split(',');
          
          const product = {
            name: columns[nameIndex].trim(),
            code: columns[codeIndex].trim(),
            price: parseFloat(columns[priceIndex].trim().replace(',', '.')),
            unit: unitIndex !== -1 ? columns[unitIndex].trim() : 'UN',
            user_id: userData.user.id
          };
          
          if (product.name && product.code && !isNaN(product.price)) {
            productsToImport.push(product);
          }
        }
        
        if (productsToImport.length === 0) {
          throw new Error('Nenhum produto válido encontrado no arquivo');
        }
        
        const { error } = await supabase.from('products').insert(productsToImport);
        
        if (error) throw error;
        
        toast({
          title: 'Importação concluída',
          description: `${productsToImport.length} produtos foram importados com sucesso.`,
        });
        
        setCsvFile(null);
        fetchProducts();
      };
      
      reader.readAsText(csvFile);
    } catch (error) {
      console.error('Erro ao importar produtos:', error);
      toast({
        title: 'Erro na importação',
        description: error instanceof Error ? error.message : 'Não foi possível importar os produtos.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-cascadia flex items-center gap-2">
            <Package className="text-fiscal-green-600" />
            Gerenciar Produtos
          </h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsCreating(!isCreating)} 
              className="gap-2 bg-fiscal-green-500 hover:bg-fiscal-green-600"
            >
              <Plus size={16} />
              Adicionar
            </Button>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="gap-2 border-fiscal-green-500 text-fiscal-green-700">
                  <Upload size={16} />
                  Importar CSV
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 p-4 border border-gray-200 rounded-lg shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="text-fiscal-gray-500" size={20} />
                    <div className="text-sm text-fiscal-gray-700">
                      Selecione um arquivo CSV com colunas: nome, codigo, preco, unidade
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-fiscal-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-fiscal-green-50 file:text-fiscal-green-700
                        hover:file:bg-fiscal-green-100"
                    />
                    <Button 
                      onClick={handleCsvUpload} 
                      disabled={!csvFile || isImporting}
                      className="bg-fiscal-green-500 hover:bg-fiscal-green-600"
                    >
                      {isImporting ? 'Importando...' : 'Importar'}
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {isCreating && (
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Novo Produto</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-fiscal-gray-700 mb-1">
                    Nome do Produto
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-fiscal-gray-700 mb-1">
                    Código
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-fiscal-gray-700 mb-1">
                    Preço (R$)
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-fiscal-gray-700 mb-1">
                    Unidade
                  </label>
                  <select
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="UN">Unidade (UN)</option>
                    <option value="KG">Quilograma (KG)</option>
                    <option value="L">Litro (L)</option>
                    <option value="M">Metro (M)</option>
                    <option value="CX">Caixa (CX)</option>
                    <option value="PCT">Pacote (PCT)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreating(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-fiscal-green-500 hover:bg-fiscal-green-600"
                >
                  Salvar Produto
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-lg font-medium mb-4">Lista de Produtos</h2>
          {loading ? (
            <div className="text-center py-4">Carregando produtos...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-4 text-fiscal-gray-500">
              Nenhum produto cadastrado. Adicione um produto ou importe via CSV.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.code}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>R$ {product.price.toFixed(2).replace('.', ',')}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-fiscal-green-600">
                            <Edit size={16} />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Products;
