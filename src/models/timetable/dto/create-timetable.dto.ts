import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTimetableDto {
  @IsInt()
  @IsNotEmpty()
  disciplineId: number;

  @IsInt()
  @IsOptional()
  educatorId?: number;

  @IsInt()
  @IsOptional()
  roomId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  days: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  hours: string;
}

export class UpdateTimetableDto extends CreateTimetableDto {}
