// Script para diagnosticar problemas com consulta de produtos no Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function diagnoseProductsQuery() {
  try {
    // Carregar variáveis de ambiente do arquivo .env
    const envContent = fs.readFileSync('.env', 'utf8');
    const envVars = envContent.split('\n').reduce((obj, line) => {
      const [key, value] = line.split('=');
      if (key && value) obj[key.trim()] = value.trim();
      return obj;
    }, {});

    const supabaseUrl = envVars.VITE_SUPABASE_URL;
    const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Erro: Faltam variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY');
      return;
    }

    console.log('Conectando ao Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Obter informações do usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Erro ao obter usuário atual:', userError);
      console.log('Você precisa estar autenticado para executar este teste.');
      return;
    }
    
    console.log(`Autenticado como usuário: ${user.id}`);
    
    // 2. Verificar tabelas existentes
    console.log('\n=== VERIFICANDO TABELAS ===');
    try {
      const { data: tablesData } = await supabase.rpc('get_tables');
      if (tablesData) {
        console.log('Tabelas disponíveis:', tablesData);
      }
    } catch (e) {
      console.log('Não foi possível listar tabelas:', e.message);
    }
    
    // 3. Verificar se existe a tabela products
    console.log('\n=== VERIFICANDO TABELA PRODUCTS ===');
    const { data: productTableData, error: productTableError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (productTableError) {
      console.error('Erro ao verificar tabela products:', productTableError);
    } else {
      console.log('Tabela products existe.');
    }
    
    // 4. Testar consulta simples - sem filtros
    console.log('\n=== TESTE 1: CONSULTA SEM FILTROS ===');
    const { data: allProductsData, error: allProductsError, count: allProductsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (allProductsError) {
      console.error('Erro na consulta sem filtros:', allProductsError);
    } else {
      console.log(`Total de produtos sem filtros: ${allProductsCount || 0}`);
      console.log('Primeiros produtos:', allProductsData);
    }
    
    // 5. Testar consulta com owner_id
    console.log('\n=== TESTE 2: CONSULTA COM OWNER_ID ===');
    const { data: userProductsData, error: userProductsError, count: userProductsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('owner_id', user.id)
      .limit(5);
    
    if (userProductsError) {
      console.error('Erro na consulta com owner_id:', userProductsError);
    } else {
      console.log(`Total de produtos do usuário ${user.id}: ${userProductsCount || 0}`);
      console.log('Primeiros produtos do usuário:', userProductsData);
    }
    
    // 6. Verificar se os produtos têm o campo user_id em vez de owner_id
    console.log('\n=== TESTE 3: VERIFICANDO CAMPO USER_ID ===');
    const { data: userIdProductsData, error: userIdProductsError, count: userIdProductsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .limit(5);
    
    if (userIdProductsError) {
      console.error('Erro na consulta com user_id:', userIdProductsError);
    } else {
      console.log(`Total de produtos com user_id=${user.id}: ${userIdProductsCount || 0}`);
      console.log('Primeiros produtos com user_id:', userIdProductsData);
    }
    
    // 7. Verificar estrutura da tabela products
    console.log('\n=== ESTRUTURA DA TABELA PRODUCTS ===');
    const { data: sampleProduct, error: sampleError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('Erro ao obter exemplo de produto:', sampleError);
    } else if (sampleProduct && sampleProduct.length > 0) {
      console.log('Campos da tabela products:', Object.keys(sampleProduct[0]));
      console.log('Exemplo de produto:', sampleProduct[0]);
    } else {
      console.log('Nenhum produto encontrado para verificar estrutura.');
      
      // 8. Tentar inserir um produto de teste
      console.log('\n=== TESTE 4: INSERINDO PRODUTO DE TESTE ===');
      const testProduct = {
        name: 'Produto Diagnóstico Teste',
        code: 'DIAG' + Date.now(),
        price: 99.99,
        description: 'Produto inserido para diagnóstico',
        unit: 'UN',
        quantity: 1,
        owner_id: user.id
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('products')
        .insert(testProduct)
        .select();
      
      if (insertError) {
        console.error('Erro ao inserir produto de teste:', insertError);
      } else {
        console.log('Produto de teste inserido com sucesso:', insertData);
      }
    }
    
    // 9. Verificar políticas RLS na tabela products
    console.log('\n=== VERIFICANDO POLÍTICAS RLS ===');
    try {
      const { data: policiesData } = await supabase.rpc('get_policies', { table_name: 'products' });
      if (policiesData) {
        console.log('Políticas RLS para a tabela products:', policiesData);
      }
    } catch (e) {
      console.log('Não foi possível verificar políticas RLS:', e.message);
      console.log('Verificação manual necessária no dashboard do Supabase');
    }
    
    console.log('\n=== DIAGNÓSTICO CONCLUÍDO ===');
    
  } catch (error) {
    console.error('Erro não tratado durante o diagnóstico:', error);
  }
}

diagnoseProductsQuery();
