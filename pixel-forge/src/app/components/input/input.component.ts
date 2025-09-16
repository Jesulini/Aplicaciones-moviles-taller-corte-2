import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone : false,
  selector: 'app-input',
  template: `
    <ion-item>
      <ion-label position="stacked">{{ label }}</ion-label>
      <ion-input
        [type]="type"
        [placeholder]="placeholder"
        [(ngModel)]="value"
        (ngModelChange)="valueChange.emit($event)">
      </ion-input>
    </ion-item>
  `
})
export class InputComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>(); // 👈 importante
}
