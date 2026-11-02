# Limitações e trabalhos futuros

| Limitação verificada | Consequência | Próxima ação recomendada |
|---|---|---|
| Cobertura unitária do backend é parcial | Vários controllers/serviços não têm exercício unitário completo | Ampliar cenários por módulo, usando a medição do documento 05 |
| Testes de interface concentram-se em serviços/interceptors | Formulários, gráficos, exportação e navegação não foram validados integralmente | Acrescentar testes de componentes críticos e roteiro de navegação reproduzível |
| API E2E não é E2E de interface | Não comprova funcionamento visual em navegador ou dispositivo | Validar web, emulador e dispositivo físico separadamente |
| Windows sem CocoaPods/Xcode | Sincronização iOS parcial; sem build/assinatura/instalação | Validar em macOS com ferramentas nativas |
| Não foi feito build nativo Android | Build Angular e sync não comprovam APK instalável | Executar Gradle com JDK/SDK compatíveis e testar dispositivo |
| URL mobile está em localhost | Dispositivo físico não acessa automaticamente a API do computador | Configurar URL HTTPS de implantação e origens CORS reais |
| Avisos de tamanho de bundle/estilos | Build aprovado ainda requer otimização | Dividir carregamento e reduzir estilos com validação visual |
| Capturas contêm identificadores e dados financeiros | Não estão prontas para publicação pública | Preparar cópias com ocultação determinística ou novas capturas reais com dados sintéticos; preservar originais |
| Totais das capturas não foram confrontados com o banco original | Imagens não validam valores financeiros atuais | Reproduzir cenários controlados e capturar o estado resultante |
| Capturas de dashboard usam subtítulos anteriores | Diferença entre acervo e estado revisado | Atualizar capturas reais após validação visual |
| Capturas de despesas exibem parcelas, mas o serviço atual lista transações pagas | Paridade histórica dessa listagem não comprovada | Definir requisito de unificação de parcelas e transações e validar antes de implementar |
| Diagramas acadêmicos antigos não equivalem ao schema real | Identificadores e detalhes de persistência podem divergir | Usar o novo ER no TCC e revisar os demais diagramas mantendo histórico |
| ER entregue em Mermaid sem PNG adicional | Exige visualizador compatível para exportar | Renderizar o arquivo editável em ferramenta local Mermaid |
| Dashboard inclui parcelas em aberto; relatório exige pagamento | Totais diferentes em presença de compromissos pendentes | Manter descrição explícita; eventual visão de caixa deve ser requisito separado |
| Relatórios somam `number` após conversão de Decimal | Ponto flutuante pode produzir resíduos binários | Adotar agregação Decimal ou centavos em toda a cadeia e ampliar testes de grande volume |
| Recorrência mensal avança a partir da última competência limitada | Após fevereiro pode manter dia 28/29 em vez de retornar ao dia 31 | Definir política de âncora do mês e então implementar/testar sem supor regra inexistente |
| Recorrências de modelo pago herdam status PAGA | Representam automação de quitação, não prova de débito bancário | Validar a intenção de negócio e, se necessário, separar geração de pagamento |
| Tokens no localStorage/sessionStorage, também no mobile | Exposição a código executado na própria origem | Avaliar armazenamento seguro nativo e política de sessão para implantação |
| Access token continua válido até expirar após logout/troca de senha | Revogação de refresh não invalida imediatamente o access token | Avaliar versão de sessão/revogação no backend; documentar a janela de expiração |
| Recuperação retorna token de desenvolvimento fora de production quando SMTP não está configurado | Configuração incorreta de produção seria inadequada | Exigir NODE_ENV=production e SMTP configurado na implantação; não publicar tokens |
| Limite de falhas de login usa leitura seguida de atualização | Tentativas paralelas ainda merecem teste específico de contagem | Tornar contagem atômica e testar limiar/bloqueio concorrente |
| Alertas usam consulta seguida de criação, protegidos por unicidade | Jobs simultâneos podem disputar a inserção e gerar erro de unicidade | Usar upsert/reserva e teste de múltiplos processadores |
| Validação de datas em DTOs gerais usa IsDateString sem política única de data civil | Normalização e calendário precisam de verificação ampliada | Unificar validação estrita e testar todos os endpoints de datas |
| SMTP, TLS de produção, proxy e implantação não exercitados | Não há aprovação operacional de produção | Preparar ambiente de homologação com configuração própria |
| Não houve auditoria completa de dependências | Avisos de depreciação não equivalem a um inventário atualizado de CVEs | Executar análise de dependências separada e priorizar correções sem atualizações indiscriminadas |

Essas pendências não foram escondidas por alteração de limites, remoção de testes ou alegações de aprovação. A revisão foi incremental e não equivale a uma garantia de ausência de vulnerabilidades. Nenhuma mudança de dados reais, arquitetura completa ou instalação de framework adicional de E2E foi realizada.
