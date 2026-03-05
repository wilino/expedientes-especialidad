import { Module } from '@nestjs/common';
import { ExpedientesController } from './expedientes.controller';
import { ExpedientesService } from './expedientes.service';
import { ExpedientesRepository } from './expedientes.repository';
import { EXPEDIENTES_REPOSITORY } from './expedientes.repository.port';
import { EXPEDIENTES_LOOKUP } from './expedientes-lookup.port';

@Module({
  controllers: [ExpedientesController],
  providers: [
    ExpedientesService,
    ExpedientesRepository,
    { provide: EXPEDIENTES_REPOSITORY, useExisting: ExpedientesRepository },
    { provide: EXPEDIENTES_LOOKUP, useExisting: ExpedientesService },
  ],
  exports: [ExpedientesService, EXPEDIENTES_LOOKUP],
})
export class ExpedientesModule {}
