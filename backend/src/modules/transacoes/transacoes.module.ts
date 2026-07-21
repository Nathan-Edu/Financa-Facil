import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { TransacoesController } from './transacoes.controller';
import { TransacoesService } from './transacoes.service';

@Module({ imports: [AuthModule], controllers: [TransacoesController], providers: [TransacoesService] })
export class TransacoesModule {}
