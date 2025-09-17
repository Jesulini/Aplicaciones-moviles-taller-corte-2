import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) {}

  // 🔹 Registro con idioma
  async register(email: string, password: string, nombre: string, idioma: string) {
    const cred = await this.afAuth.createUserWithEmailAndPassword(email, password);

    if (cred.user) {
      await cred.user.updateProfile({ displayName: nombre });
      // ✅ Guardar idioma en Preferences
      await Preferences.set({ key: 'lang', value: idioma });
    }

    return cred;
  }

  // 🔹 Login
  async login(email: string, password: string) {
    const cred = await this.afAuth.signInWithEmailAndPassword(email, password);

    if (cred.user) {
      // ✅ Recuperar idioma guardado
      const { value } = await Preferences.get({ key: 'lang' });
      if (!value) {
        // si no hay idioma, por defecto español
        await Preferences.set({ key: 'lang', value: 'es' });
      }
    }

    return cred;
  }

  // 🔹 Logout limpia todo
  async logout() {
    await this.afAuth.signOut();
    await Preferences.clear(); // ✅ borra idioma y datos guardados
  }

  // 🔹 Método público para obtener el usuario actual
  getCurrentUser(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }
}
