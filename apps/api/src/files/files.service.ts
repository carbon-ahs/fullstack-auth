import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { extname } from 'node:path';
import { FilePurpose } from './file-purpose.enum.js';

// Attention, here used type import
import {
  STORAGE_PROVIDER,
  type StorageProvider,
  type StoredFile,
  type UploadFile,
} from './storage/storage.provider.js';
import { PrismaService } from '../prisma/prisma.service.js';



const MAX_MB = 1024 * 1024;

const UPLOAD_RULES = {
  [FilePurpose.STUDENT_IMPORT]: {
    folder: 'students/imports',
    maxSize: 5 * MAX_MB,
    extensions: ['.csv'],
    mimeTypes: [
      'text/csv',
      'application/vnd.ms-excel',
      'text/plain',
      'application/octet-stream',
    ],
  },

  [FilePurpose.PROFILE_IMAGE]: {
    folder: 'profile-images',
    maxSize: 2 * MAX_MB,
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },

  [FilePurpose.DOCUMENT]: {
    folder: 'documents',
    maxSize: 10 * MAX_MB,
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf', 'application/octet-stream'],
  },
};

@Injectable()
export class FilesService {
  // @ts-ignore
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storage: StorageProvider,
    private readonly prisma: PrismaService,
  ) {}

  async upload(file: UploadFile, purpose: FilePurpose) {
    const rules = UPLOAD_RULES[purpose];

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Uploaded file is empty');
    }

    if (file.buffer.length > rules.maxSize) {
      throw new PayloadTooLargeException('File exceeds the allowed size');
    }

    const extension = extname(file.originalName).toLowerCase();
    const mimeType = file.mimeType.split(';')[0].trim().toLowerCase();

    if (!rules.extensions.includes(extension)) {
      throw new BadRequestException('File extension is not allowed');
    }

    if (!rules.mimeTypes.includes(mimeType)) {
      throw new BadRequestException('File type is not allowed');
    }

    const storedFile = await this.storage.save(file, rules.folder);

    try {
      const uploadedFile = await this.prisma.db.orm.public.UploadedFile.create({
        originalName: file.originalName,
        storageKey: storedFile.key,
        mimeType,
        size: storedFile.size,
        purpose,
      });

      return {
        id: uploadedFile.id,
        originalName: uploadedFile.originalName,
        mimeType: uploadedFile.mimeType,
        size: uploadedFile.size,
        purpose: uploadedFile.purpose,
        createdAt: uploadedFile.createdAt,
      };
    } catch (error) {
      // Database insertion failed. Remove the physical file.
      await this.storage.delete(storedFile.key);

      throw error;
    }
  }

  async delete(id: number) {
    const file = await this.prisma.db.orm.public.UploadedFile.where({
      id,
    }).first();

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Delete the physical file first.
    await this.storage.delete(file.storageKey);

    // Then remove its database record.
    const deletedFile = await this.prisma.db.orm.public.UploadedFile.where({
      id,
    }).delete();

    if (!deletedFile) {
      throw new NotFoundException('File not found');
    }

    return {
      message: 'File deleted successfully',
      id: deletedFile.id,
    };
  }

  async findOne(id: number) {
    const file = await this.prisma.db.orm.public.UploadedFile.where({
      id,
    }).first();

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return {
      id: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      purpose: file.purpose,
      createdAt: file.createdAt,
    };
  }

  async download(id: number) {
    const file = await this.prisma.db.orm.public.UploadedFile.where({
      id,
    }).first();

    if (!file) {
      throw new NotFoundException('File not found');
    }

    try {
      const buffer = await this.storage.read(file.storageKey);

      return {
        buffer,
        originalName: file.originalName,
        mimeType: file.mimeType,
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        throw new NotFoundException('Stored file not found');
      }

      throw error;
    }
  }
}
