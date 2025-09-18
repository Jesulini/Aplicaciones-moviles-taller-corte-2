// src/app/services/wallpaper.service.ts
import { Injectable } from '@angular/core';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

export interface WallpaperFile {
  name: string;
  url: string;
  type: string;
}

@Injectable({
  providedIn: 'root',
})
export class WallpaperService {
  private storage = getStorage();
  private auth = getAuth();

  constructor() {}

  // Listar wallpapers del usuario
  async listUserWallpapers(): Promise<WallpaperFile[]> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const userFolder = ref(this.storage, `wallpapers/${user.uid}/`);
    const res = await listAll(userFolder);

    const files: WallpaperFile[] = await Promise.all(
      res.items.map(async (fileRef) => {
        const url = await getDownloadURL(fileRef);
        const type = fileRef.name.endsWith('.mp4') ? 'video/mp4' : 'image/png'; // ajustar según extensión
        return { name: fileRef.name, url, type };
      })
    );

    return files;
  }

  // Subir wallpaper
  async uploadWallpaper(file: File): Promise<WallpaperFile> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const fileRef = ref(this.storage, `wallpapers/${user.uid}/${file.name}`);
    await uploadBytes(fileRef, file);

    const url = await getDownloadURL(fileRef);
    const type = file.type;

    return { name: file.name, url, type };
  }

  // Borrar wallpaper
  async deleteWallpaper(fileName: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const fileRef = ref(this.storage, `wallpapers/${user.uid}/${fileName}`);
    await deleteObject(fileRef);
  }
}
