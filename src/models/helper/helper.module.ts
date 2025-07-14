import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperAvailability } from './entities/helper-availability.entity';
import { User } from '../user/entities/user.entity';
import { HelperService } from './helper.service';
import { HelperController } from './helper.controller';
import { RedisModule } from '../../redis/redis.module';
import { FirebaseModule } from '../../firebase/firebase.module';
import { HelpModule } from '../help/help.module';
import { HelperGateway } from './helper.gateway';
import { UserModule } from '../user/user.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HelperAvailability, User]),
    RedisModule,
    FirebaseModule,
    forwardRef(() => HelpModule),
    UserModule,
    CommonModule,
  ],
  providers: [HelperService, HelperGateway],
  controllers: [HelperController],
  exports: [HelperService, HelperGateway],
})
export class HelperModule {}
