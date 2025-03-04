import {
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  IsEnum,
  IsIn,
} from 'class-validator';

enum DisciplineType {
  OBG = 'OBG',
  OPT = 'OPT',
}

export class CreateDisciplineDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @IsInt()
  @IsNotEmpty()
  @IsIn([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  semester: number;

  @IsInt()
  @IsNotEmpty()
  @IsIn([40, 80])
  workload: number;

  @IsEnum(DisciplineType)
  @IsNotEmpty()
  type: DisciplineType;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\.\d{3}\.\d{2}$/, {
    message: 'code must match the format xx.xxx.xx',
  })
  code: string;
}
