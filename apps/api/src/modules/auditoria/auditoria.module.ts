import { Module } from '@nestjs/common';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaRepository } from './auditoria.repository';
import { AUDITORIA_REPOSITORY } from './auditoria.repository.port';

@Module({
  controllers: [AuditoriaController],
  providers: [
    AuditoriaService,
    AuditoriaRepository,
    { provide: AUDITORIA_REPOSITORY, useExisting: AuditoriaRepository },
  ],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
