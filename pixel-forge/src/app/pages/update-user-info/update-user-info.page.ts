import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { TranslateService } from '@ngx-translate/core';
import { ToastController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-update-user-info',
  templateUrl: './update-user-info.page.html',
  styleUrls: ['./update-user-info.page.scss'],
})
export class UpdateUserInfoPage implements OnInit {
  displayName: string = '';
  email: string = '';
  password: string = '';
  newPassword: string = '';
  selectedLanguage: string = 'es';
  isLoading: boolean = false; // ⚡ evita clics múltiples

  constructor(
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private translate: TranslateService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadLang();
  }

  async loadUserData() {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        this.displayName = user.displayName || '';
        this.email = user.email || '';
      }
    } catch (err) {
      console.error('Error cargando datos del usuario:', err);
    }
  }

  async loadLang() {
    try {
      const { value } = await Preferences.get({ key: 'lang' });
      if (value) {
        this.selectedLanguage = value;
        this.translate.use(value);
      }
    } catch (err) {
      console.warn('No se pudo cargar idioma guardado:', err);
    }
  }

  async updateUser() {
    if (this.isLoading) return;
    if (!this.password) {
      return this.showToast(this.translate.instant('UPDATE_USER_INFO.PASSWORD_REQUIRED'), 'warning');
    }

    this.isLoading = true;
    try {
      const user = await this.afAuth.currentUser;
      if (!user) throw new Error('No user logged in');

      const cred = firebase.auth.EmailAuthProvider.credential(user.email!, this.password);
      await user.reauthenticateWithCredential(cred);

      if (this.displayName) {
        await user.updateProfile({ displayName: this.displayName });
      }
      if (this.email && this.email !== user.email) {
        await user.updateEmail(this.email);
      }
      if (this.newPassword) {
        await user.updatePassword(this.newPassword);
      }

      this.showToast(this.translate.instant('UPDATE_USER_INFO.SUCCESS'), 'success');

    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      this.showToast(this.translate.instant('UPDATE_USER_INFO.ERROR'), 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async changeLanguage(lang: string) {
    this.selectedLanguage = lang;
    try {
      await Preferences.set({ key: 'lang', value: lang });
      this.translate.use(lang);
    } catch (err) {
      console.warn('No se pudo cambiar idioma:', err);
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color });
    toast.present();
  }
}
