import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ToastController, AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';

interface WallpaperFile {
  name: string;
  url: string;
  type: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  currentUser: any = null;
  selectedFiles: WallpaperFile[] = [];
  private storage = getStorage();

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  ionViewWillEnter() {
    this.loadUserInfo();
  }

  private loadUserInfo() {
    this.authService.getCurrentUser().subscribe(async user => {
      if (user) {
        this.currentUser = {
          id: user.uid,
          name: user.displayName || 'Usuario',
          email: user.email || ''
        };
        await this.loadUserWallpapers();
      } else {
        this.currentUser = null;
      }
    });
  }

  private async loadUserWallpapers() {
    if (!this.currentUser) return;

    try {
      const userRef = ref(this.storage, `wallpapers/${this.currentUser.id}`);
      const list = await listAll(userRef);

      const files: WallpaperFile[] = [];
      for (const itemRef of list.items) {
        const url = await getDownloadURL(itemRef);
        files.push({ name: itemRef.name, url, type: this.getMimeType(itemRef.name) });
      }
      this.selectedFiles = files;
    } catch (err) {
      console.error('Error cargando wallpapers:', err);
    }
  }

  private getMimeType(filename: string) {
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
    if (filename.endsWith('.png')) return 'image/png';
    if (filename.endsWith('.mp4')) return 'video/mp4';
    if (filename.endsWith('.webm')) return 'video/webm';
    return 'application/octet-stream';
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

        // Convertir Base64 a ArrayBuffer
        const arrayBuffer = Uint8Array.from(atob(file.data), c => c.charCodeAt(0));

        const fileRef = ref(this.storage, `wallpapers/${this.currentUser.id}/${file.name}`);
        await uploadBytes(fileRef, arrayBuffer);

        const url = await getDownloadURL(fileRef);
        this.selectedFiles.push({ name: file.name, url, type: file.mimeType || 'application/octet-stream' });
      }
    } catch (err) {
      console.error('Error subiendo archivo:', err);
    }
  }

  async deleteFile(index: number) {
    const file = this.selectedFiles[index];
    try {
      const fileRef = ref(this.storage, `wallpapers/${this.currentUser.id}/${file.name}`);
      await deleteObject(fileRef);
      this.selectedFiles.splice(index, 1);
    } catch (err) {
      console.error('Error eliminando archivo:', err);
    }
  }

  // Para el ActionSheet de cada archivo
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
