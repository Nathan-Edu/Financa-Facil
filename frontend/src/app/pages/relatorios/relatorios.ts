import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BaseChartDirective } from 'ng2-charts';

import {
  ChartConfiguration,
  ChartOptions
} from 'chart.js';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { PageHeader } from '../../shared/components/layout/page-header/page-header';
import { Card } from '../../shared/components/layout/card/card';
import { Button } from '../../shared/components/forms/button/button';

import { RelatorioService } from '../../core/services/relatorio.service';
import { PerfilFinanceiroService } from '../../core/services/perfil-financeiro.service';

import {
  CategoriaRelatorio,
  EvolucaoMensalRelatorio,
  MovimentacaoRelatorio,
  RelatorioFinanceiro
} from '../../core/models/relatorio.model';


@Component({
  selector: 'app-relatorios',

  imports: [
  FormsModule,
  PageHeader,
  Card,
  Button,
  BaseChartDirective
],



  templateUrl: './relatorios.html',
  styleUrl: './relatorios.scss'
})
export class Relatorios implements OnInit {

  opcoesGraficoReceitasDespesas: ChartOptions<'line'> = {

  responsive: true,

  maintainAspectRatio: false,

  interaction: {
    mode: 'index',
    intersect: false
  },

  plugins: {

    legend: {
      display: true,
      position: 'top',
      align: 'end',

      labels: {
        color: '#cbd5e1',
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 18,

        font: {
          size: 12,
          weight: 600
        }
      }
    },

    tooltip: {
      callbacks: {

        label: context => {

          const valor =
            Number(context.raw);

          return (
            `${context.dataset.label}: ` +
            valor.toLocaleString(
              'pt-BR',
              {
                style: 'currency',
                currency: 'BRL'
              }
            )
          );

        }

      }
    }

  },

  scales: {

    x: {

      grid: {
        display: false
      },

      ticks: {
        color: '#94a3b8'
      },

      border: {
        color: '#475569'
      }

    },

    y: {

      beginAtZero: true,

      grid: {
        color: 'rgba(148, 163, 184, 0.12)'
      },

      ticks: {

        color: '#94a3b8',

        callback: value => {

          return Number(value)
            .toLocaleString(
              'pt-BR',
              {
                style: 'currency',
                currency: 'BRL',
                maximumFractionDigits: 0
              }
            );

        }

      },

      border: {
        display: false
      }

    }

  }

};

  categorias: string[] = [];

  // =====================================================
  // FILTROS
  // =====================================================

  periodoSelecionado = 'todos';

  categoriaSelecionada = 'todas';

  tipoSelecionado = 'todos';


  // =====================================================
  // PERFIL FINANCEIRO
  // =====================================================

  perfilFinanceiroId: string | number = '';

  nomePerfil = '';

  tipoPerfil: 'pessoal' | 'empresa' = 'pessoal';

  // =====================================================
// GRÁFICO - RECEITAS X DESPESAS
// =====================================================

graficoReceitasDespesas: ChartConfiguration<'line'>['data'] = {
  labels: [],

  datasets: [
    {
      data: [],
      label: 'Receitas',

      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.10)',

      pointBackgroundColor: '#22c55e',
      pointBorderColor: '#22c55e',

      pointRadius: 4,
      pointHoverRadius: 6,

      borderWidth: 3,

      tension: 0.35,

      fill: true
    },

    {
      data: [],
      label: 'Despesas',

      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.08)',

      pointBackgroundColor: '#ef4444',
      pointBorderColor: '#ef4444',

      pointRadius: 4,
      pointHoverRadius: 6,

      borderWidth: 3,

      tension: 0.35,

      fill: true
    }
  ]
};

// =====================================================
// GRÁFICO - DESPESAS POR CATEGORIA
// =====================================================

graficoDespesasCategoria: ChartConfiguration<'doughnut'>['data'] = {
  labels: [],

  datasets: [
    {
      data: [],

      backgroundColor: [
        '#ef4444',
        '#f97316',
        '#eab308',
        '#8b5cf6',
        '#3b82f6',
        '#14b8a6',
        '#ec4899',
        '#84cc16'
      ],

      borderWidth: 0,

      hoverOffset: 8
    }
  ]
};


opcoesGraficoDespesasCategoria: ChartOptions<'doughnut'> = {

  responsive: true,

  maintainAspectRatio: false,

  cutout: '68%',

  plugins: {

    legend: {
      display: false
    },

    tooltip: {

      callbacks: {

        label: context => {

          const valor =
            Number(context.raw ?? 0);

          const valorFormatado =
            valor.toLocaleString(
              'pt-BR',
              {
                style: 'currency',
                currency: 'BRL'
              }
            );

          return `${context.label}: ${valorFormatado}`;
        }

      }

    }

  }

};

private criarOpcoesGraficoPdf(): ChartOptions<'line'> {

  return {

    responsive: false,

    maintainAspectRatio: false,

    animation: false,

    interaction: {
      mode: 'index',
      intersect: false
    },

    plugins: {

      legend: {

        display: true,

        position: 'top',

        align: 'end',

        labels: {

          color: '#334155',

          usePointStyle: true,

          pointStyle: 'circle',

          padding: 18,

          font: {
            size: 12,
            weight: 600
          }

        }

      }

    },

    scales: {

      x: {

        grid: {
          display: false
        },

        ticks: {
          color: '#475569',
          font: {
            size: 11
          }
        },

        border: {
          color: '#cbd5e1'
        }

      },

      y: {

        beginAtZero: true,

        grid: {
          color: 'rgba(100, 116, 139, 0.20)'
        },

        ticks: {

          color: '#475569',

          font: {
            size: 11
          },

          callback: value => {

            return Number(value)
              .toLocaleString(
                'pt-BR',
                {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0
                }
              );

          }

        },

        border: {
          display: false
        }

      }

    }

  };

}

// =====================================================
// ATUALIZAR GRÁFICO
// =====================================================

private atualizarGraficoReceitasDespesas(): void {

  const labels =
    this.evolucaoMensal.map(
      item =>
        this.formatarMesGrafico(
          item.mes
        )
    );

  const receitas =
    this.evolucaoMensal.map(
      item => item.receitas
    );

  const despesas =
    this.evolucaoMensal.map(
      item => item.despesas
    );


  this.graficoReceitasDespesas = {

    labels,

    datasets: [

      {
        ...this.graficoReceitasDespesas
          .datasets[0],

        data: receitas
      },

      {
        ...this.graficoReceitasDespesas
          .datasets[1],

        data: despesas
      }

    ]

  };

}

private formatarMesGrafico(
  mes: string
): string {

  const [
    ano,
    numeroMes
  ] = mes.split('-');


  const meses = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez'
  ];


  const indice =
    Number(numeroMes) - 1;


  return `${meses[indice]}/${ano.slice(2)}`;

}

private atualizarGraficoDespesasCategoria(): void {

  const labels =
    this.despesasPorCategoria.map(
      item => item.categoria
    );

  const valores =
    this.despesasPorCategoria.map(
      item => item.valor
    );

  this.graficoDespesasCategoria = {

    labels,

    datasets: [
      {
        ...this.graficoDespesasCategoria
          .datasets[0],

        data: valores
      }
    ]

  };

}

  // =====================================================
  // INDICADORES
  // =====================================================

  totalReceitas = 0;

  totalDespesas = 0;

  saldo = 0;

  percentualEconomia = 0;


  // =====================================================
  // DADOS DO RELATÓRIO
  // =====================================================

  movimentacoes: MovimentacaoRelatorio[] = [];

  movimentacoesExibidas: MovimentacaoRelatorio[] = [];

  evolucaoMensal: EvolucaoMensalRelatorio[] = [];

  despesasPorCategoria: CategoriaRelatorio[] = [];

  receitasPorCategoria: CategoriaRelatorio[] = [];

  // =====================================================
  // ESTADO
  // =====================================================

  carregando = false;


  constructor(
    private readonly relatorioService: RelatorioService,
    private readonly perfilService: PerfilFinanceiroService
  ) {}


  ngOnInit(): void {

    this.carregarPerfilAtual();

  }


  // =====================================================
  // PERFIL ATUAL
  // =====================================================

  private carregarPerfilAtual(): void {
    this.perfilService.buscarPerfilAtivo().subscribe({
      next: (perfil) => {
        if (!perfil) return;
        this.perfilFinanceiroId = perfil.id;
        this.nomePerfil = perfil.nome;
        this.tipoPerfil = perfil.tipo;
        this.carregarRelatorio();
      }
    });
  }


  // =====================================================
  // CARREGAR RELATÓRIO
  // =====================================================

  carregarRelatorio(): void {

    this.carregando = true;

    this.relatorioService
      .buscarRelatorio(
        this.perfilFinanceiroId,
        this.tipoPerfil
      )
      .subscribe({

        next: (
          relatorio: RelatorioFinanceiro
        ) => {

          this.aplicarDadosRelatorio(
            relatorio
          );

          this.carregando = false;

        },

        error: () => {

          this.carregando = false;

        }

      });

  }


  // =====================================================
  // APLICAR DADOS
  // =====================================================

private aplicarDadosRelatorio(
  relatorio: RelatorioFinanceiro
): void {

  // =========================
  // INDICADORES
  // =========================

  this.totalReceitas =
    relatorio.resumo.totalReceitas;

  this.totalDespesas =
    relatorio.resumo.totalDespesas;

  this.saldo =
    relatorio.resumo.saldo;

  this.percentualEconomia =
    relatorio.resumo.percentualEconomia;


  // =========================
  // MOVIMENTAÇÕES
  // =========================

  this.movimentacoes =
    relatorio.movimentacoes;

  this.movimentacoesExibidas = [
    ...relatorio.movimentacoes
  ];


  // =========================
  // EVOLUÇÃO MENSAL
  // =========================

  this.evolucaoMensal =
    relatorio.evolucaoMensal;

  this.atualizarGraficoReceitasDespesas();


  // =========================
  // CATEGORIAS
  // =========================

  this.despesasPorCategoria =
    relatorio.despesasPorCategoria;

  this.receitasPorCategoria =
    relatorio.receitasPorCategoria;

  this.atualizarGraficoDespesasCategoria();


  // =========================
  // FILTROS
  // =========================

  this.carregarCategorias();
}
  // =====================================================
  // CATEGORIAS DISPONÍVEIS
  // =====================================================

  private carregarCategorias(): void {

    this.categorias = Array.from(
      new Set(
        this.movimentacoes.map(
          movimentacao =>
            movimentacao.categoria
        )
      )
    ).sort();

  }

  // =====================================================
// RECALCULAR DESPESAS POR CATEGORIA
// =====================================================


private recalcularDespesasPorCategoria(): void {

  const categorias = new Map<
    string,
    number
  >();

  const despesas =
    this.movimentacoesExibidas.filter(
      movimentacao =>
        movimentacao.tipo === 'despesa'
    );

  despesas.forEach(
    movimentacao => {

      const valorAtual =
        categorias.get(
          movimentacao.categoria
        ) ?? 0;

      categorias.set(
        movimentacao.categoria,
        valorAtual +
        movimentacao.valor
      );

    }
  );

  const totalDespesas =
    despesas.reduce(
      (total, movimentacao) =>
        total + movimentacao.valor,
      0
    );

  this.despesasPorCategoria =
    Array.from(
      categorias.entries()
    )
      .map(
        ([categoria, valor]) => ({
          categoria,
          valor,

          percentual:
            totalDespesas > 0
              ? (
                  valor /
                  totalDespesas
                ) * 100
              : 0
        })
      )
      .sort(
        (a, b) =>
          b.valor - a.valor
      );

  // Atualiza o Doughnut depois
  // de calcular todas as categorias
  this.atualizarGraficoDespesasCategoria();

}


  // =====================================================
  // FILTROS
  // =====================================================

  aplicarFiltros(): void {

  let resultado = [
    ...this.movimentacoes
  ];

  // =====================================================
  // TIPO
  // =====================================================

  if (this.tipoSelecionado !== 'todos') {

    resultado = resultado.filter(
      movimentacao =>
        movimentacao.tipo === this.tipoSelecionado
    );

  }

  // =====================================================
  // CATEGORIA
  // =====================================================

  if (this.categoriaSelecionada !== 'todas') {

    resultado = resultado.filter(
      movimentacao =>
        movimentacao.categoria ===
        this.categoriaSelecionada
    );

  }

  // =====================================================
  // PERÍODO
  // =====================================================

  resultado = this.filtrarPorPeriodo(
    resultado
  );

  // =====================================================
  // RESULTADO
  // =====================================================

  this.movimentacoesExibidas = resultado;

  // Recalcula todo o relatório com base no filtro
  this.recalcularRelatorioFiltrado();

}

private recalcularRelatorioFiltrado(): void {

  // =====================================================
  // RECEITAS
  // =====================================================

  this.totalReceitas =
    this.movimentacoesExibidas
      .filter(
        movimentacao =>
          movimentacao.tipo === 'receita'
      )
      .reduce(
        (total, movimentacao) =>
          total + movimentacao.valor,
        0
      );

  // =====================================================
  // DESPESAS
  // =====================================================

  this.totalDespesas =
    this.movimentacoesExibidas
      .filter(
        movimentacao =>
          movimentacao.tipo === 'despesa'
      )
      .reduce(
        (total, movimentacao) =>
          total + movimentacao.valor,
        0
      );

  // =====================================================
  // SALDO
  // =====================================================

  this.saldo =
    this.totalReceitas -
    this.totalDespesas;

  // =====================================================
  // ECONOMIA
  // =====================================================

  this.percentualEconomia =
    this.totalReceitas > 0
      ? (
          this.saldo /
          this.totalReceitas
        ) * 100
      : 0;

  // =====================================================
  // GRÁFICO MENSAL
  // =====================================================

  this.recalcularEvolucaoMensal();

  // =====================================================
  // DESPESAS POR CATEGORIA
  // =====================================================

  this.recalcularDespesasPorCategoria();
  
}

private recalcularEvolucaoMensal(): void {

  const meses = new Map<
    string,
    EvolucaoMensalRelatorio
  >();

  this.movimentacoesExibidas.forEach(
    movimentacao => {

      const mes =
        movimentacao.data.substring(0, 7);

      if (!meses.has(mes)) {

        meses.set(mes, {
          mes,
          receitas: 0,
          despesas: 0,
          saldo: 0
        });

      }

      const registro = meses.get(mes)!;

      if (
        movimentacao.tipo === 'receita'
      ) {

        registro.receitas +=
          movimentacao.valor;

      }

      if (
        movimentacao.tipo === 'despesa'
      ) {

        registro.despesas +=
          movimentacao.valor;

      }

      // Atualiza o saldo daquele mês
      registro.saldo =
        registro.receitas -
        registro.despesas;

    }
  );

  this.evolucaoMensal =
    Array.from(meses.values())
      .sort(
        (a, b) =>
          a.mes.localeCompare(b.mes)
      );

  // Atualiza o gráfico somente depois
  // de todos os cálculos terminarem
  this.atualizarGraficoReceitasDespesas();

}

  // =====================================================
  // FILTRO POR PERÍODO
  // =====================================================

  private filtrarPorPeriodo(
    movimentacoes: MovimentacaoRelatorio[]
  ): MovimentacaoRelatorio[] {

    if (
      this.periodoSelecionado === 'todos'
    ) {

      return movimentacoes;

    }


    const referencia = new Date();


    let meses = 0;


    switch (
      this.periodoSelecionado
    ) {

      case 'mes':
        meses = 1;
        break;

      case '3meses':
        meses = 3;
        break;

      case '6meses':
        meses = 6;
        break;

      case 'ano':
        meses = 12;
        break;

      default:
        return movimentacoes;

    }


    const inicio =
      new Date(referencia);

    inicio.setMonth(
      inicio.getMonth() -
      (meses - 1)
    );

    inicio.setDate(1);


    return movimentacoes.filter(
      movimentacao => {

        const data =
          new Date(
            `${movimentacao.data}T00:00:00`
          );

        return (
          data >= inicio &&
          data <= referencia
        );

      }
    );

  }


  // =====================================================
  // LIMPAR FILTROS
  // =====================================================

limparFiltros(): void {

  this.periodoSelecionado = 'todos';

  this.categoriaSelecionada = 'todas';

  this.tipoSelecionado = 'todos';

  this.movimentacoesExibidas = [
    ...this.movimentacoes
  ];

  this.recalcularRelatorioFiltrado();

}


  // =====================================================
  // EXPORTAÇÃO
  // =====================================================

  exportarRelatorio(): void {

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const azul = '#2563eb';
  const verde = '#16a34a';
  const vermelho = '#dc2626';
  const cinza = '#64748b';
  const escuro = '#0f172a';

  // =====================================================
  // CABEÇALHO
  // =====================================================

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(escuro);

  pdf.text(
    'Finança Fácil',
    14,
    18
  );

  pdf.setFontSize(16);

  pdf.text(
    'Relatório Financeiro',
    14,
    30
  );

  pdf.setFont(
    'helvetica',
    'normal'
  );

  pdf.setFontSize(10);
  pdf.setTextColor(cinza);

  pdf.text(
    `Perfil: ${this.nomePerfil}`,
    14,
    38
  );

  pdf.text(
    `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
    14,
    44
  );

  // =====================================================
  // LINHA
  // =====================================================

  pdf.setDrawColor(220);

  pdf.line(
    14,
    50,
    196,
    50
  );

  // =====================================================
  // RESUMO
  // =====================================================

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.setFontSize(13);
  pdf.setTextColor(escuro);

  pdf.text(
    'Resumo financeiro',
    14,
    60
  );

  // RECEITAS

  pdf.setFontSize(10);
  pdf.setTextColor(cinza);

  pdf.text(
    'Receitas',
    14,
    70
  );

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.setFontSize(13);
  pdf.setTextColor(verde);

  pdf.text(
    this.formatarMoeda(
      this.totalReceitas
    ),
    14,
    77
  );

  // DESPESAS

  pdf.setFontSize(10);
  pdf.setTextColor(cinza);

  pdf.text(
    'Despesas',
    65,
    70
  );

  pdf.setFontSize(13);
  pdf.setTextColor(vermelho);

  pdf.text(
    this.formatarMoeda(
      this.totalDespesas
    ),
    65,
    77
  );

  // SALDO

  pdf.setFontSize(10);
  pdf.setTextColor(cinza);

  pdf.text(
    'Saldo',
    118,
    70
  );

  pdf.setFontSize(13);
  pdf.setTextColor(azul);

  pdf.text(
    this.formatarMoeda(
      this.saldo
    ),
    118,
    77
  );

  // ECONOMIA

  pdf.setFontSize(10);
  pdf.setTextColor(cinza);

  pdf.text(
    'Economia',
    165,
    70
  );

  pdf.setFontSize(13);
  pdf.setTextColor(azul);

  pdf.text(
    this.formatarPercentual(
      this.percentualEconomia
    ),
    165,
    77
  );

  // =====================================================
  // FILTROS UTILIZADOS
  // =====================================================

  pdf.setFontSize(13);
  pdf.setTextColor(escuro);

  pdf.text(
    'Filtros aplicados',
    14,
    92
  );

  pdf.setFont(
    'helvetica',
    'normal'
  );

  pdf.setFontSize(9);
  pdf.setTextColor(cinza);

  pdf.text(
  `Período: ${this.obterNomePeriodo()}`,
  14,
  100
);

pdf.text(
  `Categoria: ${this.obterNomeCategoria()}`,
  70,
  100
);

pdf.text(
  `Tipo: ${this.obterNomeTipo()}`,
  140,
  100
);

// =====================================================
// GRÁFICOS
// =====================================================

const graficoReceitasDespesas =
  document.getElementById(
    'graficoReceitasDespesas'
  ) as HTMLCanvasElement | null;

const graficoDespesasCategoria =
  document.getElementById(
    'graficoDespesasCategoria'
  ) as HTMLCanvasElement | null;


pdf.setFont(
  'helvetica',
  'bold'
);

pdf.setFontSize(13);
pdf.setTextColor(escuro);

pdf.text(
  'Análise gráfica',
  14,
  114
);


// =====================================================
// RECEITAS X DESPESAS
// =====================================================

if (graficoReceitasDespesas) {

  // =====================================================
  // CRIA UMA CÓPIA DO GRÁFICO COM FUNDO BRANCO
  // EXCLUSIVAMENTE PARA O PDF
  // =====================================================

  const canvasPdf =
    document.createElement('canvas');

  canvasPdf.width =
    graficoReceitasDespesas.width;

  canvasPdf.height =
    graficoReceitasDespesas.height;

  const contexto =
    canvasPdf.getContext('2d');

  if (contexto) {

    // Fundo branco
    contexto.fillStyle = '#ffffff';

    contexto.fillRect(
      0,
      0,
      canvasPdf.width,
      canvasPdf.height
    );

    // Copia o gráfico original por cima
    contexto.drawImage(
      graficoReceitasDespesas,
      0,
      0
    );

    const imagemGrafico =
      canvasPdf.toDataURL(
        'image/png',
        1.0
      );

    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(10);

    pdf.setTextColor(escuro);

    pdf.text(
      'Receitas x Despesas',
      14,
      124
    );

    pdf.addImage(
      imagemGrafico,
      'PNG',
      14,
      129,
      112,
      58
    );

  }

}

// =====================================================
// DESPESAS POR CATEGORIA
// =====================================================

if (graficoDespesasCategoria) {

  const imagemGrafico =
    graficoDespesasCategoria.toDataURL(
      'image/png',
      1.0
    );

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(escuro);

  pdf.text(
    'Despesas por Categoria',
    132,
    124
  );

  // Gráfico um pouco menor para abrir espaço para a legenda
  pdf.addImage(
    imagemGrafico,
    'PNG',
    137,
    129,
    54,
    48
  );

  // =====================================================
  // LEGENDA DAS CATEGORIAS
  // =====================================================

  let yLegenda = 181;

  this.despesasPorCategoria.forEach(
    (item, indice) => {

      const cor =
        this.corCategoria(indice);

      // Converte HEX para RGB
      const hex =
        cor.replace('#', '');

      const r =
        parseInt(hex.substring(0, 2), 16);

      const g =
        parseInt(hex.substring(2, 4), 16);

      const b =
        parseInt(hex.substring(4, 6), 16);

      // Bolinha da categoria
      pdf.setFillColor(r, g, b);

      pdf.circle(
        134,
        yLegenda - 1,
        1.5,
        'F'
      );

      // Nome da categoria
      pdf.setFont(
        'helvetica',
        'bold'
      );

      pdf.setFontSize(7.5);
      pdf.setTextColor(escuro);

      pdf.text(
        item.categoria,
        138,
        yLegenda
      );

      // Valor
      pdf.setFont(
        'helvetica',
        'normal'
      );

      pdf.setFontSize(7);

      pdf.text(
        this.formatarMoeda(
          item.valor
        ),
        138,
        yLegenda + 3.5
      );

      // Percentual
      pdf.setFont(
        'helvetica',
        'bold'
      );

      pdf.text(
        this.formatarPercentual(
          item.percentual
        ),
        194,
        yLegenda,
        {
          align: 'right'
        }
      );

      yLegenda += 9;
    }
  );
}

  // =====================================================
  // MOVIMENTAÇÕES
  // =====================================================

  pdf.setFont(
  'helvetica',
  'bold'
);

pdf.setFontSize(13);
pdf.setTextColor(escuro);

pdf.text(
  'Movimentações',
  14,
  230
);

  const linhas =
    this.movimentacoesExibidas.map(
      movimentacao => [

        this.formatarDataPdf(
          movimentacao.data
        ),

        movimentacao.descricao,

        movimentacao.categoria,

        movimentacao.tipo === 'receita'
          ? 'Receita'
          : 'Despesa',

        this.formatarMoeda(
          movimentacao.valor
        )

      ]
    );

  autoTable(pdf, {

    startY: 236,

    head: [[
      'Data',
      'Descrição',
      'Categoria',
      'Tipo',
      'Valor'
    ]],

    body: linhas,

    theme: 'grid',

    styles: {
      fontSize: 8,
      cellPadding: 3
    },

    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },

    columnStyles: {

      0: {
        cellWidth: 24
      },

      1: {
        cellWidth: 52
      },

      2: {
        cellWidth: 38
      },

      3: {
        cellWidth: 28
      },

      4: {
        halign: 'right'
      }

    },

    margin: {
      left: 14,
      right: 14
    }

  });

  // =====================================================
  // SALVAR
  // =====================================================

  const nomeArquivo =
    `relatorio-${this.nomePerfil
      .toLowerCase()
      .replace(/\s+/g, '-')}.pdf`;

  pdf.save(
    nomeArquivo
  );

}

  // =====================================================
  // FORMATAÇÕES
  // =====================================================

  formatarMoeda(
    valor: number
  ): string {

    return valor.toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    );

  }

  private formatarDataPdf(
  data: string
  ): string {

    const [ano, mes, dia] =
      data.split('-');

    return `${dia}/${mes}/${ano}`;

}


  formatarPercentual(
    valor: number
  ): string {

    return `${valor.toFixed(1)}%`;

  }

corCategoria(indice: number): string {

  const cores = [
    '#ef4444',
    '#f97316',
    '#eab308',
    '#8b5cf6',
    '#3b82f6',
    '#14b8a6',
    '#ec4899',
    '#84cc16'
  ];

  return cores[
    indice % cores.length
  ];

}

private obterNomePeriodo(): string {

  switch (this.periodoSelecionado) {

    case 'mes':
      return 'Último mês';

    case '3meses':
      return 'Últimos 3 meses';

    case '6meses':
      return 'Últimos 6 meses';

    case 'ano':
      return 'Últimos 12 meses';

    default:
      return 'Todo o período';

  }

}

private obterNomeCategoria(): string {

  if (
    this.categoriaSelecionada === 'todas'
  ) {
    return 'Todas as categorias';
  }

  return this.categoriaSelecionada;

}

private obterNomeTipo(): string {

  switch (this.tipoSelecionado) {

    case 'receita':
      return 'Receitas';

    case 'despesa':
      return 'Despesas';

    default:
      return 'Todos';

  }

  
}

}
