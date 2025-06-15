
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type EcommerceSettings = Database['public']['Tables']['ecommerce_settings']['Row'];
type EcommerceCategory = Database['public']['Tables']['ecommerce_categories']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type ProductReview = Database['public']['Tables']['product_reviews']['Row'];

export class EcommerceService {
  // Configurações do E-commerce
  static async getEcommerceSettings(ownerId?: string) {
    try {
      let query = supabase
        .from('ecommerce_settings')
        .select('*');

      if (ownerId) {
        query = query.eq('owner_id', ownerId);
      }

      const { data, error } = await query.single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar configurações do e-commerce:', error);
      return null;
    }
  }

  static async updateEcommerceSettings(settings: Partial<EcommerceSettings>) {
    try {
      const { data, error } = await supabase
        .from('ecommerce_settings')
        .upsert(settings)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar configurações do e-commerce:', error);
      throw error;
    }
  }

  // Categorias
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('ecommerce_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  static async createCategory(category: Omit<EcommerceCategory, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('ecommerce_categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  }

  static async updateCategory(id: string, updates: Partial<EcommerceCategory>) {
    try {
      const { data, error } = await supabase
        .from('ecommerce_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  }

  static async deleteCategory(id: string) {
    try {
      const { error } = await supabase
        .from('ecommerce_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
  }

  // Produtos para E-commerce
  static async getProductsForEcommerce(page = 1, limit = 20, searchTerm?: string, categoryId?: string) {
    try {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit - 1;
      
      let query = supabase
        .from('products')
        .select('*, ecommerce_categories(name)', { count: 'exact' })
        .range(startIndex, endIndex);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`);
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Erro ao buscar produtos para e-commerce:', error);
      return { data: [], count: 0 };
    }
  }

  // Reviews de Produtos
  static async getProductReviews(productId: string) {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar reviews do produto:', error);
      return [];
    }
  }

  static async createProductReview(review: Omit<ProductReview, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .insert(review)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar review:', error);
      throw error;
    }
  }

  // Temas do E-commerce
  static async getEcommerceThemes() {
    try {
      const { data, error } = await supabase
        .from('ecommerce_themes')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar temas:', error);
      return [];
    }
  }

  // Estilos de Cards de Produtos
  static async getProductCardStyles(settingsId: number) {
    try {
      const { data, error } = await supabase
        .from('ecommerce_product_card_styles')
        .select('*')
        .eq('settings_id', settingsId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar estilos de cards:', error);
      return null;
    }
  }

  static async updateProductCardStyles(styles: Partial<Database['public']['Tables']['ecommerce_product_card_styles']['Row']>) {
    try {
      const { data, error } = await supabase
        .from('ecommerce_product_card_styles')
        .upsert(styles)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar estilos de cards:', error);
      throw error;
    }
  }
}
