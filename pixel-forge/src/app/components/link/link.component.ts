import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss'],
  standalone: false,
})
export class LinkComponent {
  @Input() text: string = 'Link';
  @Output() onClick = new EventEmitter<void>();
}
