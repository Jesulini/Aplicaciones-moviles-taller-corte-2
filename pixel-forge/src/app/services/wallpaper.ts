import { Injectable } from '@angular/core';
import { getAuth } from 'firebase/auth';

export interface WallpaperFile {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface StoredWallpaper extends WallpaperFile {
  blob: Blob;
}

@Injectable({
  providedIn: 'root',
})
export class WallpaperService {
  private auth = getAuth();
  private db!: IDBDatabase;
  private dbReady: Promise<void>;
  private readonly DB_NAME = 'MyWallpapersDB';
  private readonly STORE_NAME = 'wallpapers';

  constructor() {
    this.dbReady = this.initDb();
  }

  private initDb(): Promise<void> {
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

  private async ensureDb() {
    if (!this.db) await this.dbReady;
  }

  async uploadWallpaper(file: Blob, fileName: string): Promise<WallpaperFile> {
    await this.ensureDb();
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      const id = `${user.uid}-${fileName}-${Date.now()}`;
      const stored: StoredWallpaper = {
        id,
        name: fileName,
        url: URL.createObjectURL(file),
        type: file.type,
        blob: file,
      };

      const req = store.add(stored);

      req.onsuccess = () => resolve({ id: stored.id, name: stored.name, url: stored.url, type: stored.type });
      req.onerror = () => reject('Error al guardar en IndexedDB');
    });
  }

  async listUserWallpapers(): Promise<WallpaperFile[]> {
    await this.ensureDb();
    const user = this.auth.currentUser;
    if (!user) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.STORE_NAME, 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const files: WallpaperFile[] = [];

      store.openCursor().onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const file: StoredWallpaper = cursor.value;
          if (file.id.startsWith(`${user.uid}-`)) files.push({ id: file.id, name: file.name, url: URL.createObjectURL(file.blob), type: file.type });
          cursor.continue();
        } else resolve(files);
      };

      transaction.onerror = () => reject('Error al listar archivos de IndexedDB');
    });
  }

  async deleteWallpaper(fileId: string): Promise<void> {
    await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      const req = store.delete(fileId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject('Error al eliminar de IndexedDB');
    });
  }
}
