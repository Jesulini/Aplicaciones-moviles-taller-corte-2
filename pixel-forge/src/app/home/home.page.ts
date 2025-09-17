import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ToastController, AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ActionSheet, ActionSheetButtonStyle } from '@capacitor/action-sheet';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  currentUser: any = null;

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

  async showActionSheet() {
    if (this.platform.is('hybrid')) {
      // Dispositivo/emulador -> usar plugin nativo
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
      // Navegador -> usar alert de fallback
      const alert = await this.alertCtrl.create({
        header: this.translate.instant('HOME.ACTIONS_TITLE') || 'Opciones',
        message: this.translate.instant('HOME.ACTIONS_MESSAGE') || 'Selecciona una acción',
        buttons: [
          {
            text: this.translate.instant('HOME.UPDATE_USER') || 'Actualizar usuario',
            handler: () => this.updateUserInfo()
          },
          {
            text: this.translate.instant('HOME.LOGOUT') || 'Cerrar sesión',
            handler: () => this.logout()
          },
          {
            text: this.translate.instant('HOME.CANCEL') || 'Cancelar',
            role: 'cancel'
          }
        ]
      });
      await alert.present();
    }
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
