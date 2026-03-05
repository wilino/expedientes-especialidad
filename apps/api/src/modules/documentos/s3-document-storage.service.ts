import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { Readable } from 'node:stream';
import {
  DocumentStoragePort,
  SaveDocumentInput,
  SaveDocumentResult,
} from './document-storage.port';

interface ParsedS3Uri {
  bucket: string;
  key: string;
}

interface TransformableBody {
  transformToByteArray: () => Promise<Uint8Array>;
}

@Injectable()
export class S3DocumentStorageService implements DocumentStoragePort {
  private readonly client: S3Client;
  private readonly defaultBucket: string;
  private readonly keyPrefix: string;

  constructor(private readonly configService: ConfigService) {
    this.client = this.createClient();
    this.defaultBucket =
      this.configService.get<string>('DOCUMENTS_STORAGE_S3_BUCKET') ??
      'expedientes-docs';
    this.keyPrefix = this.normalizePrefix(
      this.configService.get<string>('DOCUMENTS_STORAGE_S3_PREFIX') ?? '',
    );
  }

  async save(input: SaveDocumentInput): Promise<SaveDocumentResult> {
    const fileName = this.sanitizeFilename(input.nombreOriginal);
    const keyParts = [
      this.keyPrefix,
      input.expedienteId,
      `${Date.now()}-${randomUUID()}-${fileName}`,
    ].filter(Boolean);
    const key = keyParts.join('/');

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.defaultBucket,
        Key: key,
        Body: input.buffer,
        ContentType: input.mimeType ?? 'application/octet-stream',
      }),
    );

    return {
      uri: `s3://${this.defaultBucket}/${key}`,
    };
  }

  async read(uri: string): Promise<Buffer> {
    const { bucket, key } = this.parseUri(uri);

    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new Error('Archivo no encontrado en storage S3');
    }

    return this.bodyToBuffer(response.Body);
  }

  private createClient(): S3Client {
    const endpoint = this.configService.get<string>(
      'DOCUMENTS_STORAGE_S3_ENDPOINT',
    );
    const region =
      this.configService.get<string>('DOCUMENTS_STORAGE_S3_REGION') ??
      'us-east-1';
    const forcePathStyle = this.parseBoolean(
      this.configService.get<string>('DOCUMENTS_STORAGE_S3_FORCE_PATH_STYLE'),
      true,
    );

    const accessKeyId = this.configService.get<string>(
      'DOCUMENTS_STORAGE_S3_ACCESS_KEY',
    );
    const secretAccessKey = this.configService.get<string>(
      'DOCUMENTS_STORAGE_S3_SECRET_KEY',
    );

    return new S3Client({
      region,
      endpoint: endpoint || undefined,
      forcePathStyle,
      credentials:
        accessKeyId && secretAccessKey
          ? { accessKeyId, secretAccessKey }
          : undefined,
    });
  }

  private parseUri(uri: string): ParsedS3Uri {
    if (uri.startsWith('s3://')) {
      const withoutScheme = uri.slice('s3://'.length);
      const [bucket, ...keyParts] = withoutScheme.split('/');
      const key = keyParts.join('/');

      if (!bucket || !key) {
        throw new Error('URI S3 inválida');
      }

      return { bucket, key };
    }

    const key = uri.replace(/^\/+/, '');
    if (!key) {
      throw new Error('Key S3 inválido');
    }

    return { bucket: this.defaultBucket, key };
  }

  private async bodyToBuffer(body: unknown): Promise<Buffer> {
    if (Buffer.isBuffer(body)) {
      return body;
    }

    if (body instanceof Uint8Array) {
      return Buffer.from(body);
    }

    if (this.isTransformableBody(body)) {
      const bytes = await body.transformToByteArray();
      return Buffer.from(bytes);
    }

    if (body instanceof Readable) {
      const chunks: Buffer[] = [];
      for await (const chunk of body) {
        chunks.push(this.chunkToBuffer(chunk));
      }
      return Buffer.concat(chunks);
    }

    throw new Error('Tipo de stream S3 no soportado');
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

  private normalizePrefix(prefix: string): string {
    return prefix.replace(/^\/+|\/+$/g, '');
  }

  private parseBoolean(value: string | undefined, fallback: boolean): boolean {
    if (!value) {
      return fallback;
    }

    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }

  private isTransformableBody(body: unknown): body is TransformableBody {
    return (
      typeof body === 'object' &&
      body !== null &&
      'transformToByteArray' in body &&
      typeof body.transformToByteArray === 'function'
    );
  }

  private chunkToBuffer(chunk: unknown): Buffer {
    if (Buffer.isBuffer(chunk)) {
      return chunk;
    }

    if (chunk instanceof Uint8Array) {
      return Buffer.from(chunk);
    }

    if (typeof chunk === 'string') {
      return Buffer.from(chunk);
    }

    throw new Error('Chunk de stream S3 no soportado');
  }
}
