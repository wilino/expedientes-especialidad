import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  DocumentStoragePort,
  SaveDocumentInput,
  SaveDocumentResult,
} from './document-storage.port';

@Injectable()
export class LocalDocumentStorageService implements DocumentStoragePort {
  private readonly basePath: string;
  private readonly baseFolderName: string;

  constructor(private readonly configService: ConfigService) {
    this.basePath = this.resolveBasePath();
    this.baseFolderName = path.basename(this.basePath);
  }

  async save(input: SaveDocumentInput): Promise<SaveDocumentResult> {
    const expedienteDir = path.join(this.basePath, input.expedienteId);
    await mkdir(expedienteDir, { recursive: true });

    const sanitizedName = this.sanitizeFilename(input.nombreOriginal);
    const storedName = `${Date.now()}-${randomUUID()}-${sanitizedName}`;
    const absolutePath = path.join(expedienteDir, storedName);

    await writeFile(absolutePath, input.buffer);

    return {
      uri: `${input.expedienteId}/${storedName}`,
    };
  }

  async read(uri: string): Promise<Buffer> {
    const normalizedUri = this.normalizeUri(uri);
    const absolutePath = path.resolve(this.basePath, normalizedUri);

    if (!this.isInsideBasePath(absolutePath)) {
      throw new Error('Ruta de documento inválida');
    }

    return readFile(absolutePath);
  }

  private resolveBasePath(): string {
    const configuredPath =
      this.configService.get<string>('DOCUMENTS_STORAGE_PATH') ?? 'uploads';

    return path.isAbsolute(configuredPath)
      ? configuredPath
      : path.resolve(process.cwd(), configuredPath);
  }

  private sanitizeFilename(filename: string): string {
    const baseName = path.basename(filename);
    const sanitized = baseName
      .normalize('NFKD')
      .replace(/[^\w.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');

    return sanitized || 'archivo.bin';
  }

  private normalizeUri(uri: string): string {
    const unixUri = uri.replace(/\\/g, '/').replace(/^\/+/, '');
    const legacyPrefix = `${this.baseFolderName}/`;

    if (unixUri.startsWith(legacyPrefix)) {
      return unixUri.slice(legacyPrefix.length);
    }

    return unixUri;
  }

  private isInsideBasePath(absolutePath: string): boolean {
    const relative = path.relative(this.basePath, absolutePath);
    return !relative.startsWith('..') && !path.isAbsolute(relative);
  }
}
