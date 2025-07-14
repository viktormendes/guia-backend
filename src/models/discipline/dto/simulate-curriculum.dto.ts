import { IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsBoolean } from 'class-validator';

class TimetableDto {
  @IsString()
  days: string;

  @IsString()
  hours: string;

  @IsString()
  teacher: string;
}

export class DisciplineSimulateDto {
  @IsString()
  name: string;

  @IsNumber()
  semester: number;

  @IsBoolean()
  attended: boolean;

  @IsNumber()
  workload: number;

  @IsString()
  type: 'OBG' | 'OPT';

  @IsString()
  code: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimetableDto)
  timetables: TimetableDto[];

  @IsArray()
  @IsString({ each: true })
  pre_requiriments: string[];
}

export class SimulateCurriculumDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DisciplineSimulateDto)
  disciplines: DisciplineSimulateDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferred_periods?: string[];

  @IsOptional()
  @IsNumber()
  max_workload?: number;

  @IsOptional()
  @IsNumber()
  max_optative_workload?: number;

  @IsOptional()
  @IsNumber()
  current_student_semester?: number;

  @IsOptional()
  @IsBoolean()
  ignore_tcc_period_filter?: boolean;
}
