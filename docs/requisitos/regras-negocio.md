# Regras de Negócio

| Código | Regra de Negócio |
|---|---|
| RN01 | Cada usuário deve possuir um cadastro único no sistema. |
| RN02 | Um endereço de e-mail pode estar associado a apenas um usuário. |
| RN03 | Um usuário pode possuir múltiplos perfis financeiros, pessoais ou empresariais. |
| RN04 | Toda receita ou despesa deve estar associada a uma categoria financeira. |
| RN05 | O saldo financeiro de um perfil corresponde ao total de receitas menos o total de despesas consideradas no período. |
| RN06 | A quantidade de parcelas geradas para uma conta parcelada deve corresponder à quantidade de parcelas informada no cadastro. |
| RN07 | Apenas parcelas com situação pendente ou vencida podem ser registradas como pagas. |
| RN08 | O registro do pagamento de uma parcela deve alterar sua situação para paga e refletir seu valor nos cálculos financeiros correspondentes. |
| RN09 | Os relatórios financeiros devem considerar somente as movimentações pertencentes ao perfil financeiro e ao período selecionados. |
| RN10 | O gerenciamento de usuários é restrito a usuários com permissão administrativa. |
| RN11 | Perfis pessoais devem possuir CPF válido e perfis empresariais devem possuir CNPJ válido. |
| RN12 | A alteração de senha exige a confirmação da senha atual do usuário autenticado. |
| RN13 | O limite de segurança para falhas consecutivas de autenticação é de 5 tentativas. |
| RN14 | Parcelas pendentes cuja data de vencimento tenha sido ultrapassada devem assumir a situação "vencida". |
| RN15 | O período de antecedência utilizado para alertas de vencimento de parcelas é de 7 dias. |
| RN16 | As informações financeiras de um perfil devem permanecer associadas exclusivamente ao respectivo perfil financeiro. |
