import { PerfilFinanceiro } from '../models/perfil-financeiro.model';

export const PERFIS_FINANCEIROS_MOCK: PerfilFinanceiro[] = [
  {
    id: 1,
    nome: 'Perfil Pessoal',
    tipo: 'pessoal',
    documento: '123.456.789-00',
    descricao: 'Controle das finanças pessoais.',
    ativo: true,
    cor: '#3b82f6',
    icone: 'PF',
    dataCriacao: '2026-07-01'
  },
  {
    id: 2,
    nome: 'Empresa Alpha',
    tipo: 'empresa',
    documento: '12.345.678/0001-90',
    descricao: 'Controle financeiro empresarial.',
    ativo: false,
    cor: '#10b981',
    icone: 'PJ',
    dataCriacao: '2026-07-02'
  }
];