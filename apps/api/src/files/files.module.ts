import { Module } from '@nestjs/common';
import { FilesController } from './files.controller.js';
import { FilesService } from './files.service.js';
import { LocalStorageService } from './storage/local-storage.service.js';
import { STORAGE_PROVIDER } from './storage/storage.provider.js';

@Module({
  controllers: [FilesController],
  providers: [
    FilesService,
    LocalStorageService,
    {
      provide: STORAGE_PROVIDER,
      useExisting: LocalStorageService,
    },
  ],
  exports: [FilesService],
})
export class FilesModule {}

