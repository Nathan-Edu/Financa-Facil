import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { DASHBOARD_MOCK } from '../mock/dashboard.mock';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  carregarResumo(): Observable<typeof DASHBOARD_MOCK> {
    return of(DASHBOARD_MOCK);
  }
}