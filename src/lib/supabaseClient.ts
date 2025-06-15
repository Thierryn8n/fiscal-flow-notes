
import { createClient } from '@supabase/supabase-js';
// Importar a instância principal do supabase client
import { supabase as mainSupabaseClient, supabaseUrl } from '../integrations/supabase/client';

const siteUrl = window.location.origin; // URL base do site para redirecionamentos

// Usar a instância importada do cliente Supabase
export const supabase = mainSupabaseClient;

// Função auxiliar para diagnosticar problemas de autenticação e RLS
export const checkAuthAndRLS = async () => {
  console.log('=== Diagnóstico de Autenticação e RLS ===');
  
  // Verificar sessão atual
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Erro ao obter sessão:', sessionError);
    return { autenticado: false, erro: sessionError };
  }
  
  if (!sessionData.session) {
    console.log('Nenhuma sessão ativa encontrada');
    return { autenticado: false, erro: 'Sem sessão' };
  }
  
  console.log('Sessão ativa encontrada:');
  console.log('- ID do usuário:', sessionData.session.user.id);
  console.log('- Token JWT presente:', !!sessionData.session.access_token);
  
  // Verificar se o token está expirado
  const expiry = sessionData.session.expires_at ? new Date(sessionData.session.expires_at * 1000) : null;
  const now = new Date();
  const tokenExpirado = expiry && expiry < now;
  
  console.log('- Token expirado?', tokenExpirado);
  console.log('- Expiração:', expiry ? expiry.toISOString() : 'N/A');
  
  // Tentativa de acesso a uma tabela protegida por RLS
  console.log('Testando acesso RLS:');
  
  try {
    // Tentar acessar a tabela de produtos com filtro de proprietário
    // IMPORTANTE: Usar owner_id (não user_id) para filtrar produtos - a tabela usa owner_id
    const { error: ownedError, count: ownedCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', sessionData.session.user.id);
    
    if (ownedError) {
      console.error('Erro ao acessar produtos do usuário:', ownedError);
      return { 
        autenticado: true, 
        acessoRLS: false, 
        erro: ownedError,
        userId: sessionData.session.user.id,
        tokenExpirado
      };
    }
    
    console.log('Acesso RLS com filtro de proprietário: OK');
    console.log('Contagem de produtos do usuário:', ownedCount);
    
    // Tentar acessar a tabela de produtos sem filtro (deve ser bloqueado pelo RLS)
    const { error: allError, count: allCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    console.log('Teste de restrição RLS (contagem geral):', allError ? `Bloqueado (erro: ${allError.message})` : `Contagem geral: ${allCount} (esperado bloqueio ou contagem limitada por RLS)`);
    
    return { 
      autenticado: true, 
      acessoRLS: !ownedError,
      userId: sessionData.session.user.id,
      tokenExpirado,
      resultados: {
        comFiltro: ownedCount,
        semFiltro: allCount
      },
      erro: ownedError
    };
  } catch (error) {
    console.error('Erro durante teste de RLS:', error);
    return { 
      autenticado: true, 
      acessoRLS: false, 
      erro: error,
      userId: sessionData.session.user.id,
      tokenExpirado
    };
  }
};

console.log('Cliente Supabase inicializado com URL base:', siteUrl);
