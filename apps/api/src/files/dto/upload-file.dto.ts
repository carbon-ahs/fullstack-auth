import { IsEnum } from 'class-validator';
import { FilePurpose } from '../file-purpose.enum.js';

export class UploadFileDto {
  @IsEnum(FilePurpose)
  purpose!: FilePurpose;
}
