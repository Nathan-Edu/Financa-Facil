# Regras de Negócio

| Código | Regra de Negócio |
|---|---|
| RN01 | Cada usuário deverá possuir um cadastro único no sistema. |
| RN02 | O e-mail informado deverá ser único para autenticação no sistema. |
| RN03 | Um usuário poderá cadastrar e gerenciar diferentes perfis financeiros, podendo incluir perfis pessoais e empresariais. |
| RN04 | Receitas e despesas deverão estar associadas a uma categoria. |
| RN05 | O saldo financeiro será calculado com base nas receitas cadastradas menos as despesas registradas. |
| RN06 | Contas parceladas deverão gerar parcelas conforme a quantidade informada pelo usuário. |
| RN07 | Uma parcela somente poderá ser marcada como paga se estiver pendente. |
| RN08 | O pagamento de uma parcela deverá atualizar o saldo financeiro correspondente. |
| RN09 | O sistema deverá gerar alertas para parcelas próximas ao vencimento. |
| RN10 | Relatórios financeiros deverão ser gerados com base no período informado pelo usuário. |
| RN11 | Apenas administradores poderão gerenciar usuários cadastrados. |
| RN12 | O CPF informado em perfis pessoais e o CNPJ em perfis empresariais deverão ser validados. |
| RN13 | Caso o CPF ou CNPJ seja inválido, o sistema deverá impedir o cadastro e exibir mensagem de erro. |
| RN14 | O sistema deverá bloquear o acesso caso a senha informada esteja incorreta. |
| RN15 | O usuário poderá atualizar sua renda sempre que houver alteração, como recebimento de décimo terceiro ou reajuste salarial. |
| RN16 | A senha somente poderá ser alterada mediante confirmação da senha atual. |
| RN17 | Após 5 tentativas de login incorretas, a conta deverá ser bloqueada temporariamente. |
| RN18 | Parcelas não pagas após a data de vencimento deverão ter seu status alterado automaticamente para "vencida". |
| RN19 | O sistema deverá emitir alertas de vencimento com antecedência de 7 dias antes da data de vencimento da parcela. |