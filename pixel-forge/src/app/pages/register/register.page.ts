import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  email: string = '';
  password: string = '';
  nombre: string = '';
  idioma: string = 'es';
  isLoading: boolean = false; // ⚡ evita registro múltiple

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
        this.idioma = savedLang.value;
        this.translate.use(savedLang.value);
      }
    } catch (err) {
      console.warn('No se pudo cargar idioma guardado:', err);
    }
  }

  async register() {
    if (this.isLoading) return; // ⚡ previene doble envío
    if (!this.email || !this.password || !this.nombre) {
      this.showToast(this.translate.instant('REGISTER.FILL_FIELDS'), 'warning');
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.register(this.email, this.password, this.nombre, this.idioma);
      this.showToast(this.translate.instant('REGISTER.SUCCESS'), 'success');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('❌ Error en registro:', error);
      this.showToast(this.translate.instant('REGISTER.ERROR'), 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async changeLanguage(lang: string) {
    this.idioma = lang;
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
