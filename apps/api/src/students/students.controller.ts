import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ImportStudentsDto } from './dto/import-students.dto.js';
import { StudentsService } from './students.service.js';
import { FindStudentsQueryDto } from './dto/find-students-query.dto.js';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('import')
  importFromCsv(@Body() dto: ImportStudentsDto) {
    return this.studentsService.importFromCsv(dto.fileId);
  }

  @Get()
  findAll(@Query() query: FindStudentsQueryDto) {
    return this.studentsService.findAll(query);
  }
}
