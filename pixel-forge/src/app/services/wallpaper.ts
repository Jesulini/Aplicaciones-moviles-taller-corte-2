import { Injectable } from '@angular/core';
import { getAuth } from 'firebase/auth';

export interface WallpaperFile {
  id: string;
  name: string;
  url: string;
  type: string;
}

@Injectable({
  providedIn: 'root',
})
export class WallpaperService {
  private auth = getAuth();
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'MyWallpapersDB';
  private readonly STORE_NAME = 'wallpapers';

  constructor() {
    this.openDb();
  }

  private async openDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
        reject('Error opening IndexedDB');
      };
    });
  }

  async uploadWallpaper(file: Blob, fileName: string): Promise<WallpaperFile> {
    if (!this.db) {
      await this.openDb();
    }
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      const fileId = `${user.uid}-${fileName}-${Date.now()}`;
      const newFile = {
        id: fileId,
        name: fileName,
        url: URL.createObjectURL(file), // URL temporal para la vista previa
        type: file.type,
        blob: file // Guarda el blob para persistencia
      };
      
      const request = store.add(newFile);

      request.onsuccess = () => {
        resolve({
          id: newFile.id,
          name: newFile.name,
          url: newFile.url,
          type: newFile.type
        });
      };

      request.onerror = () => {
        reject('Error al guardar en IndexedDB');
      };
    });
  }

  async listUserWallpapers(): Promise<WallpaperFile[]> {
    if (!this.db) {
      await this.openDb();
    }
    const user = this.auth.currentUser;
    if (!user) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.STORE_NAME, 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const allFiles: WallpaperFile[] = [];

      store.openCursor().onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const file = cursor.value;
          // Filtra archivos por usuario
          if (file.id.startsWith(`${user.uid}-`)) {
            allFiles.push({
              id: file.id,
              name: file.name,
              url: URL.createObjectURL(file.blob),
              type: file.type,
            });
          }
          cursor.continue();
        } else {
          resolve(allFiles);
        }
      };

      transaction.onerror = (event) => {
        reject('Error al listar archivos de IndexedDB');
      };
    });
  }

  async deleteWallpaper(fileId: string): Promise<void> {
    if (!this.db) {
      await this.openDb();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(fileId);

      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject('Error al eliminar de IndexedDB');
      };
    });
  }
}
