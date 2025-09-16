import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: false,
})
export class ButtonComponent {
  @Input() label: string = 'Button';
  @Input() color: string = 'primary';
  @Input() expand: 'full' | 'block' | undefined;
  @Input() icon?: string;
  @Output() onClick = new EventEmitter<void>();
}
