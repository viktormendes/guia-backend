import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';
import { RoomType } from '../enums/room-type.enum';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  floor: number;

  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @IsEnum(RoomType)
  @IsNotEmpty()
  type: RoomType;

  @IsNumber()
  @IsNotEmpty()
  block_id: number;
}
