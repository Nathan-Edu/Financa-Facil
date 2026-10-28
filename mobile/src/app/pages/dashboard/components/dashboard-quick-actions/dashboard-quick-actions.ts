import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Button } from '../../../../shared/components/forms/button/button';

@Component({
  selector: 'app-dashboard-quick-actions',
  imports: [
    Button
  ],
  templateUrl: './dashboard-quick-actions.html',
  styleUrl: './dashboard-quick-actions.scss'
})
export class DashboardQuickActions {
  constructor(private router: Router) {}

  navegar(rota: string): void {
    this.router.navigate([rota]);
  }
}