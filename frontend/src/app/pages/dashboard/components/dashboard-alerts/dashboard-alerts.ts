import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Alerta } from '../../../../core/models/alerta.model';

import { Card } from '../../../../shared/components/layout/card/card';
import { Button } from '../../../../shared/components/forms/button/button';
import { AlertItem } from '../../../../shared/components/display/alert-item/alert-item';
import { EmptyState } from '../../../../shared/components/feedback/empty-state/empty-state';

@Component({
  selector: 'app-dashboard-alerts',
  imports: [
    Card,
    Button,
    AlertItem,
    EmptyState
  ],
  templateUrl: './dashboard-alerts.html',
  styleUrl: './dashboard-alerts.scss'
})
export class DashboardAlerts {
  @Input() alertas: Alerta[] = [];

  constructor(private router: Router) {}

  abrirAlertas(): void {
    this.router.navigate(['/alertas']);
  }
}