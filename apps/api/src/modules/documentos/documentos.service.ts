import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { EXPEDIENTES_LOOKUP, ExpedientesLookupPort } from '../expedientes';
import {
  DOCUMENTOS_REPOSITORY,
  DocumentosRepositoryPort,
} from './documentos.repository.port';
import { DOCUMENT_STORAGE, DocumentStoragePort } from './document-storage.port';

@Injectable()
export class DocumentosService {
  constructor(
    @Inject(DOCUMENTOS_REPOSITORY)
    private readonly documentosRepo: DocumentosRepositoryPort,
    @Inject(DOCUMENT_STORAGE)
    private readonly documentStorage: DocumentStoragePort,
    @Inject(EXPEDIENTES_LOOKUP)
    private readonly expedientesLookup: ExpedientesLookupPort,
  ) {}

  async create(
    expedienteId: string,
    usuarioId: string,
    file: { nombre: string; tipo: string; buffer: Buffer },
  ) {
    await this.expedientesLookup.findByIdOrThrow(expedienteId);

    const hash = createHash('sha256').update(file.buffer).digest('hex');
    const storedFile = await this.documentStorage.save({
      expedienteId,
      nombreOriginal: file.nombre,
      mimeType: file.tipo,
      buffer: file.buffer,
    });

    return this.documentosRepo.create({
      expedienteId,
      usuarioId,
      nombre: file.nombre,
      tipo: file.tipo,
      uri: storedFile.uri,
      hash,
    });
  }

  async findByExpedienteId(expedienteId: string, skip?: number, take?: number) {
    await this.expedientesLookup.findByIdOrThrow(expedienteId);
    return this.documentosRepo.findByExpedienteId(expedienteId, { skip, take });
  }

  async findById(expedienteId: string, id: string) {
    await this.expedientesLookup.findByIdOrThrow(expedienteId);

    const doc = await this.documentosRepo.findByIdAndExpediente(
      id,
      expedienteId,
    );
    if (!doc) {
      throw new NotFoundException(`Documento con id "${id}" no encontrado`);
    }
    return doc;
  }

  async download(expedienteId: string, id: string) {
    const doc = await this.findById(expedienteId, id);

    try {
      const buffer = await this.documentStorage.read(doc.uri);
      return { doc, buffer };
    } catch {
      throw new NotFoundException(
        `Archivo físico para documento "${id}" no encontrado`,
      );
    }
  }
}
