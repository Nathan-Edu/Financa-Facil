# Frontend

Interface Angular 20 integrada à API NestJS do Finança Fácil.

## Pré-requisitos

- Node.js 22 ou superior
- Backend disponível em `http://localhost:3000/api/v1`
- PostgreSQL e migrations do backend configurados

## Development server

To start a local development server, run:

```bash
npm install
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

Os testes E2E do contrato HTTP ficam no projeto `backend` e são executados com `npm run test:e2e`.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
