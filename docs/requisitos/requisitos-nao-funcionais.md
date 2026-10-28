# Requisitos Não Funcionais

| Código | Requisito Não Funcional |
|---|---|
| RNF01 | O sistema deve possuir interface web responsiva, permitindo utilização em dispositivos móveis e computadores sem perda das funcionalidades principais. |
| RNF02 | O sistema deve utilizar autenticação de usuário para restringir o acesso às funcionalidades protegidas. |
| RNF03 | O sistema deve armazenar os dados em banco de dados PostgreSQL. |
| RNF04 | O sistema deve ser desenvolvido com Angular no frontend e Node.js com NestJS no backend. |
| RNF05 | O sistema deve responder às operações usuais de consulta e cadastro em até 2 segundos em ambiente de testes, desconsiderando limitações externas de rede. |
| RNF06 | O sistema deve possuir estrutura modular, separando componentes de interface, serviços, regras de negócio e acesso a dados. |
| RNF07 | O sistema deve armazenar as senhas dos usuários utilizando algoritmo de hash, sem manter a senha em texto puro. |
| RNF08 | O sistema deve impedir o acesso às rotas protegidas quando não houver sessão autenticada válida. |
| RNF09 | O sistema deve registrar informações de data e hora em operações relevantes que possuam rastreabilidade no banco de dados. |
| RNF10 | O sistema deve utilizar português brasileiro como idioma padrão da interface. |
