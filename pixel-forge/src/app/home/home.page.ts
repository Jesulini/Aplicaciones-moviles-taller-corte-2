import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ToastController, AlertController, Platform } from '@ionic/angular';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { WallpaperService, WallpaperFile } from '../services/wallpaper';

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

  constructor(
    private authService: AuthService,
    private wallpaperService: WallpaperService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private platform: Platform
  ) {}

  ngOnInit() {
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
    try {
      this.wallpapers = await this.wallpaperService.listUserWallpapers();
    } catch (err) {
      console.error('Error cargando wallpapers:', err);
    }
  }

  async pickFile() {
    if (!this.currentUser) return;

    try {
      const result = await FilePicker.pickFiles({
        types: ['image/jpeg', 'image/png', 'video/mp4', 'video/webm'],
        readData: true
      });

      for (const file of result.files) {
        if (!file.data) continue;
        
        const mimeType = this.getMimeType(file.name);
        const base64Data = file.data as string;
        const blob = this.base64ToBlob(base64Data, mimeType);

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
          const successToast = await this.toastCtrl.create({
            message: 'Archivo guardado con éxito!',
            duration: 2000,
            color: 'success'
          });
          successToast.present();
          
        } catch (err) {
          toast.dismiss();
          const errorToast = await this.toastCtrl.create({
            message: 'Error al guardar el archivo.',
            duration: 2000,
            color: 'danger'
          });
          errorToast.present();
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
    if (filename.endsWith('.mp4')) return 'video/mp4';
    if (filename.endsWith('.webm')) return 'video/webm';
    return 'application/octet-stream';
  }

  private base64ToBlob(base64: string, mimeType: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  async deleteFile(index: number) {
    const fileToDelete = this.wallpapers[index];
    if (fileToDelete) {
      try {
        await this.wallpaperService.deleteWallpaper(fileToDelete.id);
        this.wallpapers.splice(index, 1);
        const toast = await this.toastCtrl.create({
          message: 'Archivo eliminado con éxito!',
          duration: 2000,
          color: 'success'
        });
        toast.present();
      } catch (err) {
        console.error('Error al eliminar el archivo:', err);
        const toast = await this.toastCtrl.create({
          message: 'Error al eliminar el archivo.',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    }
  }

  async openFileOptions(index: number) {
    const alert = await this.alertCtrl.create({
      header: 'Opciones del wallpaper',
      buttons: [
        { text: 'Eliminar', role: 'destructive', handler: () => this.deleteFile(index) },
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await alert.present();
  }

  async showActionSheet() {
    const alert = await this.alertCtrl.create({
      header: 'Opciones',
      buttons: [
        { text: 'Cerrar sesión', handler: () => this.logout() },
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await alert.present();
  }

  async logout() {
    await this.authService.logout();
    const toast = await this.toastCtrl.create({
      message: 'Sesión cerrada con éxito',
      duration: 2000,
      color: 'warning'
    });
    toast.present();
    this.router.navigate(['/login']);
  }
}
