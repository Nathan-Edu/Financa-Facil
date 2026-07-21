import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AlertasController } from './alertas.controller';
import { AlertasService } from './alertas.service';

@Module({ imports: [AuthModule], controllers: [AlertasController], providers: [AlertasService], exports: [AlertasService] })
export class AlertasModule {}
