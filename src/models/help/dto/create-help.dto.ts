import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { HelpType } from '../enums/help-type.enum';

export class CreateHelpDto {
  @IsEnum(HelpType, {
    message:
      'Tipo de ajuda inválido. Valores válidos: chat, video_call, dispatch',
  })
  @IsNotEmpty()
  helpType: HelpType;

  @IsString()
  @IsNotEmpty()
  description: string;
}
