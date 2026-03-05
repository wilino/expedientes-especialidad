import { Module } from '@nestjs/common';
import { ActuacionesController } from './actuaciones.controller';
import { ActuacionesService } from './actuaciones.service';
import { ActuacionesRepository } from './actuaciones.repository';
import { ExpedientesModule } from '../expedientes';

@Module({
  imports: [ExpedientesModule],
  controllers: [ActuacionesController],
  providers: [ActuacionesService, ActuacionesRepository],
  exports: [ActuacionesService],
})
export class ActuacionesModule {}
