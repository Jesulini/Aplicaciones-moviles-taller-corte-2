import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { WallpaperService, WallpaperFile } from '../services/wallpaper';
import { ToastController, AlertController, Platform } from '@ionic/angular';
import { FilePicker } from '@capawesome/capacitor-file-picker';
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
    public router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private platform: Platform,
    public translate: TranslateService  // <-- público
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
      this.currentUser = user ? { id: user.uid, name: user.displayName, email: user.email } : null;
    });
  }

  private async loadWallpapers() {
    this.wallpapers = await this.wallpaperService.listUserWallpapers();
  }

  async pickFileFromGallery() {
    try {
      const result = await FilePicker.pickFiles({ types: ['image/jpeg', 'image/png'], readData: true });
      for (const file of result.files) {
        if (!file.data) continue;
        const mimeType = this.getMimeType(file.name);
        const blob = this.base64ToBlob(file.data as string, mimeType);

        this.isUploading = true;
        const toast = await this.toastCtrl.create({
          message: this.translate.instant('HOME.UPLOADING') + '...',
          duration: 0,
          color: 'primary'
        });
        await toast.present();

        try {
          const newFile = await this.wallpaperService.uploadWallpaper(blob, `${Date.now()}_${file.name}`);
          this.wallpapers.unshift(newFile); // agregamos al inicio
          toast.dismiss();
          this.showToast(this.translate.instant('HOME.UPLOAD_SUCCESS'), 'success');
        } catch (err) {
          toast.dismiss();
          console.error('Error subiendo imagen:', err);
          this.showToast(this.translate.instant('HOME.UPLOAD_FAIL'), 'danger');
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

  async deleteWallpaper(wallpaper: WallpaperFile) {
    const confirm = await this.alertCtrl.create({
      header: this.translate.instant('HOME.CONFIRM_DELETE'),
      message: this.translate.instant('HOME.CONFIRM_DELETE_MSG'),
      buttons: [
        { text: this.translate.instant('HOME.CANCEL'), role: 'cancel' },
        {
          text: this.translate.instant('HOME.DELETE'),
          handler: async () => {
            const ok = await this.wallpaperService.deleteWallpaper(wallpaper.name);
            if (ok) {
              this.wallpapers = this.wallpapers.filter(w => w.name !== wallpaper.name);
              this.showToast(this.translate.instant('HOME.DELETE_SUCCESS'), 'success');
            } else {
              this.showToast(this.translate.instant('HOME.DELETE_FAIL'), 'danger');
            }
          }
        }
      ]
    });
    await confirm.present();
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color });
    toast.present();
  }
}
