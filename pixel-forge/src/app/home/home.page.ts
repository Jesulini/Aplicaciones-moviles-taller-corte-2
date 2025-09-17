import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // 🔹 Inicialmente carga la info del usuario
    this.loadUserInfo();
  }

  ionViewWillEnter() {
    // 🔹 Se ejecuta cada vez que regresas a esta vista
    this.loadUserInfo();
  }

  private loadUserInfo() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUser = {
          name: user.displayName || 'Usuario',
          email: user.email
        };
      } else {
        this.currentUser = null;
      }
    });
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  updateUserInfo() {
    this.router.navigate(['/update-user-info']);
  }

  optionThree() {
    console.log("🔹 Opción 3 clickeada");
  }
}
