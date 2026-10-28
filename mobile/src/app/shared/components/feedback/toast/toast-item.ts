import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { Toast, ToastType } from './toast.service';

@Component({
  selector: 'app-toast-item',
  imports: [MatIconModule],
  templateUrl: './toast-item.html',
  styleUrl: './toast-item.scss'
})
export class ToastItem {
  @Input() toast!: Toast;

  @Output() close = new EventEmitter<number>();

  icon(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }
}