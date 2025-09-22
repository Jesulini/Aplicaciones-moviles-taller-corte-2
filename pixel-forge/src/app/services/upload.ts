import { Component, OnInit } from '@angular/core';
import { SupabaseService } from './supabase';
import { AuthService } from './auth';

@Component({
  selector: 'app-upload',
  template: `
    <h2>Login / Logout</h2>
    <button (click)="login()">Login de prueba</button>
    <button (click)="logout()">Logout</button>

    <h2>Subir Wallpaper</h2>
    <input type="file" (change)="onFileSelected($event)" />

    <div *ngIf="uploading">Subiendo... {{ progress }}%</div>

    <div *ngIf="imageUrl" style="margin-top: 10px;">
      <img [src]="imageUrl" alt="Wallpaper" style="max-width: 300px;" />
      <button (click)="deleteImage()">Borrar</button>
    </div>

    <h3>Wallpapers existentes:</h3>
    <div style="display: flex; flex-wrap: wrap;">
      <div *ngFor="let img of wallpapers" style="margin: 5px;">
        <img [src]="img" alt="Wallpaper" style="max-width: 150px;" />
      </div>
    </div>
  `
})
export class UploadComponent implements OnInit {
  imageUrl: string | null = null;
  currentFileName: string | null = null;
  wallpapers: string[] = [];
  uploading = false;
  progress = 0;

  constructor(private supabaseService: SupabaseService, private authService: AuthService) {}

  ngOnInit() {
    this.loadWallpapers();
  }

  async login() {
    // Usuario de prueba, puedes cambiar por tu email/password
    await this.authService.login('test@example.com', '123456');
    alert('Usuario logueado');
  }

  async logout() {
    await this.authService.logout();
    alert('Usuario deslogueado');
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.uploading = true;
    this.progress = 0;

    const fileName = `${Date.now()}_${file.name}`;
    const url = await this.supabaseService.uploadWallpaper(file);
    this.uploading = false;

    if (url) {
      this.imageUrl = url;
      this.currentFileName = fileName;
      this.loadWallpapers();
    }
  }

  async deleteImage() {
    if (!this.currentFileName) return;
    const success = await this.supabaseService.deleteWallpaper(this.currentFileName);
    if (success) {
      alert('Imagen borrada');
      this.imageUrl = null;
      this.currentFileName = null;
      this.loadWallpapers();
    }
  }

  async loadWallpapers() {
    this.wallpapers = await this.supabaseService.listWallpapers();
  }
}
