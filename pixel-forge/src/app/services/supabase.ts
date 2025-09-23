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
   * Sube una imagen al bucket 'wallpapers' dentro de la carpeta del usuario
   */
  async uploadWallpaper(file: Blob, fileName?: string): Promise<string | null> {
    const user = await this.authService.getCurrentFirebaseUser();
    if (!user) {
      alert('Debes iniciar sesión para subir wallpapers');
      return null;
    }

    // Validación básica
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
    const path = `${user.uid}/${finalName}`; // 👈 carpeta por usuario

    const { error: uploadError } = await this.supabase.storage
      .from('wallpapers')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      console.error('Error subiendo imagen:', uploadError.message);
      return null;
    }

    const { data } = this.supabase.storage.from('wallpapers').getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Borra un archivo del bucket dentro de la carpeta del usuario
   */
  async deleteWallpaper(fileName: string): Promise<boolean> {
    const user = await this.authService.getCurrentFirebaseUser();
    if (!user) {
      alert('Debes iniciar sesión para borrar wallpapers');
      return false;
    }

    const path = `${user.uid}/${fileName}`;

    const { error } = await this.supabase.storage.from('wallpapers').remove([path]);
    if (error) {
      console.error('Error borrando imagen:', error.message);
      return false;
    }

    return true;
  }

  /**
   * Lista solo las imágenes del usuario actual
   */
  async listWallpapers(): Promise<string[]> {
    const user = await this.authService.getCurrentFirebaseUser();
    if (!user) {
      alert('Debes iniciar sesión para ver wallpapers');
      return [];
    }

    const { data, error } = await this.supabase
      .storage
      .from('wallpapers')
      .list(user.uid + '/'); // 👈 solo carpeta del usuario

    if (error) {
      console.error('Error listando imágenes:', error.message);
      return [];
    }

    return data.map(file => {
      const { data: urlData } = this.supabase.storage.from('wallpapers').getPublicUrl(`${user.uid}/${file.name}`);
      return urlData.publicUrl;
    });
  }
}
