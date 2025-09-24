import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

export interface WallpaperFile {
  name: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class WallpaperService {
  constructor(private supabaseService: SupabaseService) {}

  // Subir wallpaper
  async uploadWallpaper(file: Blob, fileName: string): Promise<WallpaperFile> {
    const url = await this.supabaseService.uploadWallpaper(file, fileName);
    if (!url) throw new Error('No se pudo subir la imagen');
    return { name: fileName, url };
  }

  // Listar wallpapers del usuario (filtrando imágenes por defecto)
  async listUserWallpapers(): Promise<WallpaperFile[]> {
    const urls = await this.supabaseService.listWallpapers();

    return urls
      // 👀 aquí filtramos cualquier archivo fantasma
      .filter((url: string) => 
        !url.includes('default.png') &&
        !url.includes('placeholder.jpg') &&
        !url.includes('sample.jpg')
      )
      .map((url: string) => {
        const name = url.split('/').pop() || `file_${Date.now()}`;
        return { name, url };
      });
  }

  // Eliminar wallpaper
  async deleteWallpaper(fileName: string): Promise<boolean> {
    return this.supabaseService.deleteWallpaper(fileName);
  }
}
