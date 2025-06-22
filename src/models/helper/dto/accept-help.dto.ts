import { IsNotEmpty, IsNumber } from 'class-validator';

export class AcceptHelpDto {
  @IsNumber()
  @IsNotEmpty()
  helpId: number;
}
