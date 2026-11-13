import {
  BadRequestException,
  ConflictException,
  Injectable,
  PayloadTooLargeException,
} from '@nestjs/common';

import { Readable } from 'node:stream';
import csvParser from 'csv-parser';
import { FilesService } from '../files/files.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { FilePurpose } from '../files/file-purpose.enum.js';
import { FindStudentsQueryDto } from './dto/find-students-query.dto.js';
import { and, or } from '@prisma/orm-postgres/orm-client';

interface CsvStudentRow {
  name?: string;
  cadet_number?: string;
  class?: string;
  [key: string]: string | undefined;
}

interface StudentInput {
  name: string;
  cadetNumber: string;
  classLevel: number;
}

const MAX_IMPORT_RECORDS = 5000;

@Injectable()
export class StudentsService {
  constructor(
    private readonly filesService: FilesService,
    private readonly prisma: PrismaService,
  ) {}

  async importFromCsv(fileId: number) {
    // 1. Retrieve uploaded file
    const file = await this.filesService.download(fileId);

    // 2. Check file purpose
    if (file.purpose !== FilePurpose.STUDENT_IMPORT) {
      throw new BadRequestException(
        'Uploaded file is not a student import CSV',
      );
    }

    // 3. Parse CSV
    const rows = await this.parseCsv(file.buffer);

    // 4. Validate records
    const students = this.validateRows(rows);

    // 5. Insert into PostgreSQL
    try {
      const createdStudents =
        await this.prisma.db.orm.public.Student.createAll(students);

      return {
        message: 'Students imported successfully',
        fileId,
        importedCount: createdStudents.length,
      };
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('One or more cadet numbers already exist');
      }

      throw error;
    }
  }

  private parseCsv(buffer: Buffer): Promise<CsvStudentRow[]> {
    return new Promise((resolve, reject) => {
      const rows: CsvStudentRow[] = [];
      let headers: string[] = [];

      const parser = csvParser({
        strict: true,
        maxRowBytes: 1024 * 1024,
        mapHeaders: ({ header }) =>
          header
            .replace(/^\uFEFF/, '')
            .trim()
            .toLowerCase(),
      });

      parser.on('headers', (receivedHeaders: string[]) => {
        headers = receivedHeaders;
      });

      parser.on('data', (row: CsvStudentRow) => {
        rows.push(row);
      });

      parser.on('error', () => {
        reject(new BadRequestException('Invalid CSV format'));
      });

      parser.on('end', () => {
        if (headers.length === 0) {
          reject(new BadRequestException('CSV header row is missing'));
          return;
        }

        if (new Set(headers).size !== headers.length) {
          reject(
            new BadRequestException('Duplicate CSV headers are not allowed'),
          );
          return;
        }

        const requiredHeaders = ['name', 'cadet_number', 'class'];

        const missingHeaders = requiredHeaders.filter(
          (header) => !headers.includes(header),
        );

        if (missingHeaders.length > 0) {
          reject(
            new BadRequestException({
              message: 'Invalid CSV headers',
              missingHeaders,
              requiredHeaders,
            }),
          );
          return;
        }

        resolve(rows);
      });

      Readable.from([buffer]).pipe(parser);
    });
  }

  private validateRows(rows: CsvStudentRow[]): StudentInput[] {
    if (rows.length === 0) {
      throw new BadRequestException('CSV contains no student records');
    }

    if (rows.length > MAX_IMPORT_RECORDS) {
      throw new PayloadTooLargeException(
        `Maximum ${MAX_IMPORT_RECORDS} student records allowed per import`,
      );
    }

    const students: StudentInput[] = [];
    const errors: string[] = [];
    const cadetNumbers = new Set<string>();

    rows.forEach((row, index) => {
      const record = index + 1;

      const name = row.name?.trim() ?? '';
      const cadetNumber = row.cadet_number?.trim() ?? '';
      const classValue = row.class?.trim() ?? '';

      let valid = true;

      if (!name) {
        errors.push(`Record ${record}: name is required`);
        valid = false;
      }

      if (!cadetNumber) {
        errors.push(`Record ${record}: cadet_number is required`);
        valid = false;
      } else if (cadetNumbers.has(cadetNumber)) {
        errors.push(`Record ${record}: duplicate cadet number ${cadetNumber}`);
        valid = false;
      } else {
        cadetNumbers.add(cadetNumber);
      }

      const classLevel = Number(classValue);

      if (
        !/^\d+$/.test(classValue) ||
        !Number.isSafeInteger(classLevel) ||
        classLevel < 1
      ) {
        errors.push(`Record ${record}: invalid class value`);
        valid = false;
      }

      if (valid) {
        students.push({
          name,
          cadetNumber,
          classLevel,
        });
      }
    });

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'CSV validation failed',
        errors,
      });
    }

    return students;
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'sqlState' in error &&
      error.sqlState === '23505'
    );
  }

  async findAll(query: FindStudentsQueryDto) {
    const { page, limit, classLevel } = query;
    const search = query.search?.trim();

    const offset = (page - 1) * limit;

    const students = this.prisma.db.orm.public.Student;

    // Build filters
    const filteredStudents =
      search && classLevel !== undefined
        ? students.where((student) =>
            and(
              student.classLevel.eq(classLevel),
              or(
                student.name.ilike(`%${search}%`),
                student.cadetNumber.ilike(`%${search}%`),
              ),
            ),
          )
        : search
          ? students.where((student) =>
              or(
                student.name.ilike(`%${search}%`),
                student.cadetNumber.ilike(`%${search}%`),
              ),
            )
          : classLevel !== undefined
            ? students.where({ classLevel })
            : students;

    // Fetch one extra record to determine whether another page exists.
    const [records, countResult] = await Promise.all([
      filteredStudents
        .select('id', 'name', 'cadetNumber', 'classLevel')
        .orderBy((student) => student.id.asc())
        .limit(limit + 1)
        .offset(offset)
        .all(),

      filteredStudents.aggregate((aggregate) => ({
        total: aggregate.count(),
      })),
    ]);

    const hasNextPage = records.length > limit;

    return {
      data: records.slice(0, limit),
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit),
        hasNextPage,
      },
    };
  }
}
