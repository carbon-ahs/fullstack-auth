import { Inject, Injectable } from '@nestjs/common';
import * as storageProvider from './storage/storage.provider.js';

@Injectable()
export class FilesService {
  constructor(
    @Inject(storageProvider.STORAGE_PROVIDER)
    private readonly storage: storageProvider.StorageProvider,
  ) {}

  async upload(file: storageProvider.UploadFile, folder: string) {
    const storedFile = await this.storage.save(file, folder);

    return {
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: storedFile.size,
      key: storedFile.key,
    };
  }

  async delete(key: string): Promise<void> {
    await this.storage.delete(key);
  }
}