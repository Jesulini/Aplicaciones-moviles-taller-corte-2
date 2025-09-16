import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-floating-button',
  templateUrl: './floating-button.component.html',
  styleUrls: ['./floating-button.component.scss'],
  standalone: false,
})
export class FloatingButtonComponent {
  @Input() icon: string = 'add';
  @Input() color: string = 'primary';
  @Output() onClick = new EventEmitter<void>();
}
