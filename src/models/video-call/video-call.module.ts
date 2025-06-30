import { Module } from '@nestjs/common';
import { VideoCallGateway } from './video-call.gateway';

@Module({
  providers: [VideoCallGateway],
  exports: [VideoCallGateway],
})
export class VideoCallModule {}
