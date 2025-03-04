import { IsOptional, IsString } from 'class-validator';

export class GetAllEducatorQuery {
  @IsString()
  @IsOptional()
  name?: string;
}
