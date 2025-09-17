import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ToastController, AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ActionSheet, ActionSheetButtonStyle } from '@capacitor/action-sheet';
import { FilePicker } from '@capawesome/capacitor-file-picker';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  currentUser: any = null;
  selectedFiles: any[] = []; // array para múltiples archivos

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
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUser = {
          name: user.displayName || 'Usuario',
          email: user.email
        };
      } else {
        this.currentUser = null;
      }
    });
  }

  // --- Action Sheet general híbrido ---
  async showActionSheet() {
    if (this.platform.is('hybrid')) {
      const result = await ActionSheet.showActions({
        title: this.translate.instant('HOME.ACTIONS_TITLE') || 'Opciones',
        message: this.translate.instant('HOME.ACTIONS_MESSAGE') || 'Selecciona una acción',
        options: [
          { title: this.translate.instant('HOME.UPDATE_USER') || 'Actualizar usuario' },
          { title: this.translate.instant('HOME.LOGOUT') || 'Cerrar sesión' },
          { title: this.translate.instant('HOME.CANCEL') || 'Cancelar', style: ActionSheetButtonStyle.Cancel }
        ]
      });

      if (result.index === 0) this.updateUserInfo();
      else if (result.index === 1) this.logout();
    } else {
      const alert = await this.alertCtrl.create({
        header: this.translate.instant('HOME.ACTIONS_TITLE') || 'Opciones',
        message: this.translate.instant('HOME.ACTIONS_MESSAGE') || 'Selecciona una acción',
        buttons: [
          { text: this.translate.instant('HOME.UPDATE_USER') || 'Actualizar usuario', handler: () => this.updateUserInfo() },
          { text: this.translate.instant('HOME.LOGOUT') || 'Cerrar sesión', handler: () => this.logout() },
          { text: this.translate.instant('HOME.CANCEL') || 'Cancelar', role: 'cancel' }
        ]
      });
      await alert.present();
    }
  }

  // --- Selección de múltiples archivos ---
  async pickFile() {
    try {
      const result = await FilePicker.pickFiles({
        types: ['image/*', 'video/*'],
        readData: true
      });

      if (result.files.length > 0) {
        result.files.forEach(file => {
          this.selectedFiles.push({
            name: file.name,
            type: file.mimeType,
            data: 'data:' + file.mimeType + ';base64,' + file.data
          });
        });
      }
    } catch (error) {
      console.log('No se seleccionó ningún archivo o hubo error:', error);
    }
  }

  // --- Action Sheet híbrido para cada archivo ---
  async openFileOptions(fileIndex: number) {
    if (this.platform.is('hybrid')) {
      try {
        const result = await ActionSheet.showActions({
          title: 'Opciones del wallpaper',
          message: 'Selecciona una acción',
          options: [
            { title: 'Eliminar wallpaper', style: ActionSheetButtonStyle.Destructive },
            { title: 'Establecer como fondo de pantalla' },
            { title: 'Establecer como fondo de bloqueo' },
            { title: 'Cancelar', style: ActionSheetButtonStyle.Cancel }
          ]
        });

        switch (result.index) {
          case 0:
            this.deleteFile(fileIndex);
            break;
          case 1:
            this.setAsWallpaper(fileIndex);
            break;
          case 2:
            this.setAsLockScreen(fileIndex);
            break;
          default:
            break;
        }
      } catch (error) {
        console.log('Error al abrir opciones del archivo:', error);
      }
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Opciones del wallpaper',
        message: 'Selecciona una acción',
        buttons: [
          { text: 'Eliminar wallpaper', role: 'destructive', handler: () => this.deleteFile(fileIndex) },
          { text: 'Establecer como fondo de pantalla', handler: () => this.setAsWallpaper(fileIndex) },
          { text: 'Establecer como fondo de bloqueo', handler: () => this.setAsLockScreen(fileIndex) },
          { text: 'Cancelar', role: 'cancel' }
        ]
      });
      await alert.present();
    }
  }

  // --- Métodos auxiliares para archivos ---
  deleteFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  setAsWallpaper(index: number) {
    const file = this.selectedFiles[index];
    console.log('Establecer como fondo de pantalla:', file.name);
    // Aquí implementas la lógica real según plataforma
  }

  setAsLockScreen(index: number) {
    const file = this.selectedFiles[index];
    console.log('Establecer como fondo de bloqueo:', file.name);
    // Aquí implementas la lógica real según plataforma
  }

  async logout() {
    await this.authService.logout();

    const toast = await this.toastCtrl.create({
      message: this.translate.instant('HOME.LOGOUT_SUCCESS') || 'Sesión cerrada con éxito',
      duration: 2000,
      color: 'warning'
    });
    toast.present();

    this.router.navigate(['/login']);
  }

  updateUserInfo() {
    this.router.navigate(['/update-user-info']);
  }
}
