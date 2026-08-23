import { Component, Input } from '@angular/core';

import {
  ChartData,
  ChartOptions
} from 'chart.js';

import { BaseChartDirective } from 'ng2-charts';

import { DashboardResumo } from '../../../../core/models/dashboard.model';

import { Card } from '../../../../shared/components/layout/card/card';
import { Button } from '../../../../shared/components/forms/button/button';
import { ProgressBar } from '../../../../shared/components/display/progress-bar/progress-bar';

type DashboardChart =
  | 'comparison'
  | 'balance'
  | 'categories';

@Component({
  selector: 'app-dashboard-analysis',
  imports: [
    Card,
    Button,
    ProgressBar,
    BaseChartDirective
  ],
  templateUrl: './dashboard-analysis.html',
  styleUrl: './dashboard-analysis.scss'
})
export class DashboardAnalysis {
  @Input({ required: true })
  resumo!: DashboardResumo;

  expanded = false;

  activeChart: DashboardChart = 'comparison';

  readonly comparisonType = 'bar' as const;
  readonly balanceType = 'line' as const;
  readonly categoriesType = 'doughnut' as const;

  get percentualDespesas(): number {
    if (!this.resumo || this.resumo.totalReceitas <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (
          this.resumo.totalDespesas /
          this.resumo.totalReceitas
        ) * 100
      )
    );
  }

  /*
   * Gráfico de receitas x despesas.
   * Receita sempre verde e despesa sempre vermelha.
   */
  get comparisonData(): ChartData<'bar'> {
    return {
      labels: ['Período atual'],
      datasets: [
        {
          label: 'Receitas',
          data: [
            this.resumo?.totalReceitas ?? 0
          ],
          backgroundColor: '#22c55e',
          borderColor: '#16a34a',
          borderWidth: 1,
          borderRadius: 8,
          maxBarThickness: 160
        },
        {
          label: 'Despesas',
          data: [
            this.resumo?.totalDespesas ?? 0
          ],
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          borderWidth: 1,
          borderRadius: 8,
          maxBarThickness: 160
        }
      ]
    };
  }

  /*
   * Gráfico de evolução do saldo.
   * Junta receitas e despesas em ordem cronológica.
   */
  get balanceData(): ChartData<'line'> {
    const movimentacoes = [
      ...(this.resumo?.ultimasReceitas ?? []).map(
        (receita) => ({
          data: receita.data,
          valor: receita.valor
        })
      ),

      ...(this.resumo?.ultimasDespesas ?? []).map(
        (despesa) => ({
          data: despesa.data,
          valor: -despesa.valor
        })
      )
    ].sort(
      (a, b) =>
        this.converterData(a.data).getTime() -
        this.converterData(b.data).getTime()
    );

    let saldoAcumulado = 0;

    return {
      labels: movimentacoes.map(
        (movimentacao) =>
          this.formatarDataGrafico(
            movimentacao.data
          )
      ),
      datasets: [
        {
          label: 'Saldo acumulado',
          data: movimentacoes.map(
            (movimentacao) => {
              saldoAcumulado += movimentacao.valor;

              return saldoAcumulado;
            }
          ),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.18)',
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: true
        }
      ]
    };
  }

  /*
   * Gráfico por categoria.
   * Usa a cor personalizada de cada categoria.
   */
  get categoriesData(): ChartData<'doughnut'> {
    const categorias = (
      this.resumo?.categorias ?? []
    ).filter(
      (categoria) =>
        categoria.tipo === 'despesa' &&
        categoria.ativa &&
        (categoria.orcamentoMensal ?? 0) > 0
    );

    return {
      labels: categorias.map(
        (categoria) => categoria.nome
      ),
      datasets: [
        {
          data: categorias.map(
            (categoria) =>
              categoria.orcamentoMensal ?? 0
          ),
          backgroundColor: categorias.map(
            (categoria) => categoria.cor
          ),
          borderColor: this.corDoTema(
            '--surface',
            '#111827'
          ),
          borderWidth: 3,
          hoverOffset: 10
        }
      ]
    };
  }

  /*
   * Opções do gráfico de barras.
   * As cores são obtidas das variáveis do tema.
   */
  get barOptions(): ChartOptions<'bar'> {
    const textColor = this.corDoTema(
      '--text',
      '#111827'
    );

    const mutedColor = this.corDoTema(
      '--text-muted',
      '#64748b'
    );

    const gridColor = this.corDoTema(
      '--border',
      'rgba(148, 163, 184, 0.18)'
    );

    return {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        intersect: false,
        mode: 'index'
      },

      plugins: {
        legend: {
          position: 'bottom',

          labels: {
            color: textColor,
            padding: 18,
            usePointStyle: true,
            pointStyle: 'rectRounded',
            font: {
              size: 12,
              weight: 600
            }
          }
        },

        tooltip: {
          backgroundColor: this.corDoTema(
            '--surface',
            '#111827'
          ),
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: gridColor,
          borderWidth: 1,
          padding: 12,

          callbacks: {
            label: (context) => {
              const value =
                typeof context.raw === 'number'
                  ? context.raw
                  : 0;

              return `${context.dataset.label}: ${this.formatarMoeda(value)}`;
            }
          }
        }
      },

      scales: {
        x: {
          ticks: {
            color: mutedColor,
            font: {
              size: 12
            }
          },

          grid: {
            display: false
          },

          border: {
            color: gridColor
          }
        },

        y: {
          beginAtZero: true,

          ticks: {
            color: mutedColor,

            callback: (value) =>
              Number(value).toLocaleString(
                'pt-BR'
              )
          },

          grid: {
            color: gridColor
          },

          border: {
            color: gridColor
          }
        }
      }
    };
  }

  /*
   * Opções do gráfico de linha.
   */
  get lineOptions(): ChartOptions<'line'> {
    const textColor = this.corDoTema(
      '--text',
      '#111827'
    );

    const mutedColor = this.corDoTema(
      '--text-muted',
      '#64748b'
    );

    const gridColor = this.corDoTema(
      '--border',
      'rgba(148, 163, 184, 0.18)'
    );

    return {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        intersect: false,
        mode: 'index'
      },

      plugins: {
        legend: {
          position: 'bottom',

          labels: {
            color: textColor,
            padding: 18,
            usePointStyle: true,
            font: {
              size: 12,
              weight: 600
            }
          }
        },

        tooltip: {
          backgroundColor: this.corDoTema(
            '--surface',
            '#111827'
          ),
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: gridColor,
          borderWidth: 1,
          padding: 12,

          callbacks: {
            label: (context) => {
              const value =
                typeof context.raw === 'number'
                  ? context.raw
                  : 0;

              return `Saldo: ${this.formatarMoeda(value)}`;
            }
          }
        }
      },

      scales: {
        x: {
          ticks: {
            color: mutedColor,
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8
          },

          grid: {
            display: false
          },

          border: {
            color: gridColor
          }
        },

        y: {
          beginAtZero: true,

          ticks: {
            color: mutedColor,

            callback: (value) =>
              Number(value).toLocaleString(
                'pt-BR'
              )
          },

          grid: {
            color: gridColor
          },

          border: {
            color: gridColor
          }
        }
      }
    };
  }

  /*
   * Opções do gráfico de categorias.
   */
  get doughnutOptions(): ChartOptions<'doughnut'> {
    const textColor = this.corDoTema(
      '--text',
      '#111827'
    );

    const gridColor = this.corDoTema(
      '--border',
      'rgba(148, 163, 184, 0.18)'
    );

    return {
      responsive: true,
      maintainAspectRatio: false,

      cutout: '62%',

      plugins: {
        legend: {
          position: 'bottom',

          labels: {
            color: textColor,
            padding: 18,
            usePointStyle: true,
            pointStyle: 'circle',
            font: {
              size: 12,
              weight: 600
            }
          }
        },

        tooltip: {
          backgroundColor: this.corDoTema(
            '--surface',
            '#111827'
          ),
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: gridColor,
          borderWidth: 1,
          padding: 12,

          callbacks: {
            label: (context) => {
              const value =
                typeof context.raw === 'number'
                  ? context.raw
                  : 0;

              return `${context.label}: ${this.formatarMoeda(value)}`;
            }
          }
        }
      }
    };
  }

  alternar(): void {
    this.expanded = !this.expanded;
  }

  selecionarGrafico(
    grafico: DashboardChart
  ): void {
    this.activeChart = grafico;
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  /*
   * Obtém o valor atual de uma variável CSS.
   * Isso permite que o Chart.js acompanhe o tema.
   */
  private corDoTema(
    variavel: string,
    fallback: string
  ): string {
    const bodyValue = getComputedStyle(
      document.body
    )
      .getPropertyValue(variavel)
      .trim();

    if (bodyValue) {
      return bodyValue;
    }

    const rootValue = getComputedStyle(
      document.documentElement
    )
      .getPropertyValue(variavel)
      .trim();

    return rootValue || fallback;
  }

  private converterData(data: string): Date {
    if (data.includes('/')) {
      const [dia, mes, ano] =
        data.split('/').map(Number);

      return new Date(ano, mes - 1, dia);
    }

    const [ano, mes, dia] =
      data.split('-').map(Number);

    return new Date(ano, mes - 1, dia);
  }

  private formatarDataGrafico(
    data: string
  ): string {
    const dataConvertida =
      this.converterData(data);

    return dataConvertida.toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: '2-digit'
      }
    );
  }
}