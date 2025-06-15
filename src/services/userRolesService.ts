
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Tables']['user_roles']['Row'];
type UserRoleInsert = Database['public']['Tables']['user_roles']['Insert'];

export class UserRolesService {
  // Buscar roles do usuário
  static async getUserRoles(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar roles do usuário:', error);
      return [];
    }
  }

  // Verificar se usuário tem role específica
  static async hasRole(userId: string, role: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', role)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Erro ao verificar role:', error);
      return false;
    }
  }

  // Adicionar role ao usuário
  static async addUserRole(userId: string, role: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao adicionar role:', error);
      throw error;
    }
  }

  // Remover role do usuário
  static async removeUserRole(userId: string, role: string) {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao remover role:', error);
      throw error;
    }
  }

  // Verificar se usuário é admin
  static async isAdmin(userId: string) {
    return this.hasRole(userId, 'admin');
  }

  // Verificar se usuário é vendedor
  static async isSeller(userId: string) {
    return this.hasRole(userId, 'seller');
  }

  // Verificar se usuário é moderador
  static async isModerator(userId: string) {
    return this.hasRole(userId, 'moderator');
  }

  // Buscar todos os usuários com roles
  static async getAllUsersWithRoles() {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários com roles:', error);
      return [];
    }
  }
}
