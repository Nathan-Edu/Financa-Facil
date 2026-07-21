import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { PerfisModule } from './modules/perfis/perfis.module';
import { ParcelamentosModule } from './modules/parcelamentos/parcelamentos.module';
import { TransacoesModule } from './modules/transacoes/transacoes.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AlertasModule } from './modules/alertas/alertas.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';
import { RelatoriosModule } from './modules/relatorios/relatorios.module';
import { PrismaModule } from './prisma/prisma.module';
import { validarAmbiente } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validarAmbiente }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    CommonModule,
    AuthModule,
    PerfisModule,
    ParcelamentosModule,
    CategoriasModule,
    TransacoesModule,
    UsuariosModule,
    AlertasModule,
    DashboardModule,
    HealthModule,
    RelatoriosModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
