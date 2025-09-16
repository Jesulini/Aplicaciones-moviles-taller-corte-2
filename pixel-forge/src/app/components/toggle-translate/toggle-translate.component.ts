import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toggle-translate',
  templateUrl: './toggle-translate.component.html',
  styleUrls: ['./toggle-translate.component.scss'],
  standalone: false,
})
export class ToggleTranslateComponent {
  @Input() label: string = 'Translate';
  @Input() isChecked: boolean = false;
  @Output() toggled = new EventEmitter<boolean>();

  onToggleChange() {
    this.toggled.emit(this.isChecked);
  }
}
