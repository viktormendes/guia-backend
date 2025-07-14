import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Occupation } from '../../../common/enums/occupation.enum';

export class CreateHelperDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Occupation)
  occupation: Occupation;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
