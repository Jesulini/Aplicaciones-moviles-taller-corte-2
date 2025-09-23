import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { WallpaperService, WallpaperFile } from '../services/wallpaper';
import { ToastController, AlertController, Platform } from '@ionic/angular';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { TranslateService } from '@ngx-translate/core';
import MyCustomPlugin from '../plugins/MyCustomPlugin';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  currentUser: any = null;
  wallpapers: WallpaperFile[] = [];
  displayedWallpapers: WallpaperFile[] = [];
  itemsPerPage = 6;
  isUploading = false;
  fabOptionsVisible = false;

  public async callPlugin() {
    console.log('Calling the plugin...');
    const resp = await MyCustomPlugin.execute();
    console.log('LOG RESPONSE FROM PLUGIN', JSON.stringify(resp));
  }

  constructor(
    private authService: AuthService,
    private wallpaperService: WallpaperService,
    public router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private platform: Platform,
    public translate: TranslateService
  ) {}

  async ngOnInit() {
    await this.platform.ready();
    this.loadUserInfo();
    await this.loadWallpapers();
  }

  ionViewWillEnter() {
    this.loadUserInfo();
    this.loadWallpapers();
  }

  private loadUserInfo() {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user
        ? { id: user.uid, name: user.displayName, email: user.email }
        : null;
    });
  }

  private async loadWallpapers() {
    this.wallpapers = await this.wallpaperService.listUserWallpapers();
    this.loadInitialWallpapers();
  }

  private loadInitialWallpapers() {
    this.displayedWallpapers = this.wallpapers.slice(0, this.itemsPerPage);
  }

  loadMoreWallpapers(event: any) {
    setTimeout(() => {
      const nextItems = this.wallpapers.slice(
        this.displayedWallpapers.length,
        this.displayedWallpapers.length + this.itemsPerPage
      );
      this.displayedWallpapers = [...this.displayedWallpapers, ...nextItems];

      event.target.complete();

      if (this.displayedWallpapers.length >= this.wallpapers.length) {
        event.target.disabled = true;
      }
    }, 500);
  }

  async pickFileFromGallery() {
    try {
      const result = await FilePicker.pickFiles({
        types: ['image/jpeg', 'image/png'],
        readData: true,
      });

      for (const file of result.files) {
        if (!file.data) continue;
        const mimeType = this.getMimeType(file.name);
        const blob = this.base64ToBlob(file.data as string, mimeType);

        this.isUploading = true;
        const toast = await this.toastCtrl.create({
          message: this.translate.instant('HOME.UPLOADING') + '...',
          duration: 0,
          color: 'primary',
        });
        await toast.present();

        try {
          const newFile = await this.wallpaperService.uploadWallpaper(
            blob,
            `${Date.now()}_${file.name}`
          );
          this.wallpapers.unshift(newFile);
          this.displayedWallpapers.unshift(newFile);
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
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg'))
      return 'image/jpeg';
    if (filename.endsWith('.png')) return 'image/png';
    return 'application/octet-stream';
  }

  private base64ToBlob(base64: string, mimeType: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = Array.from(byteCharacters).map(c => c.charCodeAt(0));
    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  }

  async openWallpaperOptions(wallpaper: WallpaperFile) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('HOME.ACTIONS_TITLE'),
      buttons: [
        {
          text: 'Ejecutar Plugin',
          handler: async () => {
            try {
              console.log('Ejecutando plugin...');
              const resp = await MyCustomPlugin.execute();
              console.log('Respuesta del plugin:', resp);
              this.showToast('Plugin ejecutado con éxito', 'success');
            } catch (err) {
              console.error('Error ejecutando plugin:', err);
              this.showToast('Error ejecutando plugin', 'danger');
            }
          }
        },
        {
          text: 'Fondo Inicio',
          handler: async () => {
            await this.setWallpaper(wallpaper, 'home');
          }
        },
        {
          text: 'Fondo Bloqueo',
          handler: async () => {
            await this.setWallpaper(wallpaper, 'lock');
          }
        },
        {
          text: 'Fondo Ambos',
          handler: async () => {
            await this.setWallpaper(wallpaper, 'both');
          }
        },
        {
          text: this.translate.instant('HOME.DELETE'),
          role: 'destructive',
          handler: () => {
            this.deleteWallpaper(wallpaper);
          }
        },
        {
          text: this.translate.instant('HOME.CANCEL'),
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  private async setWallpaper(wallpaper: WallpaperFile, type: 'home' | 'lock' | 'both') {
    try {
      // Descargar la imagen y convertirla en Base64
      const response = await fetch(wallpaper.url);
      const blob = await response.blob();
      const base64 = await this.blobToBase64(blob);

      const resp = await MyCustomPlugin.setWallpaper({
        imageBase64: base64,
        type
      });

      console.log('Respuesta setWallpaper:', resp);
      this.showToast(`Fondo establecido (${type})`, 'success');
    } catch (err) {
      console.error('Error estableciendo wallpaper:', err);
      this.showToast('Error al establecer fondo', 'danger');
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(',')[1]; // quitar encabezado data:
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async deleteWallpaper(wallpaper: WallpaperFile) {
    const ok = await this.wallpaperService.deleteWallpaper(wallpaper.name);
    if (ok) {
      this.wallpapers = this.wallpapers.filter(w => w.name !== wallpaper.name);
      this.displayedWallpapers = this.displayedWallpapers.filter(
        w => w.name !== wallpaper.name
      );
      this.showToast(this.translate.instant('HOME.DELETE_SUCCESS'), 'success');
    } else {
      this.showToast(this.translate.instant('HOME.DELETE_FAIL'), 'danger');
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'success'
  ) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color });
    toast.present();
  }
}
