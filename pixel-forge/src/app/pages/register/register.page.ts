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
  standalone: false,
})
export class RegisterPage implements OnInit {
  email: string = '';
  password: string = '';
  nombre: string = '';
  idioma: string = 'es';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    const savedLang = await Preferences.get({ key: 'lang' });
    if (savedLang.value) {
      this.idioma = savedLang.value;
      this.translate.use(savedLang.value);
    }
  }

  async register() {
    try {
      await this.authService.register(this.email, this.password, this.nombre, this.idioma);

      const toast = await this.toastCtrl.create({
        message: this.translate.instant('REGISTER.SUCCESS'),
        duration: 2000,
        color: 'success',
      });
      toast.present();

      this.router.navigate(['/login']);
    } catch (error) {
      console.error('❌ Error en registro:', error);

      const toast = await this.toastCtrl.create({
        message: this.translate.instant('REGISTER.ERROR'),
        duration: 2000,
        color: 'danger',
      });
      toast.present();
    }
  }

  async changeLanguage(lang: string) {
    this.idioma = lang;
    await Preferences.set({ key: 'lang', value: lang });
    this.translate.use(lang);
  }
}
