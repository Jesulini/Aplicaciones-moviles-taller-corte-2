import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  currentUser: firebase.User | null = null;
  fabOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // 🔹 Usamos el método público
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout().then(() => {
      console.log('✅ Usuario deslogueado');
    });
  }

  updateUserInfo() {
    console.log('🔹 Actualizar info del usuario');
  }
}
