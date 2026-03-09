import { Module } from '@nestjs/common';
import { ActividadController } from './actividad.controller';
import { ActividadService } from './actividad.service';
import { ActividadRepository } from './actividad.repository';
import { ACTIVIDAD_REPOSITORY } from './actividad.repository.port';

@Module({
  controllers: [ActividadController],
  providers: [
    ActividadService,
    ActividadRepository,
    { provide: ACTIVIDAD_REPOSITORY, useExisting: ActividadRepository },
  ],
  exports: [ActividadService],
})
export class ActividadModule {}
