import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ToastController, AlertController, Platform } from '@ionic/angular';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { WallpaperService, WallpaperFile } from '../services/wallpaper';
import { TranslateService } from '@ngx-translate/core';

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
    private platform: Platform,
    private translate: TranslateService
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

  // FAB izquierdo: abrir galería
  async pickFileFromGallery() {
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
          message: this.translate.instant('HOME.ACTIONS_MESSAGE') + '...', // mensaje traducido
          duration: 0,
          color: 'primary'
        });
        await toast.present();

        try {
          const newFile = await this.wallpaperService.uploadWallpaper(blob, file.name);
          this.wallpapers.push(newFile);
          toast.dismiss();
          this.showToast(this.translate.instant('HOME.LOGOUT_SUCCESS'), 'success');
        } catch (err) {
          toast.dismiss();
          this.showToast(this.translate.instant('UPDATE_USER_INFO.ERROR'), 'danger');
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

  // FAB derecho: menú con opciones traducidas
  async openFabOptions() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('HOME.ACTIONS_TITLE'),
      message: this.translate.instant('HOME.ACTIONS_MESSAGE'),
      buttons: [
        {
          text: this.translate.instant('HOME.UPDATE_USER'),
          handler: () => this.router.navigate(['/update-user-info'])
        },
        {
          text: this.translate.instant('HOME.LOGOUT'),
          role: 'destructive',
          handler: () => this.logout()
        },
        { text: this.translate.instant('HOME.CANCEL'), role: 'cancel' }
      ]
    });
    await alert.present();
  }

  async logout() {
    await this.authService.logout();
    this.showToast(this.translate.instant('HOME.LOGOUT_SUCCESS'), 'warning');
    this.router.navigate(['/login']);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color });
    toast.present();
  }
}
