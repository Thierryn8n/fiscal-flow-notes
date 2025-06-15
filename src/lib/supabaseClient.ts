
import { createClient } from '@supabase/supabase-js';
// Importar a instância principal do supabase client
import { supabase as mainSupabaseClient } from '../integrations/supabase/client';

const siteUrl = window.location.origin; // URL base do site para redirecionamentos

// Usar a instância importada do cliente Supabase
export const supabase = mainSupabaseClient;

console.log('Cliente Supabase inicializado com URL base:', siteUrl);
