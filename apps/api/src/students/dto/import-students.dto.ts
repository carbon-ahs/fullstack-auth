import { IsInt, Min } from 'class-validator';

export class ImportStudentsDto {
  @IsInt()
  @Min(1)
  fileId!: number;
}
