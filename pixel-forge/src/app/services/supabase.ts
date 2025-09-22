import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private authService: AuthService) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  /**
   * Sube una imagen al bucket 'wallpapers'
   * @param file Blob o File
   * @param fileName Nombre opcional del archivo
   * @returns URL pública o null si falla
   */
  async uploadWallpaper(file: Blob, fileName?: string): Promise<string | null> {
    const user = await this.authService.getCurrentFirebaseUser();
    if (!user) {
      alert('Debes iniciar sesión para subir wallpapers');
      return null;
    }

    // Validación de tamaño y tipo (opcional)
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Archivo demasiado grande (máx ${maxSizeMB} MB)`);
      return null;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes (jpeg, png, gif, webp)');
      return null;
    }

    const finalName = fileName || `${Date.now()}_file`;

    const { error: uploadError } = await this.supabase.storage
      .from('wallpapers')
      .upload(finalName, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      console.error('Error subiendo imagen:', uploadError.message);
      return null;
    }

    const { data } = this.supabase.storage.from('wallpapers').getPublicUrl(finalName);
    return data.publicUrl;
  }

  /**
   * Borra un archivo del bucket
   */
  async deleteWallpaper(fileName: string): Promise<boolean> {
    const user = await this.authService.getCurrentFirebaseUser();
    if (!user) {
      alert('Debes iniciar sesión para borrar wallpapers');
      return false;
    }

    const { error } = await this.supabase.storage.from('wallpapers').remove([fileName]);
    if (error) {
      console.error('Error borrando imagen:', error.message);
      return false;
    }

    return true;
  }

  /**
   * Lista todas las imágenes del bucket
   */
  async listWallpapers(): Promise<string[]> {
    const { data, error } = await this.supabase.storage.from('wallpapers').list();
    if (error) {
      console.error('Error listando imágenes:', error.message);
      return [];
    }

    return data.map(file => {
      const { data: urlData } = this.supabase.storage.from('wallpapers').getPublicUrl(file.name);
      return urlData.publicUrl;
    });
  }
}
