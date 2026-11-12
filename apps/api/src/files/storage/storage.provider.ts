export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');

export interface UploadFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export interface StoredFile {
  key: string;
  size: number;
}

export interface StorageProvider {
  save(file: UploadFile, folder: string): Promise<StoredFile>;

  delete(key: string): Promise<void>;
}
