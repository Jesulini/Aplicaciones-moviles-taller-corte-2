import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';
import { ToastController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  selectedLanguage: string = 'es';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private translate: TranslateService,
    private platform: Platform
  ) {}

  async ngOnInit() {
    await this.platform.ready();
    try {
      const savedLang = await Preferences.get({ key: 'lang' });
      if (savedLang.value) {
        this.selectedLanguage = savedLang.value;
        this.translate.use(this.selectedLanguage);
      }
    } catch (err) {
      console.warn('No se pudo cargar idioma guardado:', err);
    }
  }

  async login() {
    if (this.isLoading) return;
    if (!this.email || !this.password) {
      this.showToast(this.translate.instant('LOGIN.FILL_FIELDS'), 'warning');
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.login(this.email, this.password);
      this.showToast(this.translate.instant('LOGIN.SUCCESS'), 'success');
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('❌ Error en login:', error.code, error.message);
      let msg = this.translate.instant('LOGIN.ERROR');

      if (error.code === 'auth/user-not-found') msg = 'Usuario no encontrado';
      else if (error.code === 'auth/wrong-password') msg = 'Contraseña incorrecta';
      else if (error.code === 'auth/invalid-email') msg = 'Correo inválido';

      this.showToast(msg, 'danger');
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
