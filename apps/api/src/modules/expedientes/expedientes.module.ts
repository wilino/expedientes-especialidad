import { Module } from '@nestjs/common';
import { ExpedientesController } from './expedientes.controller';
import { ExpedientesService } from './expedientes.service';
import { ExpedientesRepository } from './expedientes.repository';

@Module({
  controllers: [ExpedientesController],
  providers: [ExpedientesService, ExpedientesRepository],
  exports: [ExpedientesService],
})
export class ExpedientesModule {}
