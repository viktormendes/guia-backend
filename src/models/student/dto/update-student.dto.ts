import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Gender } from '../../../common/enums/gender.enum';
import { MaritalStatus } from '../../../common/enums/marital-status.enum';
import { NeedDuration } from '../../../common/enums/need-duration.enum';

export class UpdateStudentDto {
  // Dados básicos do usuário
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  // Dados do perfil - Pessoais
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
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

  // Dados de necessidades especiais
  @IsOptional()
  @IsNumber()
  specialNeedId?: number;

  @IsOptional()
  @IsNumber()
  specialNeedSubcategoryId?: number;

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
