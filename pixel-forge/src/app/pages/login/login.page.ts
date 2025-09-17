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
  standalone: false,
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  selectedLanguage: string = 'es';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    const savedLang = await Preferences.get({ key: 'lang' });
    if (savedLang.value) {
      this.selectedLanguage = savedLang.value;
      this.translate.use(savedLang.value);
    }
  }

  async login() {
    try {
      await this.authService.login(this.email, this.password);

      const toast = await this.toastCtrl.create({
        message: this.translate.instant('LOGIN.SUCCESS'),
        duration: 2000,
        color: 'success',
      });
      toast.present();

      this.router.navigate(['/home']);
    } catch (error) {
      console.error('❌ Error en login:', error);

      const toast = await this.toastCtrl.create({
        message: this.translate.instant('LOGIN.ERROR'),
        duration: 2000,
        color: 'danger',
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
