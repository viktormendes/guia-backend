import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Help } from './entities/help.entity';
import { User } from '../user/entities/user.entity';
import { HelpRequestService } from './help-request.service';
import { HelpController } from './help.controller';
import { HelperModule } from '../helper/helper.module';
import { StudentModule } from '../student/student.module';
import { FirebaseModule } from '../../firebase/firebase.module';
import { RedisModule } from '../../redis/redis.module';
import { HelpService } from './help.service';
import { HelpAnalyticsController } from './help-analytics.controller';
import { HelpAnalyticsService } from './help-analytics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Help, User]),
    forwardRef(() => HelperModule),
    forwardRef(() => StudentModule),
    FirebaseModule,
    RedisModule,
  ],
  controllers: [HelpController, HelpAnalyticsController],
  providers: [HelpRequestService, HelpService, HelpAnalyticsService],
  exports: [HelpRequestService, HelpService, HelpAnalyticsService],
})
export class HelpModule {}
