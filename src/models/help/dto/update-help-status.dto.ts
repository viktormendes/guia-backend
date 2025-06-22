import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { HelpStatus } from '../enums/help-status.enum';

export class UpdateHelpStatusDto {
  @IsNumber()
  @IsNotEmpty()
  helpId: number;

  @IsEnum(HelpStatus)
  @IsNotEmpty()
  status: HelpStatus;
}
