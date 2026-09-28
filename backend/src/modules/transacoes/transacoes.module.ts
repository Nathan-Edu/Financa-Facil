import { Module } from '@nestjs/common';

import { TransacoesController } from './transacoes.controller';
import { TransacoesService } from './transacoes.service';

import { AlertasModule } from '../alertas/alertas.module';

@Module({
  imports: [
    AlertasModule
  ],

  controllers: [
    TransacoesController
  ],

  providers: [
    TransacoesService
  ]
})
export class TransacoesModule {}