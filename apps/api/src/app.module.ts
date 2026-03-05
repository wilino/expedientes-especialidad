import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma';
import { HealthModule } from './modules/health';
import { UsersModule } from './modules/users';
import { RbacModule } from './modules/rbac';
import { ExpedientesModule } from './modules/expedientes';
import { ActuacionesModule } from './modules/actuaciones';
import { DocumentosModule } from './modules/documentos';
import { AuditoriaModule } from './modules/auditoria';

@Module({
  imports: [
    // Configuración global (.env)
    ConfigModule.forRoot({ isGlobal: true }),

    // Base de datos
    PrismaModule,

    // Módulos del dominio
    HealthModule,
    UsersModule,
    RbacModule,
    ExpedientesModule,
    ActuacionesModule,
    DocumentosModule,
    AuditoriaModule,
  ],
})
export class AppModule {}
