import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetAllDisciplineQuery {
  @IsString()
  @IsOptional()
  name?: string;

  @IsIn(['OBG', 'OPT'], { message: 'O tipo deve ser "OBG" ou "OPT"' })
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  code?: string;
}
