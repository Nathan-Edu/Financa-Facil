# Requisitos comprovados pelo código

“Implementado” indica localização no código; não equivale a validação completa de interface. Os resultados realmente executados estão no documento 05. Os requisitos originais em `docs/requisitos` permanecem preservados.

| ID | Descrição | Módulo responsável | Situação | Evidência |
|---|---|---|---|---|
| RF01 | Cadastrar usuário e autenticar com senha | auth | Implementado; coberto na API | `auth.service.ts`, `test/api.e2e-spec.ts` |
| RF02 | Renovar e revogar sessão | auth, serviços das interfaces | Implementado; rotação concorrente testada | `AuthService.renovar/logout`, testes AuthService |
| RF03 | Recuperar e redefinir senha | auth | Implementado; SMTP real não validado | `MailService`, redefinição concorrente na API |
| RF04 | Gerenciar perfis pessoais e empresariais | perfis | Implementado; validação de CPF/CNPJ | `perfis.service.ts`, `documento.validator.spec.ts` |
| RF05 | Isolar informações por usuário e perfil | common e serviços financeiros | Implementado; cenários cruzados de API | `AcessoPerfilService.verificar`, filtros `perfil.usuarioId` |
| RF06 | Registrar, editar, pagar e cancelar receitas/despesas | transacoes, serviços das interfaces | Implementado; cobertura parcial | `TransacoesService`, `ReceitaService`, `DespesaService` |
| RF07 | Gerenciar categorias e orçamento | categorias, alertas | Implementado; cobertura parcial | `CategoriasService`, `AlertasService.processarOrcamentos` |
| RF08 | Gerar parcelas preservando total em centavos | parcelamentos | Implementado e testado | `distribuirParcelas`, teste 100/3 e 360 parcelas |
| RF09 | Calcular vencimentos em meses distintos | parcelamentos | Implementado e testado | `adicionarMeses`, fevereiro bissexto e virada do ano |
| RF10 | Pagar parcelas pendentes/vencidas de conta ativa | parcelamentos | Implementado; proteção de disputa adicionada | `ParcelasService.pagar`, teste unitário e API |
| RF11 | Cancelar saldo parcelado preservando parcelas pagas | parcelamentos | Implementado e cenário de API | `ParcelamentosService.cancelar` |
| RF12 | Consultar dashboard por período | dashboard | Implementado; datas inválidas corrigidas | `DashboardService.resumo`, testes de competência |
| RF13 | Gerar relatório por período e perfil | relatorios | Implementado e testado | `RelatoriosService.financeiro`, teste com pagamento distinto do vencimento |
| RF14 | Gerar transações recorrentes sem duplicar a competência | transacoes | Implementado; concorrência e reexecução na API | reserva por `updateMany`, índice único origem/competência |
| RF15 | Emitir e gerenciar alertas de vencimento | alertas | Implementado; integração parcial | `processarAlertas`, atualização e descarte na API |
| RF16 | Restringir administração por papel | usuarios/common | Implementado; acesso 403/200 na API | `RolesGuard`, `UsuariosController` |
| RF17 | Exportar relatórios na interface | páginas relatorios | Implementado; exportação visual não automatizada | `exportarRelatorio`, dependências jsPDF |
| RNF01 | Proteger senhas com hash | auth | Implementado | `argon2.hash/verify`; hashes não retornados pela seleção pública |
| RNF02 | Validar entradas e rejeitar campos extras | DTOs/main | Implementado; cobertura parcial | `ValidationPipe`, class-validator, testes DTO/API |
| RNF03 | Preservar integridade referencial e valores decimais | Prisma/PostgreSQL | Implementado; migrations em banco isolado | `schema.prisma`, seis migrations |
| RNF04 | Limitar requisições e tentativas de login | auth/app | Implementado; limites exatos não exercitados integralmente | Throttler global, login e recuperação; `registrarFalha` |
| RNF05 | Não transmitir token a serviços externos | interceptor web/mobile | Corrigido e teste de regressão | `auth.interceptor.spec.ts` nas duas interfaces |
| RNF06 | Restringir origens HTTP autorizadas | main/config | Configurável; padrão preservado | `CORS_ORIGINS`, `origensCors` |
| RNF07 | Executar testes em banco exclusivo | infraestrutura E2E | Proteção adicionada | `test/ambiente-e2e.ts`, `E2E_DATABASE_URL` obrigatório |
| RNF08 | Oferecer interface web e mobile | frontend/mobile | Builds e testes de serviços; execução nativa pendente | Angular/Ionic/Capacitor, capturas existentes |

As evidências não demonstram desempenho, disponibilidade em produção, acessibilidade integral ou satisfação de usuários. Esses atributos não recebem aprovação presumida.
