import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  nombre: string = '';
  email: string = '';
  password: string = '';
  idioma: string = 'es';

  constructor(
    private authService: AuthService,
    private router: Router,
    public translate: TranslateService
  ) {
    this.translate.setDefaultLang('es'); // idioma por defecto
    this.translate.use(this.idioma);
  }

  changeLanguage(lang: string) {
    this.idioma = lang;
    this.translate.use(lang);
  }

  async register() {
    try {
      const cred = await this.authService.register(this.email, this.password, this.nombre, this.idioma);
      console.log("✅ Registro exitoso:", cred.user);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error("❌ Error en el registro:", error);
    }
  }
}
