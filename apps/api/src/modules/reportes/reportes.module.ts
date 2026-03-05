import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { ReportesRepository } from './reportes.repository';
import { REPORTES_REPOSITORY } from './reportes.repository.port';

@Module({
  controllers: [ReportesController],
  providers: [
    ReportesService,
    ReportesRepository,
    { provide: REPORTES_REPOSITORY, useExisting: ReportesRepository },
  ],
  exports: [ReportesService],
})
export class ReportesModule {}
