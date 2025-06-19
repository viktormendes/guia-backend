import { IsOptional, IsString } from 'class-validator';

export class SendFCMTokenDto {
  @IsOptional()
  @IsString()
  fcm_token: string;
}
