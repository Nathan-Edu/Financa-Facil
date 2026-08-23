import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

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
  styleUrl: './alert-item.scss'
})
export class AlertItem {
  @Input({ required: true })
  alerta!: Alerta;

  @Input()
  compact = false;

  @Output()
  markAsRead = new EventEmitter<Alerta>();

  @Output()
  markAsUnread = new EventEmitter<Alerta>();

  @Output()
  discard = new EventEmitter<Alerta>();

  @Output()
  restore = new EventEmitter<Alerta>();

  get icon(): string {
    switch (this.alerta.tipo) {
      case 'vencimento':
        return 'calendar_month';

      case 'orcamento':
        return 'account_balance_wallet';

      case 'meta':
        return 'flag';

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

  get priorityColor():
    | 'danger'
    | 'warning'
    | 'success' {
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
    const data = this.alerta.data;

    if (!data) {
      return '-';
    }

    if (data.includes('/')) {
      return data;
    }

    const [ano, mes, dia] = data.split('-');

    return `${dia}/${mes}/${ano}`;
  }
}