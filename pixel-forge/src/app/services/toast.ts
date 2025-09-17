import { Injectable } from '@angular/core';
import { Toast } from '@capacitor/toast';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private platform: Platform) {}

  async show(message: string, duration: number = 2000, color: string = 'dark') {
    if (this.platform.is('capacitor')) {
      // ✅ En móviles (nativo)
      await Toast.show({
        text: message,
        duration: 'short',
      });
    } else {
      // ✅ En navegador (simulación con IonToast)
      const toast = document.createElement('ion-toast');
      toast.message = message;
      toast.duration = duration;
      toast.color = color;
      document.body.appendChild(toast);
      await toast.present();
    }
  }
}
