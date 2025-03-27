import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';
import { BlockStatus } from '../enums/block-status.enum';

export class CreateBlockDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  number_of_floors: number;

  @IsEnum(BlockStatus)
  @IsNotEmpty()
  status: BlockStatus;
}
