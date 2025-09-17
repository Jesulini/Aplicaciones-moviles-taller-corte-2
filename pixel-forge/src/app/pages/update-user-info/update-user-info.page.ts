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
  standalone: false,
})
export class UpdateUserInfoPage implements OnInit {
  displayName: string = '';
  email: string = '';
  password: string = '';
  newPassword: string = '';
  selectedLanguage: string = 'es';

  constructor(
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private translate: TranslateService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.afAuth.currentUser.then(user => {
      if (user) {
        this.displayName = user.displayName || '';
        this.email = user.email || '';
      }
    });

    // ✅ cargar idioma con Preferences
    this.loadLang();
  }

  async loadLang() {
    const { value } = await Preferences.get({ key: 'lang' });
    if (value) {
      this.selectedLanguage = value;
      this.translate.use(value);
    }
  }

  async updateUser() {
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

      const toast = await this.toastCtrl.create({
        message: this.translate.instant('UPDATE_USER_INFO.SUCCESS'),
        duration: 2000,
        color: 'success'
      });
      toast.present();

    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);

      const toast = await this.toastCtrl.create({
        message: this.translate.instant('UPDATE_USER_INFO.ERROR'),
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }

  async changeLanguage(lang: string) {
    this.selectedLanguage = lang;
    await Preferences.set({ key: 'lang', value: lang });
    this.translate.use(lang);
  }
}
