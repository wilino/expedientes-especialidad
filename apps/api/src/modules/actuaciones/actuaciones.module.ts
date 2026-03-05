import { Module } from '@nestjs/common';
import { ActuacionesController } from './actuaciones.controller';
import { ActuacionesService } from './actuaciones.service';
import { ActuacionesRepository } from './actuaciones.repository';
import { ExpedientesModule } from '../expedientes';
import { ACTUACIONES_REPOSITORY } from './actuaciones.repository.port';

@Module({
  imports: [ExpedientesModule],
  controllers: [ActuacionesController],
  providers: [
    ActuacionesService,
    ActuacionesRepository,
    { provide: ACTUACIONES_REPOSITORY, useExisting: ActuacionesRepository },
  ],
  exports: [ActuacionesService],
})
export class ActuacionesModule {}
