import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Parcela } from '../../../../core/models/parcela.model';

import { Badge } from '../badge/badge';
import { Button } from '../../forms/button/button';
import { ProgressBar } from '../progress-bar/progress-bar';

@Component({
  selector: 'app-parcel-item',
  imports: [
    Badge,
    Button,
    ProgressBar
  ],
  templateUrl: './parcel-item.html',
  styleUrl: './parcel-item.scss',
})
export class ParcelItem {
  @Input({ required: true }) parcela!: Parcela;

  @Output() view = new EventEmitter<Parcela>();
  @Output() edit = new EventEmitter<Parcela>();
  @Output() pay = new EventEmitter<Parcela>();

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

  get statusColor(): 'success' | 'danger' | 'warning' | 'neutral' {
    switch (this.parcela.status) {
      case 'finalizada':
        return 'success';
      case 'atrasada':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  get dataVencimentoFormatada(): string {
    if (this.parcela.dataVencimento === 'Finalizada') {
      return 'Finalizada';
    }

    const [ano, mes, dia] = this.parcela.dataVencimento.split('-');

    return `${dia}/${mes}/${ano}`;
  }
}