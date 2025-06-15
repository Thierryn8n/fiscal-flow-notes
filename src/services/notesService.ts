
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type FiscalNote = Database['public']['Tables']['fiscal_notes']['Row'];
type FiscalNoteInsert = Database['public']['Tables']['fiscal_notes']['Insert'];
type PrintRequest = Database['public']['Tables']['print_requests']['Row'];
type PrintHistory = Database['public']['Tables']['print_history']['Row'];

export class NotesService {
  // Notas Fiscais
  static async getFiscalNotes(ownerId: string, page = 1, limit = 20, filters?: {
    startDate?: string;
    endDate?: string;
    sellerId?: string;
    status?: string;
  }) {
    try {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit - 1;
      
      let query = supabase
        .from('fiscal_notes')
        .select('*', { count: 'exact' })
        .eq('owner_id', ownerId)
        .range(startIndex, endIndex)
        .order('created_at', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      if (filters?.sellerId) {
        query = query.eq('seller_id', filters.sellerId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Erro ao buscar notas fiscais:', error);
      return { data: [], count: 0 };
    }
  }

  static async createFiscalNote(note: FiscalNoteInsert) {
    try {
      const { data, error } = await supabase
        .from('fiscal_notes')
        .insert(note)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar nota fiscal:', error);
      throw error;
    }
  }

  static async updateFiscalNote(id: string, updates: Partial<FiscalNote>) {
    try {
      const { data, error } = await supabase
        .from('fiscal_notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar nota fiscal:', error);
      throw error;
    }
  }

  static async deleteFiscalNote(id: string) {
    try {
      const { error } = await supabase
        .from('fiscal_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar nota fiscal:', error);
      throw error;
    }
  }

  // Estatísticas de Notas
  static async getNotesStats(ownerId: string, filters?: {
    startDate?: string;
    endDate?: string;
    sellerId?: string;
  }) {
    try {
      const { data, error } = await supabase
        .rpc('get_notes_stats', {
          p_owner_id: ownerId,
          p_start_date: filters?.startDate,
          p_end_date: filters?.endDate,
          p_seller_id: filters?.sellerId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return null;
    }
  }

  // Requests de Impressão
  static async createPrintRequest(request: Omit<PrintRequest, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('print_requests')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar request de impressão:', error);
      throw error;
    }
  }

  static async getPrintRequests(userId: string, status?: string) {
    try {
      let query = supabase
        .from('print_requests')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar requests de impressão:', error);
      return [];
    }
  }

  static async updatePrintRequestStatus(id: string, status: string, errorMessage?: string) {
    try {
      const updates: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updates.printed_at = new Date().toISOString();
      }

      if (errorMessage) {
        updates.error_message = errorMessage;
      }

      const { data, error } = await supabase
        .from('print_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar status de impressão:', error);
      throw error;
    }
  }

  // Histórico de Impressão
  static async createPrintHistory(history: Omit<PrintHistory, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('print_history')
        .insert(history)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar histórico de impressão:', error);
      throw error;
    }
  }

  static async getPrintHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('print_history')
        .select('*, print_requests(*)')
        .eq('printed_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar histórico de impressão:', error);
      return [];
    }
  }

  // Marcar nota como impressa
  static async markNoteAsPrinted(noteId: string, ownerId: string) {
    try {
      const { data, error } = await supabase
        .rpc('mark_note_as_printed', {
          p_note_id: noteId,
          p_owner_id: ownerId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao marcar nota como impressa:', error);
      throw error;
    }
  }
}
