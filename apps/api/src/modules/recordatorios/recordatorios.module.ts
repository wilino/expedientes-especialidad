import { Module } from '@nestjs/common';
import { RecordatoriosController } from './recordatorios.controller';
import { RecordatoriosService } from './recordatorios.service';
import { RecordatoriosRepository } from './recordatorios.repository';
import { RECORDATORIOS_REPOSITORY } from './recordatorios.repository.port';

@Module({
  controllers: [RecordatoriosController],
  providers: [
    RecordatoriosService,
    RecordatoriosRepository,
    { provide: RECORDATORIOS_REPOSITORY, useExisting: RecordatoriosRepository },
  ],
  exports: [RecordatoriosService],
})
export class RecordatoriosModule {}
