import { Occupation } from '../../../common/enums/occupation.enum';
import { Gender } from '../../../common/enums/gender.enum';
import { MaritalStatus } from '../../../common/enums/marital-status.enum';
import { NeedDuration } from '../../../common/enums/need-duration.enum';

export class StudentListDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: string;
  occupation?: Occupation;
  createdAt: Date;
  updatedAt: Date;

  // Dados do perfil
  phoneNumber?: string;
  cpf?: string;
  rg?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  birthDate?: Date;
  course?: string;
  enrollmentDate?: Date;

  // Endereço
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  number?: string;
  complement?: string;

  // Necessidades especiais (novo formato)
  specialNeeds?: Array<{
    specialNeedId: number;
    specialNeedName: string;
    specialNeedSubcategoryId: number;
    specialNeedSubcategoryName: string;
  }>;
  needDuration?: NeedDuration;

  // Dados de controle
  observations?: string;
  supportNotes?: string;
  isStudent: boolean;
}
