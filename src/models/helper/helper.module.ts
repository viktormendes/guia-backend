import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperAvailability } from './entities/helper-availability.entity';
import { User } from '../user/entities/user.entity';
import { HelperService } from './helper.service';
import { HelperController } from './helper.controller';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([HelperAvailability, User]), RedisModule],
  providers: [HelperService],
  controllers: [HelperController],
  exports: [HelperService],
})
export class HelperModule {}
