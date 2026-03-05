import { Module } from '@nestjs/common';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { DocumentosRepository } from './documentos.repository';
import { ExpedientesModule } from '../expedientes';

@Module({
  imports: [ExpedientesModule],
  controllers: [DocumentosController],
  providers: [DocumentosService, DocumentosRepository],
  exports: [DocumentosService],
})
export class DocumentosModule {}
