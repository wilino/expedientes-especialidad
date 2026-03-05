import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { DocumentosRepository } from './documentos.repository';
import { ExpedientesService } from '../expedientes';

@Injectable()
export class DocumentosService {
  constructor(
    private readonly documentosRepo: DocumentosRepository,
    private readonly expedientesService: ExpedientesService,
  ) {}

  async create(
    expedienteId: string,
    usuarioId: string,
    file: { nombre: string; tipo: string; uri: string; buffer: Buffer },
  ) {
    await this.expedientesService.findById(expedienteId);

    const hash = createHash('sha256').update(file.buffer).digest('hex');

    return this.documentosRepo.create({
      expedienteId,
      usuarioId,
      nombre: file.nombre,
      tipo: file.tipo,
      uri: file.uri,
      hash,
    });
  }

  async findByExpedienteId(expedienteId: string, skip?: number, take?: number) {
    await this.expedientesService.findById(expedienteId);
    return this.documentosRepo.findByExpedienteId(expedienteId, { skip, take });
  }

  async findById(id: string) {
    const doc = await this.documentosRepo.findById(id);
    if (!doc) {
      throw new NotFoundException(`Documento con id "${id}" no encontrado`);
    }
    return doc;
  }
}
