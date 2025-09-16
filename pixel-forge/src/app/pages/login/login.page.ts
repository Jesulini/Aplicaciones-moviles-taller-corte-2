import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    try {
      const cred = await this.authService.login(this.email, this.password);
      console.log("✅ Login exitoso:", cred.user);
      // Redirigir al home o dashboard
      this.router.navigate(['/home']);
    } catch (error) {
      console.error("❌ Error en el login:", error);
      // Aquí podrías mostrar un toast o alert
    }
  }
}
