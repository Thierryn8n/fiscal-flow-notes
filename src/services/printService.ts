
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type PrintSettings = Database['public']['Tables']['print_settings']['Row'];
type PrintSettingsInsert = Database['public']['Tables']['print_settings']['Insert'];

export class PrintService {
  // Configurações de Impressão
  static async getPrintSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('print_settings')
        .select('*')
        .eq('created_by', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar configurações de impressão:', error);
      return null;
    }
  }

  static async createPrintSettings(settings: PrintSettingsInsert) {
    try {
      const { data, error } = await supabase
        .from('print_settings')
        .insert(settings)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar configurações de impressão:', error);
      throw error;
    }
  }

  static async updatePrintSettings(id: string, updates: Partial<PrintSettings>) {
    try {
      const { data, error } = await supabase
        .from('print_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar configurações de impressão:', error);
      throw error;
    }
  }

  // Funções para lidar com requests de impressão (já implementadas no notesService)
  static async cleanupOldPrintRequests() {
    try {
      const { error } = await supabase
        .rpc('cleanup_old_print_requests');

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao limpar requests antigos:', error);
      throw error;
    }
  }

  // Função para obter impressoras disponíveis (simulado)
  static async getAvailablePrinters() {
    // Esta função seria implementada no lado do cliente/desktop
    // Por agora, retornamos uma lista simulada
    return [
      'HP LaserJet Pro',
      'Canon PIXMA',
      'Epson EcoTank',
      'Brother DCP',
      'Impressora Padrão'
    ];
  }

  // Função para testar impressora
  static async testPrinter(printerName: string) {
    try {
      // Esta seria uma implementação real de teste de impressora
      // Por agora, simulamos um teste bem-sucedido
      console.log(`Testando impressora: ${printerName}`);
      
      // Simular delay de teste
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return { success: true, message: 'Impressora testada com sucesso!' };
    } catch (error) {
      console.error('Erro ao testar impressora:', error);
      return { success: false, message: 'Erro ao testar impressora' };
    }
  }
}
