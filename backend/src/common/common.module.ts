import { Global, Module } from '@nestjs/common';

import { AcessoPerfilService } from './services/acesso-perfil.service';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({ providers: [AcessoPerfilService, RolesGuard], exports: [AcessoPerfilService, RolesGuard] })
export class CommonModule {}
