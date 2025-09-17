import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { TranslateService } from '@ngx-translate/core';
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

  successMessage: boolean = false;
  errorMessage: boolean = false;

  constructor(
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.afAuth.currentUser.then(user => {
      if (user) {
        this.displayName = user.displayName || '';
        this.email = user.email || '';
      }
    });

    // ✅ Cargar idioma guardado en localStorage
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.selectedLanguage = savedLang;
      this.translate.use(savedLang);
    }
  }

  async updateUser() {
    this.successMessage = false;
    this.errorMessage = false;

    try {
      const user = await this.afAuth.currentUser;
      if (!user) throw new Error('No user logged in');

      // ✅ Reautenticación con la contraseña actual
      const cred = firebase.auth.EmailAuthProvider.credential(user.email!, this.password);
      await user.reauthenticateWithCredential(cred);

      // ✅ Actualizar nombre
      if (this.displayName) {
        await user.updateProfile({ displayName: this.displayName });
      }

      // ✅ Actualizar correo
      if (this.email && this.email !== user.email) {
        await user.updateEmail(this.email);
      }

      // ✅ Actualizar contraseña
      if (this.newPassword) {
        await user.updatePassword(this.newPassword);
      }

      this.successMessage = true;
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      this.errorMessage = true;
    }
  }

  // ✅ Cambio de idioma inmediato
  changeLanguage(lang: string) {
    this.selectedLanguage = lang;
    localStorage.setItem('lang', lang);
    this.translate.use(lang);
  }
}
