
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile = async (file: File, bucket: string) => {
  try {
    const fileExtension = file.name.split('.').pop();
    const filePath = `${uuidv4()}.${fileExtension}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      return { success: false, url: null, path: null, error };
    }

    if (data) {
        const publicUrl = getPublicUrl(bucket, data.path);
        return { success: true, url: publicUrl, path: data.path, error: null };
    }
    
    return { success: false, url: null, path: null, error: new Error('Upload bem-sucedido, mas sem dados de retorno.') };
  } catch (error) {
    console.error('Exceção no upload:', error);
    return { success: false, url: null, path: null, error: error as Error };
  }
};

export const deleteFile = async (bucket: string, path: string) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return { success: false, error: error as Error };
  }
};

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};
