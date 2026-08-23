import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Alerta } from '../models/alerta.model';
import { PerfilFinanceiroService } from './perfil-financeiro.service';

interface AlertaApi {
  id: string; mensagem: string; lido: boolean; descartado: boolean; dataAlerta: string;
  parcela?: { status: 'PENDENTE' | 'PAGA' | 'VENCIDA' | 'CANCELADA'; contaParcelada: { descricao: string } };
}

@Injectable({ providedIn: 'root' })
export class AlertaService {
  constructor(private readonly http: HttpClient, private readonly perfis: PerfilFinanceiroService) {}

  listar(): Observable<Alerta[]> {
    return this.http.get<AlertaApi[]>(`${API_URL}/alertas`, { params: { perfilId: this.perfis.obterPerfilAtivoId() } }).pipe(
      map((alertas) => alertas.map((alerta) => this.mapear(alerta)))
    );
  }

  criar(): Observable<Alerta> { return throwError(() => new Error('Alertas são gerados automaticamente.')); }
  editar(alerta: Alerta): Observable<boolean> { return this.atualizar(alerta.id, { lido: alerta.visualizado, descartado: alerta.descartado }); }
  marcarComoLido(id: string | number): Observable<boolean> { return this.atualizar(id, { lido: true }); }
  marcarComoNaoLido(id: string | number): Observable<boolean> { return this.atualizar(id, { lido: false }); }
  descartar(id: string | number): Observable<boolean> { return this.atualizar(id, { descartado: true }); }
  restaurar(id: string | number): Observable<boolean> { return this.atualizar(id, { descartado: false }); }
  excluir(id: string | number): Observable<boolean> { return this.descartar(id); }

  private atualizar(id: string | number, dados: { lido?: boolean; descartado?: boolean }): Observable<boolean> {
    return this.http.patch(`${API_URL}/alertas/${id}`, dados).pipe(map(() => true));
  }

  private mapear(alerta: AlertaApi): Alerta {
    const vencido = alerta.parcela?.status === 'VENCIDA';
    return {
      id: alerta.id,
      titulo: vencido ? 'Parcela vencida' : 'Próximo vencimento',
      descricao: alerta.mensagem,
      data: alerta.dataAlerta.slice(0, 10),
      tipo: 'vencimento',
      prioridade: vencido ? 'alta' : 'media',
      visualizado: alerta.lido,
      descartado: alerta.descartado
    };
  }
}
