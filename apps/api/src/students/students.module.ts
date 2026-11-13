import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller.js';
import { StudentsService } from './students.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { FilesModule } from '../files/files.module.js';

@Module({
  imports: [FilesModule],
  controllers: [StudentsController],
  providers: [StudentsService, PrismaService],
})
export class StudentsModule {}
