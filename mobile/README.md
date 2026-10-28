# Finança Fácil Mobile

Aplicativo Ionic 8 + Angular 20, com Capacitor 7 para Android e iOS. Baseado no projeto https://github.com/Nathan-Edu/Financa-Facil, cujo frontend foi reaproveitado para preservar regras, formulários e integração com a API.

## Executar no navegador

Requer Node.js 22 ou superior.

```powershell
npm.cmd install
npm.cmd start
```

Abra http://localhost:4200. No PowerShell, o sufixo `.cmd` evita o bloqueio de scripts da política de execução.

## API e banco de dados

A aplicação usa a API real do projeto original, sem dados simulados. Configure `apiUrl` em `src/environment.ts`. O valor inicial é `http://localhost:3000/api/v1`.

O backend está em `../backend/`. Para iniciá-lo, siga `../backend/README.md`: configure PostgreSQL e o arquivo `.env`, instale dependências, gere o Prisma, aplique as migrations e execute `npm.cmd run start:dev` nessa pasta.

Configure `FRONTEND_URL=http://localhost:4200` no backend para desenvolvimento no navegador. No aplicativo Android a origem padrão é `https://localhost`; no iOS é `capacitor://localhost`. O servidor deve permitir a origem correspondente. Para usar web e apps simultaneamente, o backend precisa permitir uma lista dessas origens.

No emulador Android, o computador é acessível em `10.0.2.2`; em aparelho físico, use um endereço de rede acessível ao aparelho. `localhost` no aparelho se refere ao próprio aparelho. Para distribuição, configure uma API HTTPS: o projeto não habilita tráfego HTTP nativo inseguro.

## Gerar aplicativo nativo

```powershell
npm.cmd run build
npm.cmd run mobile:android
npm.cmd run mobile:open:android
```

Os projetos nativos já estão incluídos em `android/` e `ios/`. Os comandos `mobile:android` e `mobile:ios` sincronizam o frontend compilado. O último comando abre o Android Studio, onde é possível executar no emulador ou gerar APK. Requer Android Studio e SDK configurados.

No macOS, com Xcode instalado:

```sh
npm run build
npm run mobile:ios
npm run mobile:open:ios
```

Após alterações no frontend, execute `npm.cmd run build` e `npm.cmd run mobile:sync`.

## Funcionalidades

- Login, cadastro, recuperação e alteração de senha, renovação de sessão.
- Dashboard, receitas, despesas e transações recorrentes.
- Contas parceladas e registro de pagamentos.
- Categorias, alertas e relatórios.
- Conta e perfis pessoais/empresariais, com validações originais.
- Navegação inferior Ionic, menu lateral, temas originais, formulários adaptados ao toque e áreas seguras.

As telas e os serviços Angular originais foram mantidos dentro do shell Ionic. A administração de usuários não tinha uma tela no frontend original e não foi acrescentada nesta versão.

## Verificação

`npm.cmd run build` verifica TypeScript, templates Angular e empacotamento de produção. `npm.cmd test -- --watch=false --browsers=ChromeHeadless` executa os testes unitários herdados, se Chrome estiver instalado. Fluxos com dados reais exigem o backend e PostgreSQL ativos. A geração e execução de APK/IPA exigem as ferramentas nativas e validação em dispositivo.

Validação realizada: build de produção concluído e 5 testes unitários aprovados no ChromeHeadless. O build apresenta avisos de orçamento de tamanho (bundle inicial e estilos de relatórios). Após a revisão, o npm reportou 6 alertas altos na cadeia de testes do Karma, sem versão corrigida de braces, e zero alertas nas dependências de produção. Detalhes em [docs/seguranca.md](docs/seguranca.md). APK/IPA e operações com banco real ainda não foram validados.


A imagem enviada foi aplicada como logo no login, cadastro, recuperação/redefinição de senha, cabeçalho e favicon. Arquivo: public/assets/logo-financa-facil.png. Os ícones nativos de instalação permanecem os do Capacitor.

