import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresConfigModule } from './config/database/postgres/config.module';
import { DisciplineModule } from './models/discipline/discipline.module';
import { EducatorModule } from './models/educator/educator.module';
import { TimetableModule } from './models/timetable/timetable.module';
import { PrerequisiteModule } from './models/prerequisite/prerequisite.module';

@Module({
  imports: [
    PostgresConfigModule,
    DisciplineModule,
    EducatorModule,
    TimetableModule,
    PrerequisiteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
