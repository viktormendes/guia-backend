import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateEducatorDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  lattesLink: string;
}
