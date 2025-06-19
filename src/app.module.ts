import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresConfigModule } from './config/database/postgres/config.module';
import { DisciplineModule } from './models/discipline/discipline.module';
import { EducatorModule } from './models/educator/educator.module';
import { TimetableModule } from './models/timetable/timetable.module';
import { PrerequisiteModule } from './models/prerequisite/prerequisite.module';
import { AuthModule } from './authentication/auth.module';
import { UserModule } from './models/user/user.module';
import { BlockModule } from './models/block/block.module';
import { RoomModule } from './models/room/room.module';
import { HelpModule } from './models/help/help.module';
import { ChatModule } from './models/chat/chat.module';
import { RedisModule } from './redis/redis.module';
import { HelperModule } from './models/helper/helper.module';

@Module({
  imports: [
    PostgresConfigModule,
    DisciplineModule,
    EducatorModule,
    TimetableModule,
    PrerequisiteModule,
    AuthModule,
    UserModule,
    BlockModule,
    RoomModule,
    HelpModule,
    ChatModule,
    RedisModule,
    HelperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
