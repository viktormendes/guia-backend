import { IsEnum, IsBoolean } from 'class-validator';
import { HelpType } from '../../help/enums/help-type.enum';

export class SetAvailabilityDto {
  @IsEnum(HelpType, {
    message:
      'helpType deve ser um dos seguintes valores: chat, video_call ou dispatch',
  })
  helpType: HelpType;

  @IsBoolean()
  isAvailable: boolean;
}
