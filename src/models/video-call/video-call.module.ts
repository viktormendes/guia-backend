import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoCallGateway } from './video-call.gateway';
import { Help } from '../help/entities/help.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Help, User])],
  providers: [VideoCallGateway],
  exports: [VideoCallGateway],
})
export class VideoCallModule {}
