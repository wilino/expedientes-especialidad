export const DOCUMENT_STORAGE = Symbol('DOCUMENT_STORAGE');

export interface SaveDocumentInput {
  expedienteId: string;
  nombreOriginal: string;
  mimeType?: string;
  buffer: Buffer;
}

export interface SaveDocumentResult {
  uri: string;
}

export interface DocumentStoragePort {
  save(input: SaveDocumentInput): Promise<SaveDocumentResult>;
  read(uri: string): Promise<Buffer>;
}
