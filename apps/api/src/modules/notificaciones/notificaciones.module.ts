import { Module } from '@nestjs/common';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesRepository } from './notificaciones.repository';
import { NOTIFICACIONES_REPOSITORY } from './notificaciones.repository.port';

@Module({
  controllers: [NotificacionesController],
  providers: [
    NotificacionesService,
    NotificacionesRepository,
    {
      provide: NOTIFICACIONES_REPOSITORY,
      useExisting: NotificacionesRepository,
    },
  ],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
