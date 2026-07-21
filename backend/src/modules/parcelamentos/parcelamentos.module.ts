import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ParcelamentosController } from './parcelamentos.controller';
import { ParcelamentosService } from './parcelamentos.service';
import { ParcelasService } from './parcelas.service';

@Module({
  imports: [AuthModule],
  controllers: [ParcelamentosController],
  providers: [ParcelamentosService, ParcelasService],
  exports: [ParcelamentosService, ParcelasService],
})
export class ParcelamentosModule {}
