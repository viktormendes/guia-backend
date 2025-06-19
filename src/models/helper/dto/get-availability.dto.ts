import { IsEnum } from 'class-validator';
import { HelpType } from '../../help/enums/help-type.enum';

export class GetAvailabilityDto {
  @IsEnum(HelpType, {
    message:
      'helpType deve ser um dos seguintes valores: chat, video_call ou dispatch',
  })
  helpType: HelpType;
}
