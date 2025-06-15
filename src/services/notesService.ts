
import { supabase } from '@/integrations/supabase/client';
import type { FiscalNote } from '@/types/FiscalNote';

export const createFiscalNote = async (noteData: any) => {
  try {
    const { data, error } = await supabase
      .from('fiscal_notes')
      .insert([noteData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar nota fiscal:', error);
    throw error;
  }
};

export const getFiscalNotes = async (ownerId: string) => {
  try {
    const { data, error } = await supabase
      .from('fiscal_notes')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar notas fiscais:', error);
    throw error;
  }
};

export const getFiscalNoteById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('fiscal_notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar nota fiscal:', error);
    throw error;
  }
};

export const updateFiscalNote = async (id: string, updates: Partial<FiscalNote>) => {
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
};

export const deleteFiscalNote = async (id: string) => {
  try {
    const { error } = await supabase
      .from('fiscal_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar nota fiscal:', error);
    throw error;
  }
};

export const updateNoteStatus = async (noteId: string, status: string) => {
  try {
    const updateData: { status: string; updated_at: string; printed_at?: string } = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'printed') {
      updateData.printed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('fiscal_notes')
      .update(updateData)
      .eq('id', noteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar status da nota:', error);
    throw error;
  }
};
