import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';

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

  constructor(private authService: AuthService, private router: Router) {}

  async register() {
    try {
      const cred = await this.authService.register(this.email, this.password, this.nombre, this.idioma);
      console.log("✅ Registro exitoso:", cred.user);
      // redirigir al login o home
      this.router.navigate(['/login']);
    } catch (error) {
      console.error("❌ Error en el registro:", error);
    }
  }
}
