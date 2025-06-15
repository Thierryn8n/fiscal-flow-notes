
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type OrderKanban = Database['public']['Tables']['orders_kanban']['Row'];
type OrderKanbanInsert = Database['public']['Tables']['orders_kanban']['Insert'];

export class OrdersService {
  // Buscar pedidos
  static async getOrders(ownerId: string, status?: string) {
    try {
      let query = supabase
        .from('orders_kanban')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      return [];
    }
  }

  // Criar pedido
  static async createOrder(order: OrderKanbanInsert) {
    try {
      const { data, error } = await supabase
        .from('orders_kanban')
        .insert(order)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  }

  // Atualizar pedido
  static async updateOrder(id: string, updates: Partial<OrderKanban>) {
    try {
      const { data, error } = await supabase
        .from('orders_kanban')
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
      console.error('Erro ao atualizar pedido:', error);
      throw error;
    }
  }

  // Atualizar status do pedido
  static async updateOrderStatus(id: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('orders_kanban')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw error;
    }
  }

  // Deletar pedido
  static async deleteOrder(id: string) {
    try {
      const { error } = await supabase
        .from('orders_kanban')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      throw error;
    }
  }

  // Buscar pedidos por vendedor
  static async getOrdersBySeller(sellerId: string) {
    try {
      const { data, error } = await supabase
        .from('orders_kanban')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar pedidos do vendedor:', error);
      return [];
    }
  }

  // Buscar pedidos por status (para dashboard Kanban)
  static async getOrdersByStatus(ownerId: string) {
    try {
      const { data, error } = await supabase
        .from('orders_kanban')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Agrupar por status
      const ordersByStatus = {
        novo: [],
        processando: [],
        enviado: [],
        entregue: [],
        cancelado: []
      };

      data?.forEach(order => {
        const status = order.status.toLowerCase();
        if (ordersByStatus[status]) {
          ordersByStatus[status].push(order);
        }
      });

      return ordersByStatus;
    } catch (error) {
      console.error('Erro ao buscar pedidos por status:', error);
      return {
        novo: [],
        processando: [],
        enviado: [],
        entregue: [],
        cancelado: []
      };
    }
  }
}
