import { IsOptional, IsPositive, Min, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrder } from '../../helper/dto/pagination.dto';

export class SpecialNeedPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
