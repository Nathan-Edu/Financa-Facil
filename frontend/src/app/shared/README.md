# Finança Fácil UI

**Versão:** 1.0
**Projeto:** Finança Fácil
**Objetivo:** Biblioteca interna de componentes reutilizáveis para padronizar a interface do sistema.

---

## Estrutura

```text
shared/
├── components/
│   ├── display/
│   ├── feedback/
│   ├── forms/
│   ├── layout/
│   └── tables/
├── directives/
├── interfaces/
└── pipes/
```

---

## Forms

### Button

**Local:** `components/forms/button`

Componente padrão para botões do sistema.

**Uso:**
```html
<app-button color="success" icon="add">
  Salvar
</app-button>
```

**Principais opções:**
- `color`: `primary`, `success`, `danger`, `warning`, `outline`, `ghost`
- `size`: `small`, `medium`, `large`
- `icon`: ícone Material
- `appearance`: `default` ou `icon`

### SearchInput

**Local:** `components/forms/search-input`

Campo de busca com ícone e opção de limpar.

```html
<app-search-input
  label="Buscar"
  placeholder="Buscar receitas..."
  [(value)]="search">
</app-search-input>
```

### CurrencyInput

**Local:** `components/forms/currency-input`

Campo para valores monetários em reais.

```html
<app-currency-input label="Valor"></app-currency-input>
```

### Select

**Local:** `components/forms/select`

Campo de seleção reutilizável.

```html
<app-select
  label="Categoria"
  [options]="categorias"
  [(value)]="categoria">
</app-select>
```

### DateInput

**Local:** `components/forms/date-input`

Campo de data.

```html
<app-date-input
  label="Data"
  [required]="true">
</app-date-input>
```

### Textarea

**Local:** `components/forms/textarea`

Campo para textos maiores e observações.

```html
<app-textarea
  label="Observações"
  placeholder="Digite uma observação...">
</app-textarea>
```

---

## Display

### StatCard

**Local:** `components/display/stat-card`

Card de resumo usado no Dashboard e páginas financeiras.

```html
<app-stat-card
  title="Receitas"
  value="R$ 5.200,00"
  subtitle="Este mês"
  icon="trending_up"
  color="success">
</app-stat-card>
```

### Badge

**Local:** `components/display/badge`

Etiqueta visual para status e categorias.

```html
<app-badge color="success">Recebido</app-badge>
```

### FinanceItem

**Local:** `components/display/finance-item`

Item financeiro usado em receitas e despesas.

```html
<app-finance-item
  title="Salário"
  category="Trabalho"
  date="01/01/2026"
  value="R$ 5.000,00"
  type="income">
</app-finance-item>
```

### TransactionItem

**Local:** `components/display/transaction-item`

Item resumido de transação, usado no Dashboard.

```html
<app-transaction-item
  title="Supermercado"
  date="20/01/2026"
  value="- R$ 180,50"
  type="expense">
</app-transaction-item>
```

### AlertItem

**Local:** `components/display/alert-item`

Componente para alertas informativos.

```html
<app-alert-item
  type="warning"
  message="Meta de gastos atingida.">
</app-alert-item>
```

---

## Layout

### Card

**Local:** `components/layout/card`

Container padrão para blocos de conteúdo.

```html
<app-card title="Suas Receitas" subtitle="Lista de receitas cadastradas">
  Conteúdo aqui
</app-card>
```

### PageHeader

**Local:** `components/layout/page-header`

Cabeçalho padrão de páginas.

```html
<app-page-header
  title="Receitas"
  subtitle="Gerencie suas entradas financeiras">
</app-page-header>
```

### Navbar

**Local:** `components/layout/navbar`

Barra superior principal do sistema.

### SettingsMenu

**Local:** `components/layout/settings-menu`

Menu de configurações, perfil e tema.

### Sidebar e Footer

Componentes reservados para evolução futura do layout.

---

## Feedback

### Modal

**Local:** `components/feedback/modal`

Modal reutilizável com header, body e footer.

```html
<app-modal
  title="Nova Receita"
  subtitle="Cadastre uma nova entrada financeira"
  size="medium"
  (close)="showModal = false">

  <div modal-body>
    Conteúdo do formulário
  </div>

  <div modal-footer>
    <app-button color="outline">Cancelar</app-button>
    <app-button color="success">Salvar</app-button>
  </div>

</app-modal>
```

**Tamanhos:** `small`, `medium`, `large`

### ConfirmDialog

**Local:** `components/feedback/confirm-dialog`

Janela de confirmação para ações críticas.

```html
<app-confirm-dialog
  title="Excluir Receita"
  message="Tem certeza que deseja excluir esta receita?"
  confirmText="Excluir"
  cancelText="Cancelar"
  (confirm)="excluir()"
  (cancel)="fechar()">
</app-confirm-dialog>
```

### Toast

**Local:** `components/feedback/toast`

Sistema global de mensagens.

**Uso no TypeScript:**
```typescript
this.toast.success('Receita cadastrada com sucesso.');
this.toast.error('Erro ao salvar receita.');
this.toast.warning('Meta de gastos atingida.');
this.toast.info('Atualização disponível.');
```

**Estrutura:**
```text
toast/
├── toast.service.ts
├── toast-container.ts
├── toast-item.ts
```

### Loading

**Local:** `components/feedback/loading`

Indicador de carregamento.

```html
<app-loading
  message="Carregando dados..."
  size="medium">
</app-loading>
```

### EmptyState

**Local:** `components/feedback/empty-state`

Estado vazio para listas sem dados.

```html
<app-empty-state
  icon="receipt_long"
  title="Nenhuma receita encontrada"
  description="Cadastre uma nova receita para começar.">
</app-empty-state>
```

---

## Tables

### Pagination

**Local:** `components/tables/pagination`

Componente de paginação.

```html
<app-pagination
  [currentPage]="1"
  [totalPages]="5"
  (pageChange)="mudarPagina($event)">
</app-pagination>
```

### DataTable

**Local:** `components/tables/data-table`

Tabela reutilizável para relatórios, cadastros e listagens administrativas.

```html
<app-data-table
  [columns]="columns"
  [data]="data"
  [currentPage]="1"
  [totalPages]="3">
</app-data-table>
```

---

## Padrão de Uso

Componentes reutilizáveis devem ficar em:

```text
shared/components
```

Componentes exclusivos de uma página devem ficar dentro da própria página:

```text
pages/financeiro/receitas/components
```

### Regra Geral

- `shared` deve conter apenas componentes reutilizáveis.
- Páginas devem apenas montar componentes.
- Regras de negócio devem ficar em `services`.
- Models devem ficar em `core/models`.
- Comunicação com backend deve ficar em `core/services`.

---

## Status da Biblioteca

**Finança Fácil UI v1.0**

| Categoria | Status |
|---|---|
| Forms     | ✅ |
| Display   | ✅ |
| Layout    | ✅ |
| Feedback  | ✅ |
| Tables    | ✅ |

Biblioteca pronta para uso nas páginas principais do sistema.