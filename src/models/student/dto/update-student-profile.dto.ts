import { IsArray, ArrayNotEmpty, IsInt, IsOptional } from 'class-validator';

export class UpdateStudentProfileDto {
  // ...outros campos...

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  specialNeedSubcategories?: number[];

  // ...outros campos...
}
