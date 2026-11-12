import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadFileDto } from './dto/upload-file.dto.js';
import { FilesService } from './files.service.js';
import { basename } from 'node:path';



@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.filesService.upload(
      {
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
      },
      dto.purpose,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.filesService.findOne(id);
  }

  @Get(':id/download')
  @Header('X-Content-Type-Options', 'nosniff')
  async download(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    const file = await this.filesService.download(id);

    const filename =
      basename(file.originalName.replaceAll('\\', '/'))
        .replace(/[\r\n"]/g, '_')
        .replace(/[^\x20-\x7E]/g, '_') || `file-${id}`;

    return new StreamableFile(file.buffer, {
      type: file.mimeType,
      disposition: `attachment; filename="${filename}"`,
    });
  }
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.filesService.delete(id);
  }
}

