import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsInt,
} from 'class-validator';
import { Gender } from '../../../common/enums/gender.enum';
import { MaritalStatus } from '../../../common/enums/marital-status.enum';
import { NeedDuration } from '../../../common/enums/need-duration.enum';

export class CreateStudentProfileDto {
  // ...outros campos...

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  specialNeedSubcategories: number[];

  // ...outros campos...
}
