import { IsEnum } from 'class-validator';
import { HelpStatus } from '../enums/help-status.enum';

export class UpdateHelpStatusDto {
  @IsEnum(HelpStatus, {
    message:
      'Status inválido. Valores válidos: pending, in_progress, completed, cancelled',
  })
  status: HelpStatus;
}
