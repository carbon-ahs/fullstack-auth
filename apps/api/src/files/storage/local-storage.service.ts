import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { StorageProvider, StoredFile, UploadFile } from './storage.provider.js';


@Injectable()
export class LocalStorageService implements StorageProvider {
  private readonly rootDirectory = resolve(
    process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads'),
  );

  async save(file: UploadFile, folder: string): Promise<StoredFile> {
    const directory = this.resolveInsideRoot(folder);

    await mkdir(directory, { recursive: true });

    const filename = randomUUID();
    const absolutePath = this.resolveInsideRoot(join(folder, filename));

    await writeFile(absolutePath, file.buffer, {
      flag: 'wx',
    });

    return {
      key: join(folder, filename).split(sep).join('/'),
      size: file.buffer.length,
    };
  }

  async delete(key: string): Promise<void> {
    const absolutePath = this.resolveInsideRoot(key);

    await rm(absolutePath, { force: true });
  }

  private resolveInsideRoot(path: string): string {
    const resolvedPath = resolve(this.rootDirectory, path);
    const relativePath = relative(this.rootDirectory, resolvedPath);

    if (
      !relativePath ||
      relativePath === '..' ||
      relativePath.startsWith(`..${sep}`) ||
      isAbsolute(relativePath)
    ) {
      throw new Error('Invalid storage path');
    }

    return resolvedPath;
  }

  async read(key: string): Promise<Buffer> {
    const absolutePath = this.resolveInsideRoot(key);

    return readFile(absolutePath);
  }
}
