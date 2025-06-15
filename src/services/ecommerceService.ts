import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

// Interfaces
export interface EcommerceProduct extends Omit<Tables<'products'>, 'id' | 'created_at' | 'updated_at' | 'owner_id' | 'total'> {
  id: string;
  stock?: number;
  inStock?: boolean;
  slug?: string;
  category?: string;
  additionalImages?: { url: string }[];
}

export interface CartItem extends EcommerceProduct {
  quantity: number;
}

export interface StoreInfo extends Omit<Tables<'ecommerce_settings'>, 'id' | 'created_at' | 'updated_at' | 'owner_id'> {
  id: number;
  name: string;
  description?: string | null;
  paymentMethods?: string[];
  shippingMethods?: ShippingMethod[];
  owner_id?: string | null;
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Category extends Omit<Tables<'ecommerce_categories'>, 'owner_id' | 'created_at' | 'updated_at' | 'image_url'> {
  icon?: string | null;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'returned';

export interface NewOrderKanbanData {
  product_id: string;
  product_name: string;
  customer_id: string;
  customer_name: string;
  seller_id: string;
  seller_name: string;
  status: OrderStatus;
  notes?: string;
  total_amount: number;
}


// Função para transformar os dados crus do Supabase para o tipo StoreInfo
const transformToStoreInfo = (data: Tables<'ecommerce_settings'>): StoreInfo => {
  return {
    ...data,
    name: data.store_name || 'Minha Loja',
    description: data.store_description,
    paymentMethods: data.footer_payment_methods?.split(',') || [],
  };
};

export class EcommerceService {
  /**
   * Busca uma lista paginada de produtos.
   * @param page Número da página (padrão: 1)
   * @param limit Limite de produtos por página (padrão: 10)
   * @param searchQuery Termo de busca (opcional)
   * @param category Categoria dos produtos (opcional)
   */
  public static async getProducts(
    page: number = 1,
    limit: number = 10,
    searchQuery: string = '',
    category: string = ''
  ): Promise<{ data: EcommerceProduct[], count: number }> {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1);

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error('Não foi possível carregar os produtos.');
    }

    return {
      data: data as EcommerceProduct[],
      count: count || 0,
    };
  }

  /**
   * Busca um produto pelo ID.
   * @param productId ID do produto
   */
  public static async getProductById(productId: string): Promise<EcommerceProduct | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Erro ao buscar produto:', error);
      throw new Error('Não foi possível carregar o produto.');
    }

    return data as EcommerceProduct | null;
  }

  /**
   * Busca todas as categorias de produtos.
   */
  public static async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('ecommerce_categories')
      .select('*');

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      throw new Error('Não foi possível carregar as categorias.');
    }

    return data as Category[];
  }

  /**
   * Busca as informações da loja, como nome, logo, etc.
   * Utiliza cache em localStorage para evitar requisições repetidas.
   */
  public static async getStoreInfo(forceRefresh = false): Promise<StoreInfo> {
    const cacheKey = 'fiscal_flow_store_info';
    
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          console.log('Carregando StoreInfo do cache');
          return transformToStoreInfo(parsedData);
        } catch (e) {
          console.error('Erro ao parsear StoreInfo do cache', e);
          localStorage.removeItem(cacheKey);
        }
      }
    }

    console.log('Buscando StoreInfo do Supabase...');
    const { data: settings, error } = await supabase
      .from('ecommerce_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao buscar configurações da loja:', error);
      throw new Error('Não foi possível carregar as informações da loja.');
    }
    
    if (settings) {
      localStorage.setItem(cacheKey, JSON.stringify(settings));
      return transformToStoreInfo(settings);
    }

    // Retornar um fallback caso não haja configurações
    return transformToStoreInfo({
      id: 0,
      store_name: 'ToolPart',
      store_description: 'Sua loja de ferramentas',
      // ... outros valores padrão
    } as Tables<'ecommerce_settings'>);
  }

  /**
   * Cria um novo pedido no quadro Kanban.
   */
  public static async createOrderInKanban(orderData: NewOrderKanbanData) {
    const { data, error } = await supabase
      .from('orders_kanban')
      .insert([orderData]);

    if (error) {
      console.error('Erro ao criar pedido no Kanban:', error);
      throw new Error('Não foi possível criar o pedido no Kanban.');
    }

    return data;
  }
}
