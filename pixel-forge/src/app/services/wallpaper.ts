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

  async uploadWallpaper(file: Blob, fileName: string): Promise<WallpaperFile> {
    const url = await this.supabaseService.uploadWallpaper(file, fileName);
    if (!url) throw new Error('No se pudo subir la imagen');
    return { name: fileName, url };
  }

  async listUserWallpapers(): Promise<WallpaperFile[]> {
    const urls = await this.supabaseService.listWallpapers();
    return urls.map((url: string) => {
      const name = url.split('/').pop() || `file_${Date.now()}`;
      return { name, url };
    });
  }

  async deleteWallpaper(fileName: string): Promise<boolean> {
    return this.supabaseService.deleteWallpaper(fileName);
  }
}
