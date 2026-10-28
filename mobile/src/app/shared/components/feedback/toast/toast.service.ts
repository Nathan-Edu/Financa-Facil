import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private id = 0;

  success(message: string, duration = 4000): void {
    this.show('success', message, duration);
  }

  error(message: string, duration = 4000): void {
    this.show('error', message, duration);
  }

  warning(message: string, duration = 4000): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration = 4000): void {
    this.show('info', message, duration);
  }

  remove(id: number): void {
    const current = this.toastsSubject.value;
    this.toastsSubject.next(current.filter(toast => toast.id !== id));
  }

  private show(type: ToastType, message: string, duration: number): void {
    const toast: Toast = {
      id: ++this.id,
      type,
      message,
      duration
    };

    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    setTimeout(() => {
      this.remove(toast.id);
    }, duration);
  }
}