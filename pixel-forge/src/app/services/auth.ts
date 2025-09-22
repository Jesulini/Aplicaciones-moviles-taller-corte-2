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

  /**
   * Registro de usuario con email, password, nombre e idioma
   */
  async register(email: string, password: string, nombre: string, idioma: string) {
    try {
      const cred = await this.afAuth.createUserWithEmailAndPassword(email, password);
      if (cred.user) {
        await cred.user.updateProfile({ displayName: nombre });
        await Preferences.set({ key: 'lang', value: idioma });
      }
      return cred.user;
    } catch (err) {
      console.error('Error en registro:', err);
      throw err;
    }
  }

  /**
   * Login con email y password
   */
  async login(email: string, password: string) {
    try {
      const cred = await this.afAuth.signInWithEmailAndPassword(email, password);
      if (cred.user) {
        const { value } = await Preferences.get({ key: 'lang' });
        if (!value) await Preferences.set({ key: 'lang', value: 'es' });
      }
      return cred.user;
    } catch (err) {
      console.error('Error en login:', err);
      throw err;
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await this.afAuth.signOut();
      await Preferences.clear();
    } catch (err) {
      console.error('Error en logout:', err);
      throw err;
    }
  }

  /**
   * Observable del usuario actual
   */
  getCurrentUser(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }

  /**
   * Devuelve el usuario actual de Firebase (Promise)
   */
  async getCurrentFirebaseUser(): Promise<firebase.User | null> {
    return this.afAuth.currentUser;
  }
}
