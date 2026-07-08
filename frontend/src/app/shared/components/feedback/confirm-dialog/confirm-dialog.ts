import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Modal } from '../modal/modal';
import { Button } from '../../forms/button/button';

type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'outline'
  | 'ghost';

@Component({
  selector: 'app-confirm-dialog',
  imports: [Modal, Button],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss'
})
export class ConfirmDialog {
  @Input() title = 'Confirmação';
  @Input() message = '';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() confirmColor: ButtonColor = 'danger';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}