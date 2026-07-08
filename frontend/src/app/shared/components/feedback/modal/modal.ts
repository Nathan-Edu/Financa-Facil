import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Button } from '../../forms/button/button';

@Component({
  selector: 'app-modal',
  imports: [Button],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  @Output() close = new EventEmitter<void>();
}