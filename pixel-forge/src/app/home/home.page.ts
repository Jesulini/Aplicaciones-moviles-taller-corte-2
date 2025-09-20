import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ToastController, AlertController, Platform } from '@ionic/angular';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { WallpaperService, WallpaperFile } from '../services/wallpaper';
import { registerPlugin } from '@capacitor/core';
import type { MyWallpaperPlugin } from '../plugins/my-wallpaper-plugin';
import { Preferences } from '@capacitor/preferences';

// Registro tipado del plugin
const MyWallpaper = registerPlugin<MyWallpaperPlugin>('MyWallpaper');

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  currentUser: any = null;
  wallpapers: WallpaperFile[] = [];
  isUploading = false;
  fabOptionsVisible = false;

  constructor(
    private authService: AuthService,
    private wallpaperService: WallpaperService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private platform: Platform
  ) {}

  async ngOnInit() {
    await this.platform.ready();
    this.loadUserInfo();
    this.loadWallpapers();
  }

  ionViewWillEnter() {
    this.loadUserInfo();
    this.loadWallpapers();
  }

  private loadUserInfo() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUser = {
          id: user.uid,
          name: user.displayName || 'Usuario',
          email: user.email || ''
        };
      } else {
        this.currentUser = null;
      }
    });
  }

  private async loadWallpapers() {
    if (!this.currentUser) return;

    try {
      this.wallpapers = await this.wallpaperService.listUserWallpapers();
    } catch (err) {
      console.error('Error cargando wallpapers:', err);
    }
  }

  async pickFile() {
    if (!this.currentUser) {
      this.showToast('Debes iniciar sesión para subir archivos', 'warning');
      return;
    }

    try {
      const result = await FilePicker.pickFiles({
        types: ['image/jpeg', 'image/png'],
        readData: true
      });

      for (const file of result.files) {
        if (!file.data) continue;

        const mimeType = this.getMimeType(file.name);
        const blob = this.base64ToBlob(file.data as string, mimeType);

        this.isUploading = true;
        const toast = await this.toastCtrl.create({
          message: 'Guardando archivo...',
          duration: 0,
          color: 'primary'
        });
        await toast.present();

        try {
          const newFile = await this.wallpaperService.uploadWallpaper(blob, file.name);
          this.wallpapers.push(newFile);
          toast.dismiss();
          this.showToast('Archivo guardado con éxito!', 'success');
        } catch (err) {
          toast.dismiss();
          this.showToast('Error al guardar el archivo.', 'danger');
          console.error('Error al guardar el archivo:', err);
        } finally {
          this.isUploading = false;
        }
      }
    } catch (err) {
      console.error('Error seleccionando archivo:', err);
    }
  }

  private getMimeType(filename: string) {
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
    if (filename.endsWith('.png')) return 'image/png';
    return 'application/octet-stream';
  }

  private base64ToBlob(base64: string, mimeType: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = Array.from(byteCharacters).map(c => c.charCodeAt(0));
    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  }

  async deleteFile(index: number) {
    const file = this.wallpapers[index];
    if (!file) return;

    try {
      await this.wallpaperService.deleteWallpaper(file.id);
      this.wallpapers.splice(index, 1);
      this.showToast('Archivo eliminado con éxito!', 'success');
    } catch (err) {
      console.error('Error al eliminar archivo:', err);
      this.showToast('Error al eliminar el archivo.', 'danger');
    }
  }

  async openFileOptions(index: number) {
    const file = this.wallpapers[index];
    if (!file) return;

    const alert = await this.alertCtrl.create({
      header: 'Opciones del wallpaper',
      buttons: [
        { text: 'Establecer Home Screen', handler: () => this.setWallpaper(file, 'home') },
        { text: 'Establecer Lock Screen', handler: () => this.setWallpaper(file, 'lock') },
        { text: 'Eliminar', role: 'destructive', handler: () => this.deleteFile(index) },
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await alert.present();
  }

  private async setWallpaper(file: WallpaperFile, type: 'home' | 'lock') {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const base64Data = await this.blobToBase64(blob);

      if (type === 'home') {
        await MyWallpaper.setHomeScreenWallpaper({ data: base64Data });
      } else {
        await MyWallpaper.setLockScreenWallpaper({ data: base64Data });
      }

      this.showToast(`Wallpaper aplicado en ${type === 'home' ? 'Home' : 'Lock'}!`, 'success');
    } catch (err) {
      console.error('Error aplicando wallpaper:', err);
      this.showToast('No se pudo establecer el wallpaper.', 'danger');
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  toggleFabOptions() {
    this.fabOptionsVisible = !this.fabOptionsVisible;
  }

  goToUpdateUser() {
    this.router.navigate(['/update-user-info']);
    this.fabOptionsVisible = false;
  }

  async logout() {
    await this.authService.logout();
    this.showToast('Sesión cerrada con éxito', 'warning');
    this.router.navigate(['/login']);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color });
    toast.present();
  }
}
