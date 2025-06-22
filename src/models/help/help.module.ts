import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Help } from './entities/help.entity';
import { User } from '../user/entities/user.entity';
import { HelpRequestService } from './help-request.service';
import { HelpController } from './help.controller';
import { HelperModule } from '../helper/helper.module';
import { FirebaseModule } from '../../firebase/firebase.module';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Help, User]),
    forwardRef(() => HelperModule),
    FirebaseModule,
    RedisModule,
  ],
  controllers: [HelpController],
  providers: [HelpRequestService],
  exports: [HelpRequestService],
})
export class HelpModule {}
