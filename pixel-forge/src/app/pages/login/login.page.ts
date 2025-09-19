import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  selectedLanguage: string = 'es';
  isLoading: boolean = false; // ⚡ evita login múltiple

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    try {
      const savedLang = await Preferences.get({ key: 'lang' });
      if (savedLang.value) {
        this.selectedLanguage = savedLang.value;
        this.translate.use(savedLang.value);
      }
    } catch (err) {
      console.warn('No se pudo cargar idioma guardado:', err);
    }
  }

  async login() {
    if (this.isLoading) return; // ⚡ previene doble envío
    if (!this.email || !this.password) {
      this.showToast(this.translate.instant('LOGIN.FILL_FIELDS'), 'warning');
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.login(this.email, this.password);
      this.showToast(this.translate.instant('LOGIN.SUCCESS'), 'success');
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('❌ Error en login:', error);
      this.showToast(this.translate.instant('LOGIN.ERROR'), 'danger');
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

  // ⚡ Función reusable para toasts
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color });
    toast.present();
  }
}
