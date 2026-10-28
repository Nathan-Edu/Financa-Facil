import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

import { Parcela } from '../../../../core/models/parcela.model';

import { Badge } from '../badge/badge';
import { ProgressBar } from '../progress-bar/progress-bar';
import { Button } from '../../forms/button/button';

@Component({
  selector: 'app-parcel-item',
  imports: [
    MatIconModule,
    Badge,
    ProgressBar,
    Button
  ],
  templateUrl: './parcel-item.html',
  styleUrl: './parcel-item.scss'
})
export class ParcelItem {
  @Input({ required: true })
  parcela!: Parcela;

  @Input()
  icon = 'credit_card';

  @Input()
  color = '#3b82f6';

  @Output()
  view = new EventEmitter<Parcela>();

  @Output()
  edit = new EventEmitter<Parcela>();

  @Output()
  pay = new EventEmitter<Parcela>();

  @Output()
  remove = new EventEmitter<Parcela>();

  get statusLabel(): string {
    switch (this.parcela.status) {
      case 'finalizada':
        return 'Finalizada';

      case 'atrasada':
        return 'Atrasada';

      default:
        return 'Ativa';
    }
  }

  get statusColor():
    | 'success'
    | 'danger'
    | 'warning' {
    switch (this.parcela.status) {
      case 'finalizada':
        return 'success';

      case 'atrasada':
        return 'danger';

      default:
        return 'warning';
    }
  }

  get dataVencimentoFormatada(): string {
    const data = this.parcela.dataVencimento;

    if (!data || data === 'Finalizada') {
      return data || '-';
    }

    if (data.includes('/')) {
      return data;
    }

    const [ano, mes, dia] = data.split('-');

    return `${dia}/${mes}/${ano}`;
  }
}