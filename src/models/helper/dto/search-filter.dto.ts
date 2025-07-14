import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Occupation } from '../../../common/enums/occupation.enum';

export class SearchDto {
  @IsOptional()
  @IsString()
  search?: string;
}

export class FilterDto {
  @IsOptional()
  @IsEnum(Occupation)
  occupation?: Occupation;
}

export class SearchFilterDto extends SearchDto {
  @IsOptional()
  @IsEnum(Occupation)
  occupation?: Occupation;
}
