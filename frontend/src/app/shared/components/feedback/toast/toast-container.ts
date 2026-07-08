import { Component } from '@angular/core';

import { Toast, ToastService } from './toast.service';
import { ToastItem } from './toast-item';

@Component({
  selector: 'app-toast-container',
  imports: [ToastItem],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss'
})
export class ToastContainer {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {
    this.toastService.toasts$.subscribe((toasts) => {
      this.toasts = toasts;
    });
  }

  remove(id: number): void {
    this.toastService.remove(id);
  }
}