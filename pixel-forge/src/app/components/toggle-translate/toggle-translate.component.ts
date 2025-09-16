import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toggle-translate',
  templateUrl: './toggle-translate.component.html',
  styleUrls: ['./toggle-translate.component.scss'],
  standalone: false,
})
export class ToggleTranslateComponent {
  @Input() label: string = '';   // 👈 AHORA sí existe
  @Input() isChecked: boolean = false;
  @Output() toggled = new EventEmitter<boolean>();

  onToggleChange(event: any) {
    const value = event.detail?.checked ?? event; // soporta ionic o boolean directo
    this.isChecked = value;
    this.toggled.emit(value);
  }
}
