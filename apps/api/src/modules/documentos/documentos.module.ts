import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { DocumentosRepository } from './documentos.repository';
import { ExpedientesModule } from '../expedientes';
import { DOCUMENTOS_REPOSITORY } from './documentos.repository.port';
import { DOCUMENT_STORAGE } from './document-storage.port';
import { LocalDocumentStorageService } from './local-document-storage.service';
import { S3DocumentStorageService } from './s3-document-storage.service';

@Module({
  imports: [ExpedientesModule],
  controllers: [DocumentosController],
  providers: [
    DocumentosService,
    DocumentosRepository,
    LocalDocumentStorageService,
    S3DocumentStorageService,
    { provide: DOCUMENTOS_REPOSITORY, useExisting: DocumentosRepository },
    {
      provide: DOCUMENT_STORAGE,
      inject: [
        ConfigService,
        LocalDocumentStorageService,
        S3DocumentStorageService,
      ],
      useFactory: (
        configService: ConfigService,
        localStorage: LocalDocumentStorageService,
        s3Storage: S3DocumentStorageService,
      ) => {
        const driver = (
          configService.get<string>('DOCUMENTS_STORAGE_DRIVER') ?? 'local'
        )
          .trim()
          .toLowerCase();

        if (driver === 's3' || driver === 'minio') {
          return s3Storage;
        }

        return localStorage;
      },
    },
  ],
  exports: [DocumentosService],
})
export class DocumentosModule {}
