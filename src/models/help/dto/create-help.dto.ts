import { IsEnum, IsNotEmpty } from 'class-validator';
import { HelpType } from '../enums/help-type.enum';

export class CreateHelpDto {
  @IsEnum(HelpType)
  @IsNotEmpty()
  type: HelpType;
}
