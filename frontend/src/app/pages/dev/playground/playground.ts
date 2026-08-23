import { Component } from '@angular/core';

import { Button } from '../../../shared/components/forms/button/button';
import { CurrencyInput } from '../../../shared/components/forms/currency-input/currency-input';
import { SearchInput } from '../../../shared/components/forms/search-input/search-input';
import { Select } from '../../../shared/components/forms/select/select';

import { Card } from '../../../shared/components/layout/card/card';
import { PageHeader } from '../../../shared/components/layout/page-header/page-header';

import { StatCard } from '../../../shared/components/display/stat-card/stat-card';
import { Badge } from '../../../shared/components/display/badge/badge';
import { AlertItem } from '../../../shared/components/display/alert-item/alert-item';
import { TransactionItem } from '../../../shared/components/display/transaction-item/transaction-item';
import { FinanceItem } from '../../../shared/components/display/finance-item/finance-item';

import { Modal } from '../../../shared/components/feedback/modal/modal';
import { ConfirmDialog } from '../../../shared/components/feedback/confirm-dialog/confirm-dialog';
import { ToastService } from '../../../shared/components/feedback/toast/toast.service';
import { Loading } from '../../../shared/components/feedback/loading/loading';
import { EmptyState } from '../../../shared/components/feedback/empty-state/empty-state';
import { Pagination } from '../../../shared/components/tables/pagination/pagination';
import { DateInput } from '../../../shared/components/forms/date-input/date-input';
import { Textarea } from '../../../shared/components/forms/textarea/textarea';
import { DataTable } from '../../../shared/components/tables/data-table/data-table';
import{ProgressBar} from '../../../shared/components/display/progress-bar/progress-bar';
import { ParcelItem } from '../../../shared/components/display/parcel-item/parcel-item';
import { Alerta } from '../../../core/models/alerta.model';
import { Parcela } from '../../../core/models/parcela.model';
import {Input} from '../../../shared/components/forms/input/input';
import { PasswordInput } from '../../../shared/components/forms/password-input/password-input';
import { Checkbox } from '../../../shared/components/forms/checkbox/checkbox';
import { Switch } from '../../../shared/components/forms/switch/switch';
import { Divider } from '../../../shared/components/layout/divider/divider';

@Component({
  selector: 'app-playground',
  imports: [
    Button,
    CurrencyInput,
    SearchInput,
    Select,
    Card,
    PageHeader,
    StatCard,
    Badge,
    AlertItem,
    TransactionItem,
    FinanceItem,
    Modal,
    ConfirmDialog,
    Loading,
    EmptyState,
    Pagination,
    DateInput,
    Textarea,
    DataTable,
    ProgressBar,
    ParcelItem,
    Input,
    PasswordInput,
    Checkbox,
    Switch,
    Divider
  ],
  templateUrl: './playground.html',
  styleUrl: './playground.scss',
})
export class Playground {
  showModal = false;
  showConfirm = false;
  email = '';
  senha = '';
  lembrar = false;
  modoEscuro = false;
  constructor(private toast: ToastService) {}

  showSuccess(): void {
  this.toast.success('Receita cadastrada com sucesso.');
}

showError(): void {
  this.toast.error('Erro ao salvar receita.');
}

showWarning(): void {
  this.toast.warning('Meta de gastos atingida.');
}

showInfo(): void {
  this.toast.info('Atualização disponível.');
}

tableColumns = [
  { field: 'descricao', header: 'Descrição' },
  { field: 'categoria', header: 'Categoria' },
  { field: 'valor', header: 'Valor' },
  { field: 'data', header: 'Data' },
  { field: 'status', header: 'Status' }
];

tableData = [
  {
    descricao: 'Salário',
    categoria: 'Trabalho',
    valor: 'R$ 5.000,00',
    data: '01/01/2026',
    status: 'Recebido'
  },
  {
    descricao: 'Freelance',
    categoria: 'Extra',
    valor: 'R$ 850,00',
    data: '10/01/2026',
    status: 'Pendente'
  }
];

parcela: Parcela = {

  id:1,

  descricao:'Notebook Dell',

  categoria:'Tecnologia',

  valorTotal:2400,

  valorTotalFormatado:'R$ 2.400',

  valorParcela:200,

  valorParcelaFormatado:'R$ 200',

  parcelasPagas:4,

  totalParcelas:12,

  percentualPago:33,

  dataVencimento:'15/02/2026',

  status:'ativa'

};

alertaTeste: Alerta = {
  id: 1,
  titulo: 'Meta de gastos atingida',
  descricao: 'Você atingiu o limite de gastos definido para este mês.',
  data: '2026-07-14',
  tipo: 'orcamento',
  prioridade: 'media',
  visualizado: false,
  descartado: false
};

}

