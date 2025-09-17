import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    // ✅ Idioma por defecto
    this.translate.setDefaultLang('es');

    // ✅ Cargar idioma guardado en localStorage
    const lang = localStorage.getItem('lang') || 'es';
    this.translate.use(lang);
  }
}
