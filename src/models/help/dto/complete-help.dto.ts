import { IsNotEmpty, IsNumber } from 'class-validator';

export class CompleteHelpDto {
  @IsNumber()
  @IsNotEmpty()
  helpId: number;
}
