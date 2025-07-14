import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
  IsInt,
  MaxLength,
} from 'class-validator';
import { Gender } from '../../../common/enums/gender.enum';
import { MaritalStatus } from '../../../common/enums/marital-status.enum';
import { NeedDuration } from '../../../common/enums/need-duration.enum';

export class CreateStudentDto {
  // Dados básicos do usuário
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  // Dados do perfil - Pessoais
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(14)
  cpf?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  rg?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  // Dados acadêmicos
  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;

  // Dados de endereço
  @IsOptional()
  @IsString()
  cep?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  complement?: string;

  // NOVO: Necessidades especiais (array de subcategorias)
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  specialNeedSubcategories: number[];

  @IsOptional()
  @IsEnum(NeedDuration)
  needDuration?: NeedDuration;

  // Dados de controle
  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsString()
  supportNotes?: string;

  @IsOptional()
  @IsBoolean()
  isStudent?: boolean;
}
