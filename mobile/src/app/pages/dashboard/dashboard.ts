import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  DashboardResumo
} from '../../core/models/dashboard.model';

import {
  DashboardService
} from '../../core/services/dashboard.service';

import {
  PerfilFinanceiroService
} from '../../core/services/perfil-financeiro.service';

import {
  PageHeader
} from '../../shared/components/layout/page-header/page-header';

import {
  Select,
  SelectOption
} from '../../shared/components/forms/select/select';

import {
  DashboardSummary
} from './components/dashboard-summary/dashboard-summary';

import {
  DashboardTransactions
} from './components/dashboard-transactions/dashboard-transactions';

import {
  DashboardPayments
} from './components/dashboard-payments/dashboard-payments';

import {
  DashboardAlerts
} from './components/dashboard-alerts/dashboard-alerts';

import {
  DashboardQuickActions
} from './components/dashboard-quick-actions/dashboard-quick-actions';

import {
  DashboardAnalysis
} from './components/dashboard-analysis/dashboard-analysis';

import {
  DashboardCategories
} from './components/dashboard-categories/dashboard-categories';


@Component({

  selector: 'app-dashboard',

  imports: [

    PageHeader,

    FormsModule,

    Select,

    DashboardSummary,

    DashboardTransactions,

    DashboardPayments,

    DashboardAlerts,

    DashboardQuickActions,

    DashboardAnalysis,

    DashboardCategories

  ],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.scss'

})

export class Dashboard implements OnInit {

  resumo: DashboardResumo = {

    saldo: 0,

    totalReceitas: 0,

    totalDespesas: 0,

    totalParceladas: 0,

    ultimasReceitas: [],

    ultimasDespesas: [],

    parcelasAtivas: [],

    alertas: [],

    categorias: []

  };


  loading = true;


  periodoSelecionado =
    'mesAtual';


  dataInicioPersonalizada =
    '';


  dataFimPersonalizada =
    '';


  periodos: SelectOption[] = [

    {
      label: 'Este mês',
      value: 'mesAtual'
    },

    {
      label: 'Mês anterior',
      value: 'mesAnterior'
    },

    {
      label: 'Últimos 3 meses',
      value: '3meses'
    },

    {
      label: 'Últimos 6 meses',
      value: '6meses'
    },

    {
      label: 'Este ano',
      value: 'anoAtual'
    },

    {
      label: 'Todo o período',
      value: 'todos'
    },

    {
      label: 'Personalizado',
      value: 'personalizado'
    }

  ];


  constructor(

    private dashboardService:
      DashboardService,

    private perfilService:
      PerfilFinanceiroService

  ) {}


  ngOnInit(): void {

    // Carregamento inicial
    this.aplicarPeriodo();


    // Quando o perfil financeiro mudar,
    // recarrega o Dashboard mantendo o período atual
    this.perfilService
      .perfilAlterado$
      .subscribe(() => {

        this.aplicarPeriodo();

      });

  }


  alterarPeriodo(
    periodo: string
  ): void {

    this.periodoSelecionado =
      periodo;


    if (
      periodo !==
      'personalizado'
    ) {

      this.aplicarPeriodo();

    }

  }


  aplicarPeriodo(): void {

    const hoje =
      new Date();


    let inicio: Date;

    let fim: Date;


    switch (
      this.periodoSelecionado
    ) {

      case 'mesAtual':

        inicio =
          new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            1
          );

        fim =
          hoje;

        break;


      case 'mesAnterior':

        inicio =
          new Date(
            hoje.getFullYear(),
            hoje.getMonth() - 1,
            1
          );

        fim =
          new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            0
          );

        break;


      case '3meses':

        inicio =
          new Date(
            hoje.getFullYear(),
            hoje.getMonth() - 2,
            1
          );

        fim =
          hoje;

        break;


      case '6meses':

        inicio =
          new Date(
            hoje.getFullYear(),
            hoje.getMonth() - 5,
            1
          );

        fim =
          hoje;

        break;


      case 'anoAtual':

        inicio =
          new Date(
            hoje.getFullYear(),
            0,
            1
          );

        fim =
          hoje;

        break;


      case 'todos':

        this.carregarDashboard(
          undefined,
          undefined,
          true
        );

        return;


      case 'personalizado':

        if (
          !this.dataInicioPersonalizada ||
          !this.dataFimPersonalizada
        ) {

          return;

        }

        this.carregarDashboard(
          this.dataInicioPersonalizada,
          this.dataFimPersonalizada
        );

        return;


      default:

        inicio =
          new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            1
          );

        fim =
          hoje;

    }


    this.carregarDashboard(
      this.formatarData(
        inicio
      ),
      this.formatarData(
        fim
      )
    );

  }


  carregarDashboard(

    inicio?: string,

    fim?: string,

    todoPeriodo = false

  ): void {

    this.loading =
      true;


    this.dashboardService

      .resumo(
        inicio,
        fim,
        todoPeriodo
      )

      .subscribe({

        next: (
          resumo:
            DashboardResumo
        ) => {

          this.resumo =
            resumo;

          this.loading =
            false;

        },


        error: (
          erro
        ) => {

          this.loading =
            false;

          console.error(
            'Erro ao carregar dados do Dashboard.',
            erro
          );

        }

      });

  }


  private formatarData(
    data: Date
  ): string {

    const ano =
      data.getFullYear();


    const mes =
      String(
        data.getMonth() + 1
      ).padStart(
        2,
        '0'
      );


    const dia =
      String(
        data.getDate()
      ).padStart(
        2,
        '0'
      );


    return `${ano}-${mes}-${dia}`;

  }

}