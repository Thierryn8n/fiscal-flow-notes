
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Seller = Database['public']['Tables']['sellers']['Row'];
type SellerInsert = Database['public']['Tables']['sellers']['Insert'];

export class SellersService {
  // Buscar vendedores
  static async getSellers(ownerId: string, activeOnly = true) {
    try {
      let query = supabase
        .from('sellers')
        .select('*')
        .eq('owner_id', ownerId)
        .order('full_name');

      if (activeOnly) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar vendedores:', error);
      return [];
    }
  }

  // Criar vendedor
  static async createSeller(seller: SellerInsert) {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .insert(seller)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar vendedor:', error);
      throw error;
    }
  }

  // Criar vendedor com conta de usuário
  static async createSellerWithAccount(
    fullName: string,
    email: string,
    phone: string,
    password: string,
    ownerId: string
  ) {
    try {
      const { data, error } = await supabase
        .rpc('create_seller_with_account', {
          p_full_name: fullName,
          p_email: email,
          p_phone: phone,
          p_password: password,
          p_owner_id: ownerId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar vendedor com conta:', error);
      throw error;
    }
  }

  // Atualizar vendedor
  static async updateSeller(id: string, updates: Partial<Seller>) {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar vendedor:', error);
      throw error;
    }
  }

  // Desativar vendedor
  static async deactivateSeller(sellerId: string, ownerId: string) {
    try {
      const { data, error } = await supabase
        .rpc('deactivate_seller', {
          p_seller_id: sellerId,
          p_owner_id: ownerId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao desativar vendedor:', error);
      throw error;
    }
  }

  // Atualizar imagem do vendedor
  static async updateSellerImage(sellerId: string, imagePath: string, ownerId: string) {
    try {
      const { data, error } = await supabase
        .rpc('update_seller_image', {
          p_seller_id: sellerId,
          p_image_path: imagePath,
          p_owner_id: ownerId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar imagem do vendedor:', error);
      throw error;
    }
  }

  // Buscar vendedor por ID
  static async getSellerById(id: string) {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar vendedor:', error);
      return null;
    }
  }
}
