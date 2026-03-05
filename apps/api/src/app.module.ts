import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma';
import { AuthModule, JwtAuthGuard, PermissionsGuard } from './modules/auth';
import { HealthModule } from './modules/health';
import { UsersModule } from './modules/users';
import { RbacModule } from './modules/rbac';
import { ExpedientesModule } from './modules/expedientes';
import { ActuacionesModule } from './modules/actuaciones';
import { DocumentosModule } from './modules/documentos';
import { AuditoriaModule } from './modules/auditoria';
import { ReportesModule } from './modules/reportes';
import { AuditInterceptor } from './shared/interceptors';

@Module({
  imports: [
    // Configuración global (.env)
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),

    // Base de datos
    PrismaModule,

    // Módulos del dominio
    AuthModule,
    HealthModule,
    UsersModule,
    RbacModule,
    ExpedientesModule,
    ActuacionesModule,
    DocumentosModule,
    AuditoriaModule,
    ReportesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
