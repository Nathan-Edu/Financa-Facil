import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { Alerta } from '../../../../core/models/alerta.model';
import { Badge } from '../badge/badge';
import { Button } from '../../forms/button/button';

@Component({
  selector: 'app-alert-item',
  imports: [
    MatIconModule,
    Badge,
    Button
  ],
  templateUrl: './alert-item.html',
  styleUrl: './alert-item.scss',
})
export class AlertItem {
  @Input({ required: true }) alerta!: Alerta;

  @Output() markAsRead = new EventEmitter<Alerta>();
  @Output() discard = new EventEmitter<Alerta>();
  @Input() compact = false;

  get icon(): string {
    switch (this.alerta.tipo) {
      case 'vencimento':
        return 'calendar_month';

      case 'orcamento':
        return 'attach_money';

      case 'meta':
        return 'check_circle';

      default:
        return 'info';
    }
  }

  get priorityLabel(): string {
    switch (this.alerta.prioridade) {
      case 'alta':
        return 'Alta';

      case 'media':
        return 'Média';

      default:
        return 'Baixa';
    }
  }

  get priorityColor(): 'danger' | 'warning' | 'success' {
    switch (this.alerta.prioridade) {
      case 'alta':
        return 'danger';

      case 'media':
        return 'warning';

      default:
        return 'success';
    }
  }

  get formattedDate(): string {
    const [year, month, day] = this.alerta.data.split('-');
    return `${day}/${month}/${year}`;
  }
}