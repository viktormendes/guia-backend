import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { DispatchGateway } from './dispatch.gateway';
import { UserLocation } from '../user/entities/user-location.entity';
import { UserLocationService } from '../user/user-location.service';
import { HelpRequestService } from '../help/help-request.service';
import { HelperService } from '../helper/helper.service';
import { RedisService } from '../../redis/redis.service';
import { FirebaseService } from '../../firebase/firebase.service';
import { StudentGateway } from '../student/student.gateway';
import { HelperGateway } from '../helper/helper.gateway';
import { User } from '../user/entities/user.entity';
import { Help } from '../help/entities/help.entity';
import { UserModule } from '../user/user.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserLocation, User, Help]),
    UserModule,
    CommonModule,
  ],
  controllers: [DispatchController],
  providers: [
    DispatchService,
    DispatchGateway,
    UserLocationService,
    HelpRequestService,
    HelperService,
    RedisService,
    FirebaseService,
    StudentGateway,
    HelperGateway,
  ],
  exports: [DispatchService, DispatchGateway, UserLocationService],
})
export class DispatchModule {}
